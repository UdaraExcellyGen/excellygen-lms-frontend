// src/api/services/courseCategoryService.ts
import apiClient from '../apiClient'; 

// Interface matching the backend DTO
export interface CourseCategoryDtoBackend {
  id: string;
  title: string;
  description: string;
  icon: string; // The string name of the icon (e.g., "code")
  status: string;
  totalCourses: number; 
  activeLearnersCount: number; 
  avgDuration: string;
}

// OPTIMIZATION: Add caching for categories
let categoriesCache: {
  data: CourseCategoryDtoBackend[] | null;
  timestamp: number;
  isLoading: boolean;
} = {
  data: null,
  timestamp: 0,
  isLoading: false
};

// Cache duration: 10 minutes (categories don't change often)
const CATEGORIES_CACHE_DURATION = 10 * 60 * 1000;

/**
 * Get all course categories (works for both Admin and Learner roles)
 * Includes caching for better performance
 */
export const getCategories = async (): Promise<CourseCategoryDtoBackend[]> => {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (categoriesCache.data && (now - categoriesCache.timestamp) < CATEGORIES_CACHE_DURATION && !categoriesCache.isLoading) {
    console.log('Returning cached categories data');
    return categoriesCache.data;
  }
  
  // If already loading, wait for the existing request
  if (categoriesCache.isLoading) {
    console.log('Categories request already in progress, waiting...');
    let attempts = 0;
    while (categoriesCache.isLoading && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (categoriesCache.data) {
      return categoriesCache.data;
    }
  }
  
  try {
    categoriesCache.isLoading = true;
    console.log('Fetching categories from API...');
    
    // Add timeout for this specific request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('API Response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('API response for categories is not an array:', response.data);
      throw new Error('Invalid API response format for categories');
    }
    
    // Update cache
    categoriesCache.data = response.data;
    categoriesCache.timestamp = now;
    
    // Backend now handles role-based filtering automatically
    return response.data;
    
  } catch (error: any) {
    console.error('Error fetching course categories:', error);
    
    // Return cached data if available, even if expired
    if (categoriesCache.data) {
      console.log('Returning expired cached categories due to error');
      return categoriesCache.data;
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
      throw error;
    }
  } finally {
    categoriesCache.isLoading = false;
  }
};

/**
 * Get courses by category ID (works for both Admin and Learner roles)
 * No caching for courses as they change more frequently
 */
export const getCoursesByCategory = async (categoryId: string) => {
  try {
    console.log(`Fetching courses for category: ${categoryId}`);
    
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await apiClient.get(`/CourseCategories/${categoryId}/courses`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching courses for category ${categoryId}:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out while loading courses.');
    } else if (error.response?.status === 404) {
      throw new Error('Course category not found or no courses available.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to view courses in this category.');
    }
    
    throw error;
  }
};

/**
 * Clear the categories cache - useful for forcing a refresh
 */
export const clearCategoriesCache = () => {
  categoriesCache.data = null;
  categoriesCache.timestamp = 0;
  categoriesCache.isLoading = false;
  console.log('Categories cache cleared');
};

/**
 * Preload categories data in the background
 */
export const preloadCategories = () => {
  // Don't wait for the result, just trigger the request
  getCategories().catch(() => {
    // Silently handle errors for preload
  });
};