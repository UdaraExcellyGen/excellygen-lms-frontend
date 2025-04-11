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
} from '../services/userService';
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
  
  // Form states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<CreateUserDto, 'id'>>({
    name: '',
    email: '',
    phone: '',
    roles: ['learner'],
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

  // Client-side filtering implementation
  const filteredUsers = useMemo(() => {
    if (allUsers.length > 0) {
      return allUsers.filter(user => {
        const matchesSearch = !debouncedSearchTerm || 
          user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        const matchesRoles = filterState.selectedRoles.length === 0 || 
          user.roles.some(role => filterState.selectedRoles.includes(role));
        
        const matchesStatus = filterState.filterStatus === 'all' || 
          user.status === filterState.filterStatus;
        
        return matchesSearch && matchesRoles && matchesStatus;
      });
    }
    return users;
  }, [allUsers, debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus, users]);

  // Server-side filtering effect
  useEffect(() => {
    if (allUsers.length === 0) {
      if (debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') {
        fetchFilteredUsers();
      }
    } else {
      setUsers(filteredUsers);
    }
  }, [debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus, allUsers.length, filteredUsers]);

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

  // Fetch filtered users from server
  const fetchFilteredUsers = async () => {
    try {
      setIsFetchingFilteredData(true);
      const data = await searchUsers(
        debouncedSearchTerm, 
        filterState.selectedRoles, 
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

  // Handle adding or updating a user
  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!newUser.email || !newUser.name) {
        throw new Error('Name and email are required');
      }
      
      if (!editingUser && !newUser.password) {
        throw new Error('Password is required for new users');
      }
      
      if (editingUser) {
        // Edit existing user
        const optimisticUser = { ...editingUser, ...newUser };
        
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
          const updatedUser = await updateUser(editingUser.id, {
            ...newUser,
            status: editingUser.status
          });
          
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === editingUser.id ? updatedUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === editingUser.id ? updatedUser : user
            ));
          }
          
          toast.success('User updated successfully');
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
          ...newUser,
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
          const createdUser = await createUser(newUser);
          
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === tempId ? createdUser : user
          ));
          
          if (allUsers.length > 0) {
            setAllUsers(prevUsers => prevUsers.map(user => 
              user.id === tempId ? createdUser : user
            ));
          }
          
          toast.success('User created successfully');
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
      const errorMessage = err.message || 'Failed to save user';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error saving user:', err);
    } finally {
      setIsSubmitting(false);
    }
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
      roles: ['learner'], 
      department: '', 
      password: '' 
    });
    setEditingUser(null);
    setError(null);
  };

  // Helper functions
  const handleRoleChange = useCallback((role: string, isChecked: boolean) => {
    setFilterState(prev => ({
      ...prev,
      selectedRoles: isChecked 
        ? [...prev.selectedRoles, role] 
        : prev.selectedRoles.filter(r => r !== role)
    }));
  }, []);

  const updateNewUserRoles = (role: string, isChecked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      roles: isChecked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
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