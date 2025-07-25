import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  
  // SINGLE SOURCE OF TRUTH for loading state
  const isInitialized = useRef(false);
  const fetchController = useRef<AbortController | null>(null);
  
  // Memoize permission checks
  const permissionMemo = useMemo(() => {
    if (!currentUser?.roles) return { isSuperAdmin: false, isRegularAdmin: false };
    
    const roles = currentUser.roles.map(role => role.toLowerCase());
    const isSuperAdmin = roles.includes('superadmin');
    const isRegularAdmin = roles.includes('admin') && !isSuperAdmin;
    
    return { isSuperAdmin, isRegularAdmin };
  }, [currentUser?.roles]);

  const { isSuperAdmin, isRegularAdmin } = permissionMemo;

  // SIMPLIFIED DATA STATES - Single source of truth
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // SINGLE LOADING STATE - No more double loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const [generateTempPassword, setGenerateTempPassword] = useState(true);

  // Filter states
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    selectedRoles: [],
    filterStatus: 'all'
  });
  
  const debouncedSearchTerm = useDebounce(filterState.searchTerm, 500); // Increased debounce

  // CLIENT-SIDE FILTERING - Primary filtering method
  const filteredUsers = useMemo(() => {
    if (allUsers.length === 0) return [];
    
    return allUsers.filter(user => {
      // Search filter
      const matchesSearch = !debouncedSearchTerm || 
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Role filter - FIXED: Now shows users who have ALL selected roles (AND logic)
      const matchesRoles = filterState.selectedRoles.length === 0 || 
        filterState.selectedRoles.every(filterRole => 
          user.roles.some(userRole => 
            userRole.toLowerCase() === filterRole.toLowerCase()
          )
        );
      
      // Status filter
      const matchesStatus = filterState.filterStatus === 'all' || 
        user.status === filterState.filterStatus;
      
      return matchesSearch && matchesRoles && matchesStatus;
    });
  }, [allUsers, debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus]);

  // SINGLE INITIALIZATION - Prevents double loading
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchAllUsers();
    }
  }, []);

  // SIMPLIFIED FETCH FUNCTION - Only one fetch method needed
  const fetchAllUsers = async () => {
    // Cancel any ongoing fetch
    if (fetchController.current) {
      fetchController.current.abort();
    }
    
    fetchController.current = new AbortController();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getAllUsers();
      setAllUsers(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', err);
      }
    } finally {
      setIsLoading(false);
      fetchController.current = null;
    }
  };

  // REMOVE SERVER-SIDE FILTERING - Use only client-side filtering
  // This eliminates the need for fetchFilteredUsers and prevents double loading

  // Reset generateTempPassword when editing state changes
  useEffect(() => {
    setGenerateTempPassword(!editingUser ? true : false);
  }, [editingUser]);

  // Permission functions
  const canDeleteUser = useCallback((user: User) => {
    if (isSuperAdmin) return user.id !== currentUser?.id;
    if (isRegularAdmin) {
      return !user.roles.some(role => 
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'
      );
    }
    return false;
  }, [isSuperAdmin, isRegularAdmin, currentUser?.id]);

  const canEditUser = useCallback((user: User) => {
    if (isSuperAdmin) return true;
    if (isRegularAdmin) {
      return !user.roles.some(role => 
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'
      );
    }
    return false;
  }, [isSuperAdmin, isRegularAdmin]);

  const canCreateUserWithRole = useCallback((role: string) => {
    if (role.toLowerCase() === 'superadmin') {
      return isSuperAdmin;
    }
    return isSuperAdmin || isRegularAdmin;
  }, [isSuperAdmin, isRegularAdmin]);

  const getAvailableRoles = useCallback(() => {
    if (isSuperAdmin) {
      return ['Admin', 'SuperAdmin', 'Learner', 'CourseCoordinator', 'ProjectManager'];
    } else {
      return ['Admin', 'Learner', 'CourseCoordinator', 'ProjectManager'];
    }
  }, [isSuperAdmin]);

  // Handle role change
  const handleRoleChange = useCallback((role: string, isChecked: boolean) => {
    setFilterState(prev => {
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
        return {
          ...prev,
          selectedRoles: prev.selectedRoles.filter(r => 
            r.toLowerCase() !== normalizedRole.toLowerCase()
          )
        };
      }
    });
  }, []);

  // Helper functions
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true;
    const digitsOnly = phone.replace(/\D/g, '');
    if (phone.startsWith('+')) {
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // OPTIMISTIC UPDATES - Single update function
  const updateUsersOptimistically = useCallback((updateFn: (users: User[]) => User[]) => {
    setAllUsers(updateFn);
  }, []);

  // STREAMLINED USER CREATION/UPDATE
  const handleAddUser = async (skipPasswordGen = false) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!newUser.email || !newUser.name) {
        throw new Error('Name and email are required fields');
      }
      
      if (!validateEmail(newUser.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (newUser.phone && !validatePhoneNumber(newUser.phone)) {
        throw new Error('Please enter a valid phone number (10-15 digits) or leave it empty');
      }
      
      // Process roles
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
          case 'superadmin': return 'SuperAdmin';
          default: return role;
        }
      });
      
      const hasPermissionForAllRoles = normalizedRoles.every(role => canCreateUserWithRole(role));
      if (!hasPermissionForAllRoles) {
        throw new Error(`You don't have permission to create users with these roles`);
      }
      
      const userWithNormalizedRoles = { ...newUser, roles: normalizedRoles };
      
      if (editingUser) {
        // Edit existing user
        if (!canEditUser(editingUser)) {
          throw new Error(`You don't have permission to edit this user`);
        }
        
        const optimisticUser = { ...editingUser, ...userWithNormalizedRoles };
        updateUsersOptimistically(prevUsers => 
          prevUsers.map(user => user.id === editingUser.id ? optimisticUser : user)
        );
        
        setShowAddModal(false);
        
        try {
          const updateDto: UpdateUserDto = {
            ...userWithNormalizedRoles,
            status: editingUser.status,
            generateTemporaryPassword: userWithNormalizedRoles.password === '' && generateTempPassword
          };
          
          if (updateDto.password === 'NO_CHANGE') {
            delete updateDto.password;
            updateDto.generateTemporaryPassword = false;
          }
          
          const updatedUser = await updateUser(editingUser.id, updateDto);
          
          if (updatedUser.temporaryPassword && !skipPasswordGen && generateTempPassword) {
            setTempPasswordData({
              userId: updatedUser.id,
              userName: updatedUser.name,
              userEmail: updatedUser.email,
              tempPassword: updatedUser.temporaryPassword
            });
            setShowTempPasswordModal(true);
          } else {
            setShowTempPasswordModal(false);
            toast.success('User updated successfully');
          }
          
          updateUsersOptimistically(prevUsers => 
            prevUsers.map(user => user.id === editingUser.id ? updatedUser : user)
          );
        } catch (error) {
          updateUsersOptimistically(prevUsers => 
            prevUsers.map(user => user.id === editingUser.id ? editingUser : user)
          );
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
        
        updateUsersOptimistically(prevUsers => [...prevUsers, tempUser]);
        setShowAddModal(false);
        
        try {
          const createdUser = await createUser(userWithNormalizedRoles);
          
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
          
          updateUsersOptimistically(prevUsers => 
            prevUsers.map(user => user.id === tempId ? createdUser : user)
          );
        } catch (error) {
          updateUsersOptimistically(prevUsers => 
            prevUsers.filter(user => user.id !== tempId)
          );
          throw error;
        }
      }
      
      resetForm();
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to save user';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      }
      
      if (errorMessage.includes('already in use')) {
        if (errorMessage.includes('Email')) {
          errorMessage = 'This email address is already registered. Please use a different email address.';
        } else if (errorMessage.includes('Phone') || errorMessage.includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000, icon: '⚠️' });
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
    setGenerateTempPassword(true);
  };

  // Update roles for new user
  const updateNewUserRoles = (role: string, isChecked: boolean) => {
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

  // Custom function to handle user submission
  const handleSubmitUser = async () => {
    if (editingUser && !generateTempPassword) {
      setNewUser(prev => ({ ...prev, password: 'NO_CHANGE' }));
      await handleAddUser(true);
    } else {
      if (editingUser) {
        setNewUser(prev => ({ ...prev, password: '' }));
      }
      await handleAddUser(false);
    }
  };

  // Delete a user
  const handleDeleteUser = (id: string) => {
    const userToDelete = allUsers.find(user => user.id === id);
    
    if (!userToDelete || !canDeleteUser(userToDelete)) {
      setError("You don't have permission to delete this user");
      toast.error("Permission denied: You can't delete this user");
      return;
    }
    
    setUserToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Confirm deletion
  const confirmDelete = async () => {
    if (userToDelete && !isDeleting) {
      try {
        setIsDeleting(true);
        
        const userToDeleteRecord = allUsers.find(user => user.id === userToDelete);
        const userIndex = allUsers.findIndex(user => user.id === userToDelete);
        
        updateUsersOptimistically(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
        
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        try {
          await deleteUser(userToDelete);
          toast.success('User deleted successfully');
        } catch (error) {
          if (userToDeleteRecord && userIndex !== -1) {
            setAllUsers(prevUsers => {
              const newUsers = [...prevUsers];
              newUsers.splice(userIndex, 0, userToDeleteRecord);
              return newUsers;
            });
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
    if (loadingUserIds.includes(userId)) return;
    
    try {
      const targetUser = allUsers.find(user => user.id === userId);
      if (!targetUser) return;
      
      if (!canEditUser(targetUser)) {
        toast.error("You don't have permission to change this user's status");
        return;
      }
      
      setLoadingUserIds(prev => [...prev, userId]);
      
      const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
      const optimisticUser = { ...targetUser, status: newStatus };
      
      updateUsersOptimistically(prevUsers => 
        prevUsers.map(user => user.id === userId ? optimisticUser : user)
      );
      
      try {
        const updatedUser = await toggleUserStatus(userId);
        
        updateUsersOptimistically(prevUsers => 
          prevUsers.map(user => user.id === userId ? updatedUser : user)
        );
        
        toast.success(`User ${updatedUser.status === 'active' ? 'activated' : 'deactivated'}`);
      } catch (error) {
        updateUsersOptimistically(prevUsers => 
          prevUsers.map(user => user.id === userId ? targetUser : user)
        );
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
      password: ''
    });
    setShowAddModal(true);
  };

  // Promote user to SuperAdmin
  const handlePromoteToSuperAdmin = async (userId: string) => {
    if (!isSuperAdmin) {
      toast.error("Only SuperAdmin can promote users to SuperAdmin");
      return;
    }
    
    if (loadingUserIds.includes(userId)) return;
    
    try {
      setLoadingUserIds(prev => [...prev, userId]);
      
      const targetUser = allUsers.find(user => user.id === userId);
      if (!targetUser) return;
      
      if (targetUser.roles.some(r => r.toLowerCase() === 'superadmin')) {
        toast.info("User is already a SuperAdmin");
        return;
      }
      
      const isCurrentUser = targetUser.id === currentUser?.id;
      
      if (!isCurrentUser) {
        const updatedRoles = [...targetUser.roles, 'SuperAdmin'];
        const optimisticUser = { ...targetUser, roles: updatedRoles };
        
        updateUsersOptimistically(prevUsers => 
          prevUsers.map(user => user.id === userId ? optimisticUser : user)
        );
      }
      
      try {
        await promoteToSuperAdmin(userId);
        
        if (isCurrentUser) {
          toast.success("You have been promoted to SuperAdmin. Please log out and log back in for changes to take effect.");
        } else {
          toast.success(`User promoted to SuperAdmin successfully`);
          fetchAllUsers(); // Refresh the user list
        }
      } catch (error) {
        if (!isCurrentUser) {
          updateUsersOptimistically(prevUsers => 
            prevUsers.map(user => user.id === userId ? targetUser : user)
          );
        }
        throw error;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to promote user to SuperAdmin";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error promoting user to SuperAdmin:', err);
    } finally {
      setLoadingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const isUserLoading = (userId: string) => loadingUserIds.includes(userId);

  // Format role name for display
  const formatRoleName = (role: string) => {
    switch(role.toLowerCase()) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'coursecoordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
        return 'Course Coordinator';
      case 'projectmanager': 
      case 'project manager': 
      case 'project_manager': 
        return 'Project Manager';
      case 'learner': return 'Learner';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  // Get role color for UI display
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-brand-federal-blue text-white'; // #03045e
      case 'admin':
        return 'bg-brand-indigo text-white'; // #52007C
      case 'projectmanager':
      case 'project manager':
      case 'project_manager':
        return 'bg-brand-persian-indigo text-white'; // #34137C
      case 'coursecoordinator':
      case 'course coordinator':
      case 'course_coordinator':
        return 'bg-brand-medium-blue text-white'; // #0609C6
      case 'learner':
        return 'bg-brand-phlox text-white'; // #BF4BF6
      default:
        return 'bg-gray-500 text-white'; // A safe, visible default
    }
  };

  return {
    // SIMPLIFIED DATA - Single source of truth
    users: filteredUsers, // Always return filtered users
    allUsers,
    
    // SIMPLIFIED LOADING STATES - No more double loading
    isPageLoading: isLoading,
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
    handlePromoteToSuperAdmin
  };
};