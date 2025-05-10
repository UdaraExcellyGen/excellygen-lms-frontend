import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  searchUsers,
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
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Temporary password states
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{
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

  // Handle adding or updating a user
  const handleAddUser = async () => {
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
          default: return role;
        }
      });
      
      // Update the user object with normalized roles
      const userWithNormalizedRoles = {
        ...newUser,
        roles: normalizedRoles
      };
      
      if (editingUser) {
        // Edit existing user
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
            // Set generateTemporaryPassword if the password field is empty (indicating we want to generate one)
            generateTemporaryPassword: userWithNormalizedRoles.password === ''
          };
          
          const updatedUser = await updateUser(editingUser.id, updateDto);
          
          // Check if a temporary password was returned
          if (updatedUser.temporaryPassword) {
            setTempPasswordData({
              userName: updatedUser.name,
              userEmail: updatedUser.email,
              tempPassword: updatedUser.temporaryPassword
            });
            setShowTempPasswordModal(true);
          } else {
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

  // Delete a user
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
      setLoadingUserIds(prev => [...prev, userId]);
      
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) return;
      
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

  const isUserLoading = (userId: string) => loadingUserIds.includes(userId);

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
    
    // Modal states
    showAddModal,
    showDeleteModal,
    showTempPasswordModal,
    tempPasswordData,
    setShowTempPasswordModal,
    
    // Form states
    editingUser,
    newUser,
    
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
    handleToggleStatus,
    confirmDelete,
    resetForm,
    setError,
    isUserLoading,
    loadingUserIds
  };
};