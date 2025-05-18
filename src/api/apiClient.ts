// src/api/apiClient.ts

import axios, { AxiosError, AxiosResponse } from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5177/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Flag to prevent multiple token refresh attempts at the same time
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}[] = [];

// Process the queue of failed requests
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.config.headers['Authorization'] = `Bearer ${token}`;
      promise.resolve(axios(promise.config));
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add authorization header and active role
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add active role header
    const currentRole = localStorage.getItem('current_role');
    if (currentRole) {
      config.headers['X-Active-Role'] = currentRole.toLowerCase();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops when refreshing token
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/refresh-token')) {
      // Clear auth data on refresh token failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('current_role');
      localStorage.removeItem('user');
      
      // Dispatch custom event that the auth context can listen for
      window.dispatchEvent(new Event('auth:expired'));
      
      // Redirect to home page
      window.location.href = '/';
      
      return Promise.reject(error);
    }
    
    // If the error is 401 (unauthorized) and we're not already refreshing tokens
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token');
        
        if (!refreshToken || !accessToken) {
          // If no refresh token, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          localStorage.removeItem('current_role');
          localStorage.removeItem('user');
          
          window.dispatchEvent(new Event('auth:expired'));
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          {
            accessToken,
            refreshToken,
          }
        );
        
        // If refresh successful
        if (response.data) {
          // Update tokens in localStorage
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          localStorage.setItem('token_expiry', response.data.expiresAt);
          localStorage.setItem('current_role', response.data.currentRole);
          
          // Update the authorization header for the original request
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          // Also set the X-Active-Role header
          if (response.data.currentRole) {
            originalRequest.headers['X-Active-Role'] = response.data.currentRole.toLowerCase();
          }
          
          // Process any queued requests with the new token
          processQueue(null, response.data.accessToken);
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Process any queued requests with the error
        processQueue(refreshError, null);
        
        // If refresh fails, clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('current_role');
        localStorage.removeItem('user');
        
        window.dispatchEvent(new Event('auth:expired'));
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other common errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Forbidden access:', error.response.data?.message || 'You do not have permission to access this resource');
          break;
        case 404:
          console.error('Resource not found:', error.response.data?.message || 'The requested resource was not found');
          break;
        case 405:
          console.error('Method not allowed:', error.response.data?.message || 'The requested method is not allowed for this resource');
          break;
        case 500:
          console.error('Server error:', error.response.data?.message || 'An unexpected error occurred on the server');
          break;
        default:
          console.error(`Error (${error.response.status}):`, error.response.data?.message || error.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', 'No response received from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;