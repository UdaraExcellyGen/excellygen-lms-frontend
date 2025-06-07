import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  searchUsers,
  promoteToSuperAdmin,
  User, 
  CreateUserDto, 
  UpdateUserDto 
} from '../../../../api/services/userService';
import { FilterState } from '../types';

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useUsers = () => {
  const { user: currentUser } = useAuth();
  
  // Permission checks - UPDATED for case-insensitivity
  const isSuperAdmin = useMemo(() => {
    return currentUser?.roles.some(role => 
      role.toLowerCase() === 'superadmin'
    ) || false;
  }, [currentUser]);
  
  const isRegularAdmin = useMemo(() => {
    return currentUser?.roles.some(role => role.toLowerCase() === 'admin') && 
           !currentUser?.roles.some(role => role.toLowerCase() === 'superadmin') || 
           false;
  }, [currentUser]);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Cache for client-side filtering
  
  // UI states
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingFilteredData, setIsFetchingFilteredData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPromotingToSuperAdmin, setIsPromotingToSuperAdmin] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Temporary password states
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    tempPassword: string;
  } | null>(null);
  
  // Form states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<CreateUserDto, 'id'>>({
    name: '',
    email: '',
    phone: '',
    roles: ['Learner'],
    department: '',
    password: ''
  });
  // Added state for temporary password generation
  const [generateTempPassword, setGenerateTempPassword] = useState(true);

  // Filter states
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    selectedRoles: [],
    filterStatus: 'all'
  });
  
  const debouncedSearchTerm = useDebounce(filterState.searchTerm, 300);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset generateTempPassword when editing state changes
  useEffect(() => {
    setGenerateTempPassword(!editingUser ? true : false);
  }, [editingUser]);

  // Permission check methods - UPDATED for SuperAdmin to have full control
  const canDeleteUser = useCallback((user: User) => {
    // SuperAdmin can delete anyone except themselves
    if (isSuperAdmin) {
      return user.id !== currentUser?.id;
    }
    
    // Regular Admin can only delete non-admin users
    if (isRegularAdmin) {
      return !user.roles.some(role => 
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'
      );
    }
    
    // Non-admin users cannot delete anyone
    return false;
  }, [isSuperAdmin, isRegularAdmin, currentUser]);

  const canEditUser = useCallback((user: User) => {
    // SuperAdmin can edit anyone (including themselves)
    if (isSuperAdmin) {
      return true;
    }
    
    // Regular Admin can only edit non-admin users
    if (isRegularAdmin) {
      return !user.roles.some(role => 
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'
      );
    }
    
    // Non-admin users cannot edit anyone
    return false;
  }, [isSuperAdmin, isRegularAdmin]);

  const canCreateUserWithRole = useCallback((role: string) => {
    // Only SuperAdmin can create another SuperAdmin
    if (role.toLowerCase() === 'superadmin') {
      return isSuperAdmin;
    }
    
    // Both Admin and SuperAdmin can create users with other roles
    return isSuperAdmin || isRegularAdmin;
  }, [isSuperAdmin, isRegularAdmin]);

  const getAvailableRoles = useCallback(() => {
    if (isSuperAdmin) {
      return ['Admin', 'SuperAdmin', 'Learner', 'CourseCoordinator', 'ProjectManager'];
    } else {
      return ['Admin', 'Learner', 'CourseCoordinator', 'ProjectManager'];
    }
  }, [isSuperAdmin]);

  // Case-insensitive role comparison helper
  const roleMatches = (userRole: string, filterRole: string) => {
    return userRole.toLowerCase() === filterRole.toLowerCase();
  };

  // Client-side filtering implementation with case-insensitive role comparison
  const filteredUsers = useMemo(() => {
    if (allUsers.length > 0) {
      return allUsers.filter(user => {
        // Search term filter
        const matchesSearch = !debouncedSearchTerm || 
          user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        // Role filter with case-insensitive comparison
        const matchesRoles = filterState.selectedRoles.length === 0 || 
          user.roles.some(userRole => 
            filterState.selectedRoles.some(filterRole => 
              roleMatches(userRole, filterRole)
            )
          );
        
        // Status filter
        const matchesStatus = filterState.filterStatus === 'all' || 
          user.status === filterState.filterStatus;
        
        return matchesSearch && matchesRoles && matchesStatus;
      });
    }
    return []; // Return empty array to avoid circular dependency
  }, [allUsers, debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus]);

  // Server-side filtering effect
  useEffect(() => {
    if (allUsers.length === 0) {
      if (debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') {
        fetchFilteredUsers();
      }
    } else {
      setUsers(filteredUsers);
    }
  }, [debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus, allUsers.length]);

  // Fetch all users with caching
  const fetchUsers = async () => {
    try {
      setIsPageLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setAllUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Fetch filtered users from server with normalized role values
  const fetchFilteredUsers = async () => {
    try {
      setIsFetchingFilteredData(true);
      
      // Use consistent role format for backend
      const normalizedRoles = filterState.selectedRoles.map(role => {
        switch(role.toLowerCase()) {
          case 'admin': return 'Admin';
          case 'learner': return 'Learner';
          case 'coursecoordinator': 
          case 'course coordinator': 
          case 'course_coordinator': 
            return 'CourseCoordinator';
          case 'projectmanager': 
          case 'project manager': 
          case 'project_manager': 
            return 'ProjectManager';
          case 'superadmin':
            return 'SuperAdmin';
          default: return role;
        }
      });
      
      const data = await searchUsers(
        debouncedSearchTerm, 
        normalizedRoles, 
        filterState.filterStatus
      );
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch filtered users. Please try again later.');
      console.error('Error fetching filtered users:', err);
    } finally {
      setIsFetchingFilteredData(false);
    }
  };

  // Handle role change in a case-insensitive way
  const handleRoleChange = useCallback((role: string, isChecked: boolean) => {
    setFilterState(prev => {
      // First normalize the role value
      let normalizedRole = role;
      switch(role.toLowerCase()) {
        case 'admin': normalizedRole = 'Admin'; break;
        case 'learner': normalizedRole = 'Learner'; break;
        case 'course coordinator': 
        case 'coordinator': 
        case 'coursecoordinator': 
          normalizedRole = 'CourseCoordinator'; break;
        case 'project manager': 
        case 'project_manager': 
        case 'projectmanager': 
          normalizedRole = 'ProjectManager'; break;
        case 'superadmin':
          normalizedRole = 'SuperAdmin'; break;
      }
      
      if (isChecked) {
        // Check if we already have this role (case-insensitive)
        const alreadyHasRole = prev.selectedRoles.some(r => 
          r.toLowerCase() === normalizedRole.toLowerCase()
        );
        
        if (!alreadyHasRole) {
          return {
            ...prev,
            selectedRoles: [...prev.selectedRoles, normalizedRole]
          };
        }
        return prev;
      } else {
        // Remove the role (case-insensitive)
        return {
          ...prev,
          selectedRoles: prev.selectedRoles.filter(r => 
            r.toLowerCase() !== normalizedRole.toLowerCase()
          )
        };
      }
    });
  }, []);

  // Helper function for phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    
    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if the phone starts with + or if it has valid length
    if (phone.startsWith('+')) {
      return digitsOnly.length >= 10 && digitsOnly.length <= 15; // E.164 format allows 15 digits max
    }
    
    // For non-prefixed numbers, accept 10-15 digits
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  // Helper function for email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle adding or updating a user with option to skip password generation
  const handleAddUser = async (skipPasswordGen = false) => {
    try {
      setIsSubmitting(true);
      
      // Basic validation
      if (!newUser.email || !newUser.name) {
        throw new Error('Name and email are required fields');
      }
      
      // Email validation
      if (!validateEmail(newUser.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Phone validation (if provided)
      if (newUser.phone && !validatePhoneNumber(newUser.phone)) {
        throw new Error('Please enter a valid phone number (10-15 digits) or leave it empty');
      }
      
      // Normalize role formats
      const normalizedRoles = newUser.roles.map(role => {
        switch(role.toLowerCase()) {
          case 'admin': return 'Admin';
          case 'learner': return 'Learner';
          case 'coursecoordinator': 
          case 'course coordinator': 
          case 'course_coordinator': 
            return 'CourseCoordinator';
          case 'projectmanager': 
          case 'project manager': 
          case 'project_manager': 
            return 'ProjectManager';
          case 'superadmin':
            return 'SuperAdmin';
          default: return role;
        }
      });
      
      // Check if user has permission to create users with these roles
      for (const role of normalizedRoles) {
        if (!canCreateUserWithRole(role)) {
          throw new Error(`You don't have permission to create users with the ${role} role`);
        }
      }
      
      // Update the user object with normalized roles
      const userWithNormalizedRoles = {
        ...newUser,
        roles: normalizedRoles
      };
      
      if (editingUser) {
        // Edit existing user
        if (!canEditUser(editingUser)) {
          throw new Error(`You don't have permission to edit this user`);
        }
        
        const optimisticUser = { ...editingUser, ...userWithNormalizedRoles };
        
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === editingUser.id ? optimisticUser : user
        ));
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => prevUsers.map(user => 
            user.id === editingUser.id ? optimisticUser : user
          ));
        }
        
        setShowAddModal(false);
        
        try {
          // When updating, check if the special 'generateTemporaryPassword' flag should be set
          const updateDto: UpdateUserDto = {
            ...userWithNormalizedRoles,
            status: editingUser.status,
            // Set generateTemporaryPassword based on our flag
            generateTemporaryPassword: userWithNormalizedRoles.password === '' && generateTempPassword
          };
          
          // If password is 'NO_CHANGE', remove it from the payload to avoid sending it to the server
          if (updateDto.password === 'NO_CHANGE') {
            delete updateDto.password;
            updateDto.generateTemporaryPassword = false;
          }
          
          const updatedUser = await updateUser(editingUser.id, updateDto);
          
          // Check if a temporary password was returned AND we're not skipping the password dialog
          if (updatedUser.temporaryPassword && !skipPasswordGen && generateTempPassword) {
            setTempPasswordData({
              userId: updatedUser.id,
              userName: updatedUser.name,
              userEmail: updatedUser.email,
              tempPassword: updatedUser.temporaryPassword
            });
            setShowTempPasswordModal(true);
          } else {
            // Make sure we don't show the dialog if we're skipping it
            setShowTempPasswordModal(false);
            toast.success('User updated successfully');
          }
          
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === editingUser.id ? updatedUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === editingUser.id ? updatedUser : user
            ));
          }
        } catch (error) {
          // Revert on error
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === editingUser.id ? editingUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === editingUser.id ? editingUser : user
            ));
          }
          
          throw error;
        }
      } else {
        // Create new user
        const tempId = `temp-${Date.now()}`;
        const tempUser = {
          ...userWithNormalizedRoles,
          id: tempId,
          status: 'active',
          joinedDate: new Date().toISOString()
        } as User;
        
        setUsers(prevUsers => [...prevUsers, tempUser]);
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => [...prevUsers, tempUser]);
        }
        
        setShowAddModal(false);
        
        try {
          // For new users, we always generate a temporary password if the password field is empty
          const createdUser = await createUser(userWithNormalizedRoles);
          
          // Check if a temporary password was returned
          if (createdUser.temporaryPassword) {
            setTempPasswordData({
              userId: createdUser.id,
              userName: createdUser.name,
              userEmail: createdUser.email,
              tempPassword: createdUser.temporaryPassword
            });
            setShowTempPasswordModal(true);
          } else {
            toast.success('User created successfully');
          }
          
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === tempId ? createdUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === tempId ? createdUser : user
            ));
          }
        } catch (error) {
          // Remove temp user on error
          setUsers(prevUsers => prevUsers.filter(user => user.id !== tempId));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.filter(user => user.id !== tempId));
          }
          
          throw error;
        }
      }
      
      resetForm();
    } catch (err: any) {
      // Extract specific error messages from backend
      let errorMessage = err.message || 'Failed to save user';
      
      // Check for specific error patterns from the backend
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      }
      
      // Handle specific error cases with user-friendly messages
      if (errorMessage.includes('already in use')) {
        if (errorMessage.includes('Email')) {
          errorMessage = 'This email address is already registered. Please use a different email address.';
        } else if (errorMessage.includes('Phone') || errorMessage.includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        }
      } else if (errorMessage.includes('Failed to create Firebase account')) {
        errorMessage = 'Unable to create account due to authentication issues. Please try again later.';
      } else if (errorMessage.includes('Failed to save user to database')) {
        errorMessage = 'Unable to save user information. Please try again later.';
      } else if (errorMessage.includes('Invalid phone number')) {
        errorMessage = 'Please enter a valid phone number in international format (e.g., +1234567890)';
      } else if (errorMessage.toLowerCase().includes('duplicate')) {
        if (errorMessage.toLowerCase().includes('email')) {
          errorMessage = 'This email address is already registered. Please use a different email address.';
        } else if (errorMessage.toLowerCase().includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000, // Show error for 5 seconds
        icon: '⚠️',
      });
      console.error('Error saving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterState({
      searchTerm: '',
      selectedRoles: [],
      filterStatus: 'all'
    });
  }, []);

  // Reset form
  const resetForm = () => {
    setNewUser({ 
      name: '', 
      email: '', 
      phone: '', 
      roles: ['Learner'], 
      department: '', 
      password: '' 
    });
    setEditingUser(null);
    setError(null);
    setGenerateTempPassword(true); // Reset this flag when form is reset
  };

  // Update roles for new user
  const updateNewUserRoles = (role: string, isChecked: boolean) => {
    // First ensure we're working with the proper standardized format
    let normalizedRole = role;
    switch(role.toLowerCase()) {
      case 'admin': normalizedRole = 'Admin'; break;
      case 'learner': normalizedRole = 'Learner'; break;
      case 'course coordinator': 
      case 'coordinator': 
      case 'coursecoordinator': 
        normalizedRole = 'CourseCoordinator'; break;
      case 'project manager': 
      case 'project_manager': 
      case 'projectmanager': 
        normalizedRole = 'ProjectManager'; break;
      case 'superadmin':
        normalizedRole = 'SuperAdmin'; break;
    }
    
    setNewUser(prev => {
      if (isChecked) {
        // Check if we already have this role (case-insensitive)
        const alreadyHasRole = prev.roles.some(r => 
          r.toLowerCase() === normalizedRole.toLowerCase()
        );
        
        if (!alreadyHasRole) {
          return { ...prev, roles: [...prev.roles, normalizedRole] };
        }
        return prev;
      } else {
        return {
          ...prev,
          roles: prev.roles.filter(r => r.toLowerCase() !== normalizedRole.toLowerCase())
        };
      }
    });
  };

  // Custom function to handle user submission with password generation control
  const handleSubmitUser = async () => {
    // If editing a user and not generating a temp password
    if (editingUser && !generateTempPassword) {
      // Set password to 'NO_CHANGE' to indicate we don't want to change it
      setNewUser(prev => ({ ...prev, password: 'NO_CHANGE' }));
      
      // Call handleAddUser with skipPasswordGen=true to prevent showing temp password dialog
      await handleAddUser(true);
    } else {
      // For new users or when generating a new password for existing users
      if (editingUser) {
        // For existing users generating a new password, make sure password field is empty
        // to signal the backend to generate a new password
        setNewUser(prev => ({ ...prev, password: '' }));
      }
      
      // Call handleAddUser normally to generate password and show dialog
      await handleAddUser(false);
    }
  };

  // Delete a user
  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find(user => user.id === id);
    
    if (!userToDelete || !canDeleteUser(userToDelete)) {
      setError("You don't have permission to delete this user");
      toast.error("Permission denied: You can't delete this user");
      return;
    }
    
    setUserToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Confirm deletion of a user
  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setIsDeleting(true);
        
        const userToDeleteRecord = users.find(user => user.id === userToDelete);
        const userIndex = users.findIndex(user => user.id === userToDelete);
        
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
        }
        
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        try {
          await deleteUser(userToDelete);
          toast.success('User deleted successfully');
        } catch (error) {
          // Revert on error
          if (userToDeleteRecord && userIndex !== -1) {
            setUsers(prevUsers => {
              const newUsers = [...prevUsers];
              newUsers.splice(userIndex, 0, userToDeleteRecord);
              return newUsers;
            });
            
            if (allUsers.length > 0) {
              setAllUsers(prevUsers => {
                const newUsers = [...prevUsers];
                newUsers.splice(userIndex, 0, userToDeleteRecord);
                return newUsers;
              });
            }
          }
          throw error;
        }
      } catch (err) {
        setError('Failed to delete user. Please try again later.');
        toast.error('Failed to delete user');
        console.error('Error deleting user:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string) => {
    try {
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) return;
      
      // Check if the current user can edit this user
      if (!canEditUser(targetUser)) {
        toast.error("You don't have permission to change this user's status");
        return;
      }
      
      setLoadingUserIds(prev => [...prev, userId]);
      
      const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? {...user, status: newStatus} : user
      ));
      
      if (allUsers.length > 0) {
        setAllUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? {...user, status: newStatus} : user
        ));
      }
      
      try {
        const updatedUser = await toggleUserStatus(userId);
        
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? updatedUser : user
        ));
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? updatedUser : user
          ));
        }
        
        toast.success(`User ${updatedUser.status === 'active' ? 'activated' : 'deactivated'}`);
      } catch (error) {
        // Revert on error
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? targetUser : user
        ));
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? targetUser : user
          ));
        }
        
        throw error;
      }
    } catch (err) {
      setError('Failed to update user status. Please try again later.');
      toast.error('Failed to update user status');
      console.error('Error toggling status:', err);
    } finally {
      setLoadingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    if (!canEditUser(user)) {
      setError("You don't have permission to edit this user");
      toast.error("Permission denied: You can't edit this user");
      return;
    }
    
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      roles: [...user.roles],
      department: user.department || '',
      password: '' // Clear password when editing
    });
    setShowAddModal(true);
  };

  // Promote user to SuperAdmin - UPDATED with improved handling for current user
  const handlePromoteToSuperAdmin = async (userId: string) => {
    if (!isSuperAdmin) {
      toast.error("Only SuperAdmin can promote users to SuperAdmin");
      return;
    }
    
    try {
      setIsPromotingToSuperAdmin(true);
      setLoadingUserIds(prev => [...prev, userId]);
      
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) return;
      
      // Check if user already has SuperAdmin role
      if (targetUser.roles.some(r => r.toLowerCase() === 'superadmin')) {
        toast.info("User is already a SuperAdmin");
        return;
      }
      
      // Don't update the UI optimistically for the current user
      // This prevents token mismatch issues
      const isCurrentUser = targetUser.id === currentUser?.id;
      
      // Only update UI optimistically for other users, not the current user
      if (!isCurrentUser) {
        // Optimistic update for other users
        const updatedRoles = [...targetUser.roles, 'SuperAdmin'];
        const optimisticUser = { ...targetUser, roles: updatedRoles };
        
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? optimisticUser : user
        ));
        
        if (allUsers.length > 0) {
          setAllUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? optimisticUser : user
          ));
        }
      }
      
      try {
        // Call API to promote user
        await promoteToSuperAdmin(userId);
        
        // If this is the current user, display message but don't update UI
        if (isCurrentUser) {
          toast.success("You have been promoted to SuperAdmin. Please log out and log back in for changes to take effect.");
        } else {
          toast.success(`User promoted to SuperAdmin successfully`);
          
          // Refresh the user list after promotion for non-current users
          fetchUsers();
        }
      } catch (error) {
        // Revert UI changes on error (for non-current users)
        if (!isCurrentUser) {
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? targetUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === userId ? targetUser : user
            ));
          }
        }
        
        throw error;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to promote user to SuperAdmin";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error promoting user to SuperAdmin:', err);
    } finally {
      setIsPromotingToSuperAdmin(false);
      setLoadingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const isUserLoading = (userId: string) => loadingUserIds.includes(userId);

  // Format role name for display
  const formatRoleName = (role: string) => {
    switch(role.toLowerCase()) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'coursecoordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
        return 'Course Coordinator';
      case 'projectmanager': 
      case 'project manager': 
      case 'project_manager': 
        return 'Project Manager';
      case 'learner': 
        return 'Learner';
      default: 
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  // Get role color for UI display
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin': 
        return 'bg-red-100 text-red-800';
      case 'learner': 
        return 'bg-green-100 text-green-800';
      case 'coursecoordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
        return 'bg-blue-100 text-blue-800';
      case 'projectmanager': 
      case 'project manager': 
      case 'project_manager': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    // Data
    users,
    filteredUsers,
    
    // States
    isPageLoading,
    isFetchingFilteredData,
    isSubmitting,
    isDeleting,
    error,
    
    // Permission checks
    isSuperAdmin,
    isRegularAdmin,
    canDeleteUser,
    canEditUser,
    canCreateUserWithRole,
    getAvailableRoles,
    
    // Modal states
    showAddModal,
    showDeleteModal,
    showTempPasswordModal,
    tempPasswordData,
    setShowTempPasswordModal,
    
    // Form states
    editingUser,
    newUser,
    generateTempPassword,
    setGenerateTempPassword,
    
    // Filter states
    filterState,
    debouncedSearchTerm,
    
    // Functions
    setFilterState,
    handleRoleChange,
    resetFilters,
    setNewUser,
    updateNewUserRoles,
    setEditingUser,
    setShowAddModal,
    setShowDeleteModal,
    setUserToDelete,
    handleAddUser,
    handleSubmitUser,
    handleToggleStatus,
    handleDeleteUser,
    handleEditUser,
    confirmDelete,
    resetForm,
    setError,
    isUserLoading,
    loadingUserIds,
    
    // Role display
    formatRoleName,
    getRoleColor,
    
    // SuperAdmin functions
    handlePromoteToSuperAdmin,
    isPromotingToSuperAdmin
  };
};