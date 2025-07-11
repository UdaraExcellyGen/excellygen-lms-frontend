// src/api/services/Admin/categoryApiService.ts
// OPTIMIZATION: Enhanced category API service with caching and better performance

import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../features/Admin/ManageCourseCategory/types/category.types';
import { createApiClient, handleApiError } from '../../../utils/apiConfig';

const apiClient = createApiClient();

// OPTIMIZATION: Add caching for admin categories
let adminCategoriesCache: {
  data: Category[] | null;
  timestamp: number;
  isLoading: boolean;
} = {
  data: null,
  timestamp: 0,
  isLoading: false
};

// Cache duration: 5 minutes (admin categories don't change as frequently as viewing)
const ADMIN_CATEGORIES_CACHE_DURATION = 5 * 60 * 1000;

// Session storage key for categories
const CATEGORIES_STORAGE_KEY = 'admin_course_categories';

/**
 * Get all categories with caching for better performance
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (adminCategoriesCache.data && (now - adminCategoriesCache.timestamp) < ADMIN_CATEGORIES_CACHE_DURATION && !adminCategoriesCache.isLoading) {
    console.log('Returning cached admin categories data');
    return adminCategoriesCache.data;
  }
  
  // Check session storage for faster initial load
  try {
    const sessionData = sessionStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (sessionData) {
      const { data, timestamp } = JSON.parse(sessionData);
      if ((now - timestamp) < ADMIN_CATEGORIES_CACHE_DURATION) {
        console.log('Returning session stored categories data');
        adminCategoriesCache.data = data;
        adminCategoriesCache.timestamp = timestamp;
        return data;
      }
    }
  } catch (error) {
    console.log('Session storage read failed, fetching fresh data');
  }
  
  // If already loading, wait for the existing request
  if (adminCategoriesCache.isLoading) {
    console.log('Categories request already in progress, waiting...');
    let attempts = 0;
    while (adminCategoriesCache.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (adminCategoriesCache.data) {
      return adminCategoriesCache.data;
    }
  }
  
  try {
    adminCategoriesCache.isLoading = true;
    console.log('Fetching admin categories from API...');
    
    // Add timeout for this specific request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await apiClient.get<Category[]>('/CourseCategories', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!Array.isArray(response.data)) {
      console.error('API response for admin categories is not an array:', response.data);
      throw new Error('Invalid API response format for categories');
    }
    
    // Update cache
    adminCategoriesCache.data = response.data;
    adminCategoriesCache.timestamp = now;
    
    // Store in session storage for faster subsequent loads
    try {
      sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
        data: response.data,
        timestamp: now
      }));
    } catch (error) {
      console.log('Session storage write failed:', error);
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error('Error fetching admin categories:', error);
    
    // Return cached data if available, even if expired
    if (adminCategoriesCache.data) {
      console.log('Returning expired cached categories due to error');
      return adminCategoriesCache.data;
    }
    
    // Check error type for better error handling
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to view course categories.');
    } else if (error.response?.status === 404) {
      throw new Error('Course categories service not found.');
    } else {
      return handleApiError(error);
    }
  } finally {
    adminCategoriesCache.isLoading = false;
  }
};

/**
 * Get category by ID with caching
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    // Check if we have it in cache first
    if (adminCategoriesCache.data) {
      const cachedCategory = adminCategoriesCache.data.find(cat => cat.id === id);
      if (cachedCategory) {
        console.log(`Returning cached category ${id}`);
        return cachedCategory;
      }
    }
    
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await apiClient.get(`/CourseCategories/${id}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new category with cache invalidation
 */
export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
  try {
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await apiClient.post('/CourseCategories', category, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Invalidate cache
    adminCategoriesCache.data = null;
    adminCategoriesCache.timestamp = 0;
    
    // Clear session storage
    try {
      sessionStorage.removeItem(CATEGORIES_STORAGE_KEY);
    } catch (error) {
      console.log('Session storage clear failed:', error);
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update a category with cache invalidation
 */
export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
  try {
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await apiClient.put(`/CourseCategories/${id}`, category, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache if it exists
    if (adminCategoriesCache.data) {
      adminCategoriesCache.data = adminCategoriesCache.data.map(cat => 
        cat.id === id ? response.data : cat
      );
      
      // Update session storage
      try {
        sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
          data: adminCategoriesCache.data,
          timestamp: adminCategoriesCache.timestamp
        }));
      } catch (error) {
        console.log('Session storage update failed:', error);
      }
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a category with cache invalidation
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    await apiClient.delete(`/CourseCategories/${id}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache if it exists
    if (adminCategoriesCache.data) {
      adminCategoriesCache.data = adminCategoriesCache.data.filter(cat => cat.id !== id);
      
      // Update session storage
      try {
        sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
          data: adminCategoriesCache.data,
          timestamp: adminCategoriesCache.timestamp
        }));
      } catch (error) {
        console.log('Session storage update failed:', error);
      }
    }
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Toggle category status with cache update
 */
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  try {
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await apiClient.patch(`/CourseCategories/${id}/toggle-status`, {}, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache if it exists
    if (adminCategoriesCache.data) {
      adminCategoriesCache.data = adminCategoriesCache.data.map(cat => 
        cat.id === id ? response.data : cat
      );
      
      // Update session storage
      try {
        sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
          data: adminCategoriesCache.data,
          timestamp: adminCategoriesCache.timestamp
        }));
      } catch (error) {
        console.log('Session storage update failed:', error);
      }
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Clear the admin categories cache - useful for forcing a refresh
 */
export const clearAdminCategoriesCache = () => {
  adminCategoriesCache.data = null;
  adminCategoriesCache.timestamp = 0;
  adminCategoriesCache.isLoading = false;
  
  // Clear session storage
  try {
    sessionStorage.removeItem(CATEGORIES_STORAGE_KEY);
  } catch (error) {
    console.log('Session storage clear failed:', error);
  }
  
  console.log('Admin categories cache cleared');
};

/**
 * Preload categories data in the background
 */
export const preloadAdminCategories = () => {
  // Don't wait for the result, just trigger the request
  getAllCategories().catch(() => {
    // Silently handle errors for preload
  });
};

/**
 * Get cache status for debugging
 */
export const getAdminCategoriesCacheStatus = () => {
  return {
    hasCachedData: !!adminCategoriesCache.data,
    cacheAge: adminCategoriesCache.timestamp ? Date.now() - adminCategoriesCache.timestamp : 0,
    isLoading: adminCategoriesCache.isLoading,
    cacheSize: adminCategoriesCache.data?.length || 0
  };
};