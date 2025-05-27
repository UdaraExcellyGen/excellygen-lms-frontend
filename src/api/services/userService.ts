import apiClient from '../apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  status: string;
  joinedDate: string;
  jobRole?: string;
  about?: string;
  avatar?: string;
  requirePasswordChange?: boolean;
  temporaryPassword?: string; // Only populated during creation/reset
}

export interface CreateUserDto {
  id?: string; // Only for optimistic UI updates, not sent to server
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  password: string; // Optional - if empty, a temporary password will be generated
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  password?: string; // Optional for updates
  status: string;
  generateTemporaryPassword?: boolean; // Flag to request a temporary password
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

// Create new user
export const createUser = async (user: CreateUserDto): Promise<User> => {
  try {
    const response = await apiClient.post('/admin/users', user);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update existing user
export const updateUser = async (id: string, user: UpdateUserDto): Promise<User> => {
  try {
    const response = await apiClient.put(`/admin/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// Toggle user status (active/inactive)
export const toggleUserStatus = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.post(`/admin/users/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for user ${id}:`, error);
    throw error;
  }
};

// Search users with filters
export const searchUsers = async (
  searchTerm?: string, 
  roles?: string[], 
  status?: string
): Promise<User[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }
    
    if (roles && roles.length > 0) {
      roles.forEach(role => params.append('roles', role));
    }
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await apiClient.get(`/admin/users/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};