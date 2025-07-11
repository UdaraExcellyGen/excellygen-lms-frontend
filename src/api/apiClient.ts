import axios from 'axios';

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

// Active request counter - used to manage loading state
let activeRequests = 0;
// OPTIMIZATION: Add debounce for loading state to prevent flickering
let loadingTimeout: NodeJS.Timeout | null = null;

// Functions for loader management that will be injected
let startLoading: () => void = () => {};
let stopLoading: () => void = () => {};

// Set up the loading functions
export const setupLoaderFunctions = (
  start: () => void,
  stop: () => void
) => {
  startLoading = start;
  stopLoading = stop;
};

// OPTIMIZATION: Enhanced loading management with endpoint-specific exclusions
const manageLoading = (increment: boolean, config?: any) => {
  // OPTIMIZATION: Exclude specific endpoints from global loading to prevent conflicts
  const excludedEndpoints = [
    '/learner/stats/overall',
    '/admin/dashboard/stats',
    '/admin/dashboard/notifications'
  ];
  
  const shouldShowGlobalLoading = !excludedEndpoints.some(endpoint => 
    config?.url?.includes(endpoint)
  );
  
  if (!shouldShowGlobalLoading) {
    console.log(`Skipping global loading for endpoint: ${config?.url}`);
    return;
  }
  
  if (increment) {
    activeRequests++;
    
    // Start loading immediately for first request
    if (activeRequests === 1) {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
      startLoading();
    }
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    
    // Debounce stopping the loader to prevent flickering
    if (activeRequests === 0) {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // Small delay before hiding loader to prevent flickering for quick consecutive requests
      loadingTimeout = setTimeout(() => {
        if (activeRequests === 0) {
          stopLoading();
        }
        loadingTimeout = null;
      }, 100); // 100ms delay
    }
  }
};

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
    // OPTIMIZATION: Pass config to manageLoading for smart endpoint exclusion
    manageLoading(true, config);
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add active role header
    const currentRole = localStorage.getItem('current_role');
    if (currentRole) {
      const roleMap: {[key: string]: string} = {
        'Admin': 'Admin',
        'Project Manager': 'ProjectManager',
        'ProjectManager': 'ProjectManager',
        'Learner': 'Learner',
        'Course Coordinator': 'CourseCoordinator',
        'CourseCoordinator': 'CourseCoordinator'
      };
      
      const normalizedRole = roleMap[currentRole] || currentRole;
      config.headers['X-Active-Role'] = normalizedRole;
      
      // Add debug logging in development
      if (import.meta.env.DEV) {
        console.log(`Request with role: ${normalizedRole} to ${config.url}`);
      }
    }
    
    return config;
  },
  (error) => {
    manageLoading(false);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // OPTIMIZATION: Pass response config to manageLoading for smart endpoint exclusion
    manageLoading(false, response.config);
    
    return response;
  },
  async (error) => {
    // OPTIMIZATION: Pass error config to manageLoading for smart endpoint exclusion
    manageLoading(false, error.config);
    
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
            const roleMap: {[key: string]: string} = {
              'Admin': 'Admin',
              'Project Manager': 'ProjectManager',
              'ProjectManager': 'ProjectManager',
              'Learner': 'Learner',
              'Course Coordinator': 'CourseCoordinator',
              'CourseCoordinator': 'CourseCoordinator'
            };
            
            const normalizedRole = roleMap[response.data.currentRole] || response.data.currentRole;
            originalRequest.headers['X-Active-Role'] = normalizedRole;
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
    
    // OPTIMIZATION: Enhanced error handling with better logging
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      const endpoint = error.config?.url || 'unknown';
      
      switch (status) {
        case 403:
          console.error(`Forbidden access to ${endpoint}:`, message);
          break;
        case 404:
          console.error(`Resource not found at ${endpoint}:`, message);
          break;
        case 405:
          console.error(`Method not allowed for ${endpoint}:`, message);
          break;
        case 500:
          console.error(`Server error at ${endpoint}:`, message);
          break;
        case 502:
          console.error(`Bad Gateway for ${endpoint}:`, message);
          break;
        case 503:
          console.error(`Service Unavailable for ${endpoint}:`, message);
          break;
        case 504:
          console.error(`Gateway Timeout for ${endpoint}:`, message);
          break;
        default:
          console.error(`Error (${status}) at ${endpoint}:`, message);
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

// OPTIMIZATION: Export utilities for cache management and preloading
export const clearActiveRequests = () => {
  activeRequests = 0;
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  stopLoading();
};

export const getActiveRequestsCount = () => activeRequests;

export default apiClient;