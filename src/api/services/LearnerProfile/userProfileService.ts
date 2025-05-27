// src/api/services/LearnerProfile/userProfileService.ts
import apiClient from '../../apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobRole?: string;
  about?: string;
  avatar?: string;
  roles: string[];
}

export interface UpdateProfileDto {
  jobRole?: string;
  about?: string;
}

/**
 * Fetches user profile data
 * @param userId User ID
 * @returns Promise with user profile data
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`/user-profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Updates user profile data (job role and about sections only)
 * @param userId User ID 
 * @param profile Update data with job role and about
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (userId: string, profile: UpdateProfileDto): Promise<UserProfile> => {
  try {
    const response = await apiClient.put(`/user-profile/${userId}`, profile);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Uploads user avatar to Firebase Storage via backend
 * @param userId User ID
 * @param file Image file to upload
 * @returns Promise with avatar URL
 */
export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to backend endpoint which handles Firebase Storage
    const response = await apiClient.post(`/user-profile/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const avatarUrl = response.data.avatar;
    
    // Update localStorage if successful
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userData.avatar = avatarUrl;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Updated user avatar in localStorage:', avatarUrl);
      }
    } catch (e) {
      console.error('Error updating user data in localStorage:', e);
    }
    
    return avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Updates user avatar URL (for Firebase URLs uploaded externally)
 * @param userId User ID
 * @param avatarUrl Firebase Storage URL
 * @returns Promise with avatar URL
 */
export const updateUserAvatarUrl = async (userId: string, avatarUrl: string): Promise<string> => {
  try {
    const response = await apiClient.post(`/user-profile/${userId}/avatar-url`, { 
      avatarUrl: avatarUrl 
    });
    
    // Update localStorage
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userData.avatar = response.data.avatar;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Updated user avatar in localStorage:', response.data.avatar);
      }
    } catch (e) {
      console.error('Error updating user data in localStorage:', e);
    }
    
    return response.data.avatar;
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    throw error;
  }
};

/**
 * Deletes user avatar
 * @param userId User ID
 */
export const deleteUserAvatar = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/user-profile/${userId}/avatar`);
    
    // Update localStorage
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userData.avatar = null;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};