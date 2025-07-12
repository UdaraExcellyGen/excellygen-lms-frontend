// src/api/apiClient.ts
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5177/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // OPTIMIZATION: Increased timeout to 15 seconds
});

// Flag to prevent multiple token refresh attempts at the same time
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}[] = [];

// OPTIMIZATION: Active request tracking with better management
let activeRequests = 0;
let loadingTimeout: NodeJS.Timeout | null = null;
let requestQueue = new Set<string>(); // Track request URLs to prevent duplicates

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

// OPTIMIZATION: Enhanced loading management with request deduplication
const manageLoading = (increment: boolean, config?: any) => {
  // OPTIMIZATION: More comprehensive endpoint exclusions
  const excludedEndpoints = [
    '/learner/stats/overall',
    '/admin/dashboard/stats',
    '/admin/dashboard/notifications',
    '/learner-notifications/summary',
    '/heartbeat',
    '/auth/refresh-token'
  ];
  
  const shouldShowGlobalLoading = !excludedEndpoints.some(endpoint => 
    config?.url?.includes(endpoint)
  );
  
  if (!shouldShowGlobalLoading) {
    return;
  }
  
  // OPTIMIZATION: Prevent duplicate requests from affecting loading state
  const requestKey = `${config?.method?.toUpperCase()}_${config?.url}`; // FIXED
  
  if (increment) {
    if (requestQueue.has(requestKey)) {
      return; // Don't increment loading for duplicate requests
    }
    requestQueue.add(requestKey);
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
    requestQueue.delete(requestKey);
    activeRequests = Math.max(0, activeRequests - 1);
    
    // Debounce stopping the loader to prevent flickering
    if (activeRequests === 0) {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // OPTIMIZATION: Reduced delay for better UX
      loadingTimeout = setTimeout(() => {
        if (activeRequests === 0) {
          stopLoading();
        }
        loadingTimeout = null;
      }, 50); // Reduced from 100ms to 50ms
    }
  }
};

// Process the queue of failed requests
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.config.headers['Authorization'] = `Bearer ${token}`; // FIXED
      promise.resolve(axios(promise.config));
    }
  });
  
  failedQueue = [];
};

// OPTIMIZATION: Request deduplication for critical endpoints
const pendingRequests = new Map<string, Promise<any>>();

const getRequestKey = (config: any): string => {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
};

// Request interceptor to add authorization header and active role
apiClient.interceptors.request.use(
  (config) => {
    // OPTIMIZATION: Request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = getRequestKey(config);
      if (pendingRequests.has(requestKey)) {
        console.log(`Deduplicating request: ${requestKey}`);
        return pendingRequests.get(requestKey)!.then(() => config);
      }
    }
    
    manageLoading(true, config);
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // FIXED
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
    manageLoading(false, response.config);
    
    // OPTIMIZATION: Clean up deduplication cache for successful requests
    if (response.config.method === 'get') {
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);
    }
    
    return response;
  },
  async (error) => {
    manageLoading(false, error.config);
    
    // OPTIMIZATION: Clean up deduplication cache for failed requests
    if (error.config?.method === 'get') {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }
    
    const originalRequest = error.config;
    
    // OPTIMIZATION: Better handling of aborted requests
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.log('Request was cancelled:', originalRequest?.url);
      return Promise.reject(error);
    }
    
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
          `${apiClient.defaults.baseURL}/auth/refresh-token`, // FIXED
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
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`; // FIXED
          
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
    
    // OPTIMIZATION: Enhanced error handling with better classification
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      const endpoint = error.config?.url || 'unknown';
      
      // Don't log certain expected errors
      const expectedErrors = [401, 403, 404];
      if (!expectedErrors.includes(status)) {
        switch (status) {
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
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code !== 'ERR_CANCELED') {
        console.error('Network error:', 'No response received from server. Please check your internet connection.');
      }
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// OPTIMIZATION: Enhanced utilities for better performance monitoring
export const clearActiveRequests = () => {
  activeRequests = 0;
  requestQueue.clear();
  pendingRequests.clear();
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  stopLoading();
};

export const getActiveRequestsCount = () => activeRequests;

export const getRequestQueueStatus = () => ({
  activeRequests,
  queuedRequests: Array.from(requestQueue),
  pendingRequests: Array.from(pendingRequests.keys())
});

export default apiClient;