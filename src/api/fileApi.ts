// src/api/fileApi.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
// We don't import refreshToken here; components calling these functions will handle retries.

const TOKEN_STORAGE_KEY = 'access_token';

// Create a dedicated Axios instance for file uploads
// This avoids potential conflicts with global interceptors that might assume JSON content type
const fileUploadClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Base API URL, e.g., http://localhost:5177/api
                                           // The full path will be constructed in the call, e.g., /files/upload/forum
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


interface UploadResponse {
    imageUrl: string;     // Full URL from server (e.g., http://localhost:5177/uploads/forum/image.jpg)
    relativePath: string; // Relative path on server (e.g., /uploads/forum/image.jpg)
}

/**
 * Uploads an image for the forum feature.
 * @param file The image file to upload.
 * @returns Promise containing the full imageUrl and relativePath of the uploaded image.
 */
export const uploadForumImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the IFormFile parameter name in backend FilesController

    // Endpoint example: /api/files/upload/forum
    const response = await fileUploadClient.post<UploadResponse>('/files/upload/forum', formData, {
        // Axios correctly sets 'Content-Type': 'multipart/form-data' when given FormData,
        // but you can explicitly set it if needed, though it's usually best to let Axios handle it for FormData.
        // headers: {
        //     'Content-Type': 'multipart/form-data',
        // },
    });
    return response.data; // Expected: { imageUrl: "full_url_string", relativePath: "/uploads/..." }
};

/**
 * Deletes an uploaded file from the server.
 * @param relativePath The relative path of the file to delete (e.g., /uploads/forum/image.jpg).
 */
export const deleteUploadedFile = async (relativePath: string): Promise<void> => {
    if (!relativePath || !relativePath.startsWith('/uploads/')) {
        console.warn("deleteUploadedFile: Invalid or missing relativePath provided.", relativePath);
        // Potentially throw an error or return a specific response if this is unexpected
        // For now, we'll let it proceed, and the backend will likely return a 400 or 404.
    }
    // Backend delete endpoint expects relativePath as a query parameter
    await fileUploadClient.delete(`/files/delete?relativePath=${encodeURIComponent(relativePath)}`);
};

/**
 * Helper function to check if an error object is an AxiosError.
 * Can be used in components for more specific error handling.
 */
export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}