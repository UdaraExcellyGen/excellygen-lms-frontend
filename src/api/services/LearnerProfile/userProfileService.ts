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
  phone?: string;
  department?: string;
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`/user-profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profile: UpdateProfileDto): Promise<UserProfile> => {
  try {
    const response = await apiClient.put(`/user-profile/${userId}`, profile);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload user avatar
export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/user-profile/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatar;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Delete user avatar
export const deleteUserAvatar = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/user-profile/${userId}/avatar`);
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};