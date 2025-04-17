import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5177/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token');
        
        if (!refreshToken || !accessToken) {
          // If no refresh token, redirect to login
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
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('current_role');
        localStorage.removeItem('user');
        
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    // If error is 403 (Forbidden), show the error message
    if (error.response?.status === 403) {
      console.error('Forbidden access:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;