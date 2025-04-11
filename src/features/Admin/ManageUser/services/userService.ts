import axios from 'axios';

// Base API URL - adjust if your API is deployed elsewhere
const API_URL = 'http://localhost:5177/api';

// Types that match your backend DTOs
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  status: string;
  joinedDate: string;
  jobRole: string;
  about: string;
  firebaseUid: string;
  avatar?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  password: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  department: string;
  password?: string;
  status: string;
}

// Service functions

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_URL}/Users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 */
export const createUser = async (user: CreateUserDto): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/Users`, user);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (id: string, user: UpdateUserDto): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/Users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/Users/${id}`);
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle a user's active status
 */
export const toggleUserStatus = async (id: string): Promise<User> => {
  try {
    const response = await axios.patch(`${API_URL}/Users/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search users with optional filters
 */
export const searchUsers = async (
  searchTerm?: string,
  roles?: string[],
  status?: string
): Promise<User[]> => {
  try {
    // Build query parameters
    const params: any = {};
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    if (roles && roles.length > 0) {
      // Handle arrays in query string
      roles.forEach((role, index) => {
        params[`roles[${index}]`] = role;
      });
    }
    if (status && status !== 'all') {
      params.status = status;
    }

    const response = await axios.get(`${API_URL}/Users/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};