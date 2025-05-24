// src/api/fileApi.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
// We don't import refreshToken here; components calling these functions will handle retries.

const TOKEN_STORAGE_KEY = 'access_token';

// Create a dedicated Axios instance for file uploads
// This avoids potential conflicts with global interceptors that might assume JSON content type
const fileUploadClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5177/api', // Explicitly set the default if env var is missing
});

// Request Interceptor for fileUploadClient: Add JWT token to headers
fileUploadClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Basic error propagation, no complex handling here
        return Promise.reject(error);
    }
);

// Response interceptor for fileUploadClient:
// Simplified: It just passes the response or error through.
// Components will need to handle 401s and retry after refreshing token using authApi.
fileUploadClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // You could add minimal logging here if desired
        // console.error("fileApi Error:", error.config?.url, error.response?.status, error.message);
        return Promise.reject(error);
    }
);

// Updated interfaces to match controller responses
interface ForumImageResponse {
    imageUrl: string;      // Full URL from server
    relativePath: string | null; // Can be null with Firebase Storage
}

interface AvatarResponse {
    imageUrl: string;     // Full URL from server
    avatar: string;       // Full URL from server (duplicate of imageUrl)
}

interface DeleteResponse {
    message: string;      // Success message
}

interface FirebaseTestResponse {
    message: string;
    projectId: string;
    bucketName: string;
    bucketLocation: string;
    serviceAccountPath: string;
    serviceAccountFileExists: boolean;
    timestamp: string;
}

/**
 * Uploads an image for the forum feature.
 * @param file The image file to upload.
 * @returns Promise containing the full imageUrl and relativePath of the uploaded image.
 */
export const uploadForumImage = async (file: File): Promise<ForumImageResponse> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the IFormFile parameter name in backend FilesController
    
    // Log the API URL that will be used
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5177/api';
    console.log('API URL:', apiUrl);
    console.log('Full request URL:', `${apiUrl}/files/upload/forum`);
    
    try {
        // Use the fileUploadClient to ensure all interceptors are applied
        const response = await fileUploadClient.post('/files/upload/forum', formData);
        
        // Log the response for debugging
        console.log('Upload response:', response.data);
        
        // Make sure we have the expected properties
        if (!response.data.imageUrl) {
            console.error('Missing imageUrl in response:', response.data);
        }
        
        return response.data;
    } catch (error) {
        console.error('Upload error details:', error);
        throw error;
    }
};

/**
 * Uploads an avatar image.
 * @param file The image file to upload.
 * @returns Promise containing the imageUrl and avatar URL.
 */
export const uploadAvatar = async (file: File): Promise<AvatarResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fileUploadClient.post('/files/upload/avatar', formData);
        console.log('Avatar upload response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw error;
    }
};

/**
 * Deletes an uploaded file from the server.
 * @param relativePath The relative path of the file to delete (e.g., /uploads/forum/image.jpg).
 * @returns Promise with the deletion response.
 */
export const deleteUploadedFile = async (relativePath: string): Promise<DeleteResponse> => {
    if (!relativePath) {
        console.warn("deleteUploadedFile: Invalid or missing relativePath provided.", relativePath);
    }
    
    try {
        // Backend delete endpoint expects path as a query parameter
        const response = await fileUploadClient.delete('/files/delete', {
            params: { path: relativePath }
        });
        
        console.log('File deletion response:', response.data);
        return response.data;
    } catch (error) {
        console.error('File deletion error:', error);
        throw error;
    }
};

/**
 * Deletes a file from the server.
 * @param path The full path or URL of the file to delete.
 * @returns Promise with the deletion response.
 */
export const deleteFile = async (path: string): Promise<DeleteResponse> => {
    if (!path) {
        throw new Error("deleteFile: Invalid or missing path provided.");
    }
    
    try {
        // Backend delete endpoint expects path as a query parameter
        const response = await fileUploadClient.delete('/files/delete', {
            params: { path }
        });
        
        return response.data;
    } catch (error) {
        console.error('File deletion error:', error);
        throw error;
    }
};

/**
 * Tests the Firebase connection.
 * @returns Promise with the test response.
 */
export const testFirebaseConnection = async (): Promise<FirebaseTestResponse> => {
    try {
        const response = await fileUploadClient.get('/files/test-firebase');
        return response.data;
    } catch (error) {
        console.error('Firebase connection test error:', error);
        throw error;
    }
};

/**
 * Helper function to check if an error object is an AxiosError.
 * Can be used in components for more specific error handling.
 */
export function isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
}