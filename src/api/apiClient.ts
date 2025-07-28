// src/api/apiClient.ts
// ENTERPRISE: Ultra-selective loading like Google/Microsoft
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5177/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Professional request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private getRequestKey(config: any): string {
    const { method, url, params } = config;
    return `${method?.toUpperCase()}_${url}_${JSON.stringify(params || {})}`;
  }

  private isCacheable(config: any): boolean {
    return config.method?.toLowerCase() === 'get' && 
           !config.url?.includes('/heartbeat') &&
           !config.url?.includes('/notifications');
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  async deduplicate(config: any): Promise<any> {
    const requestKey = this.getRequestKey(config);

    // Check cache for GET requests
    if (this.isCacheable(config)) {
      const cachedData = this.getCachedData(requestKey);
      if (cachedData) {
        return Promise.resolve({ data: cachedData, config });
      }
    }

    // Check pending requests
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    // Make the request
    const requestPromise = axios(config)
      .then(response => {
        if (this.isCacheable(config)) {
          this.cache.set(requestKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
        return response;
      })
      .finally(() => {
        this.pendingRequests.delete(requestKey);
      });

    this.pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

const requestDeduplicator = new RequestDeduplicator();

// ENTERPRISE: Ultra-selective loading management like Google/Microsoft
class LoadingManager {
  private activeRequests = new Set<string>();
  
  // ENTERPRISE: Only these critical operations show global loading
  private globalLoadingEndpoints = [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh-token',
    '/auth/switch-role',
    // Remove most endpoints - let components handle their own loading
  ];

  private startLoading: () => void = () => {};
  private stopLoading: () => void = () => {};

  setLoadingFunctions(start: () => void, stop: () => void) {
    this.startLoading = start;
    this.stopLoading = stop;
  }

  private shouldShowGlobalLoading(url: string, method: string): boolean {
    // ENTERPRISE: Only show for critical auth/navigation operations
    const isCriticalAuth = this.globalLoadingEndpoints.some(endpoint => 
      url?.includes(endpoint)
    );
    
    // ENTERPRISE: Don't show loading for regular CRUD operations
    // Let individual components handle their own loading states
    return isCriticalAuth;
  }

  private getRequestId(config: any): string {
    return `${config.method?.toUpperCase()}_${config.url}`;
  }

  startRequest(config: any): void {
    if (!this.shouldShowGlobalLoading(config.url, config.method)) return;

    const requestId = this.getRequestId(config);
    if (this.activeRequests.has(requestId)) return;

    this.activeRequests.add(requestId);
    
    // ENTERPRISE: Add small delay to prevent flash loading for quick requests
    setTimeout(() => {
      if (this.activeRequests.has(requestId)) {
        this.startLoading();
      }
    }, 300);
  }

  endRequest(config: any): void {
    if (!this.shouldShowGlobalLoading(config.url, config.method)) return;

    const requestId = this.getRequestId(config);
    if (this.activeRequests.has(requestId)) {
      this.activeRequests.delete(requestId);
      
      // ENTERPRISE: Only stop if no other critical requests are active
      if (this.activeRequests.size === 0) {
        this.stopLoading();
      }
    }
  }

  clearAll(): void {
    this.activeRequests.clear();
    this.stopLoading();
  }
}

const loadingManager = new LoadingManager();

// Token refresh handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

export const setupLoaderFunctions = (start: () => void, stop: () => void) => {
  loadingManager.setLoadingFunctions(start, stop);
};

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

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    loadingManager.startRequest(config);
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
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
    }
    
    return config;
  },
  (error) => {
    loadingManager.endRequest(error.config);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    loadingManager.endRequest(response.config);
    return response;
  },
  async (error) => {
    loadingManager.endRequest(error.config);
    
    const originalRequest = error.config;
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token');
        
        if (!refreshToken || !accessToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          { accessToken, refreshToken }
        );
        
        if (response.data) {
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          localStorage.setItem('token_expiry', response.data.expiresAt);
          localStorage.setItem('current_role', response.data.currentRole);
          
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          processQueue(null, response.data.accessToken);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
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
    
    return Promise.reject(error);
  }
);

// Override request method for deduplication
const originalRequest = apiClient.request;
apiClient.request = function(config) {
  return requestDeduplicator.deduplicate(config);
};

export const clearAllCaches = () => {
  requestDeduplicator.clearCache();
  loadingManager.clearAll();
};

export default apiClient;