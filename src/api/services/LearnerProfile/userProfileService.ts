// src/api/services/LearnerProfile/userProfileService.ts
import apiClient from '../../apiClient';
import { storage } from '../../../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
 * Uploads user avatar to Firebase Storage and updates the profile
 * @param userId User ID
 * @param file Image file to upload
 * @returns Promise with avatar URL
 */
export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    // Create a storage reference with user ID and timestamp to avoid path conflicts
    const storageRef = ref(storage, `avatars/${userId}_${Date.now()}`);
    
    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    try {
      // Update the profile with the Firebase URL
      const response = await apiClient.post(`/user-profile/${userId}/avatar-url`, { 
        avatarUrl: downloadURL 
      });
      
      // Update localStorage
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          userData.avatar = downloadURL;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Updated user avatar in localStorage:', downloadURL);
        }
      } catch (e) {
        console.error('Error updating user data in localStorage:', e);
      }
      
      return downloadURL;
    } catch (apiError) {
      console.error('Error updating avatar in API:', apiError);
      // Even if the API call fails, return the Firebase URL so the UI can still show the image
      return downloadURL;
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Deletes user avatar
 * @param userId User ID
 */
export const deleteUserAvatar = async (userId: string): Promise<void> => {
  try {
    // Get the current avatar URL first
    const response = await apiClient.delete(`/user-profile/${userId}/avatar`);
    
    // If we have a Firebase Storage URL, delete the file
    if (response.data?.previousAvatarUrl) {
      try {
        const prevAvatarUrl = response.data.previousAvatarUrl;
        
        // Only proceed if it's a Firebase Storage URL
        if (prevAvatarUrl.includes('firebasestorage.googleapis.com')) {
          // Extract the reference path from the URL
          const imageRef = ref(storage, prevAvatarUrl);
          
          // Delete the file
          await deleteObject(imageRef);
          console.log('Deleted avatar from Firebase Storage');
        }
      } catch (e) {
        console.error('Error deleting avatar file:', e);
      }
    }
    
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