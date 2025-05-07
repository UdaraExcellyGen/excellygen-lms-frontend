import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

const TOKEN_STORAGE_KEY = 'access_token';

const fileUploadClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
});

fileUploadClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

fileUploadClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Basic error propagation. Components using this should implement retry with token refresh.
        return Promise.reject(error);
    }
);

interface UploadResponse {
    imageUrl: string;     // Full URL from server
    relativePath: string; // Relative path on server
}

export const uploadForumImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await fileUploadClient.post<UploadResponse>('/files/upload/forum', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteUploadedFile = async (relativePath: string): Promise<void> => {
    // Backend expects relativePath like /uploads/forum/image.jpg
    await fileUploadClient.delete(`/files/delete?relativePath=${encodeURIComponent(relativePath)}`);
};

export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}
