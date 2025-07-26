// src/api/services/courseCategoryService.ts
import apiClient from '../apiClient'; 

// Interface matching the backend DTO
export interface CourseCategoryDtoBackend {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses: number; 
  activeLearnersCount: number; 
  avgDuration: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdAtFormatted?: string;
  updatedAtFormatted?: string;
  createdBy?: string;
}

// Simple cache to prevent duplicate calls
let categoryCache: {
  data: CourseCategoryDtoBackend[] | null;
  timestamp: number;
  isLoading: boolean;
} = {
  data: null,
  timestamp: 0,
  isLoading: false
};

// Cache for 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

/**
 * Get all course categories for the current user.
 * Backend automatically filters inactive/deleted categories for learners.
 */
export const getCategories = async (): Promise<CourseCategoryDtoBackend[]> => {
  const now = Date.now();
  
  // Return cached data if valid
  if (categoryCache.data && (now - categoryCache.timestamp) < CACHE_DURATION && !categoryCache.isLoading) {
    console.log('Returning cached categories');
    return categoryCache.data;
  }
  
  // If already loading, wait for it
  if (categoryCache.isLoading) {
    console.log('Categories already loading, waiting...');
    let attempts = 0;
    while (categoryCache.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (categoryCache.data) {
      return categoryCache.data;
    }
  }
  
  try {
    categoryCache.isLoading = true;
    console.log('Fetching fresh categories from API...');
    
    const response = await apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories');
    
    if (!Array.isArray(response.data)) {
      console.error('API response for categories is not an array:', response.data);
      throw new Error('Invalid API response format for categories');
    }
    
    // Cache the result
    categoryCache.data = response.data;
    categoryCache.timestamp = now;
    
    return response.data;
    
  } catch (error: any) {
    console.error('Error fetching course categories:', error);
    
    // Return cached data if available on error
    if (categoryCache.data) {
      console.log('Returning cached categories due to error');
      return categoryCache.data;
    }
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      throw new Error('Access denied to course categories');
    } else if (error.response?.status === 404) {
      throw new Error('Course categories not found');
    } else if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw error;
  } finally {
    categoryCache.isLoading = false;
  }
};

// Cache for individual categories
const individualCategoryCache = new Map<string, {
  data: CourseCategoryDtoBackend;
  timestamp: number;
}>();

/**
 * Get a specific category by ID - for admin use
 */
export const getCategoryById = async (id: string): Promise<CourseCategoryDtoBackend> => {
  const now = Date.now();
  const cached = individualCategoryCache.get(id);
  
  // Return cached data if valid (1 minute cache)
  if (cached && (now - cached.timestamp) < 60000) {
    console.log(`📦 Returning cached category: ${id}`);
    return cached.data;
  }
  
  try {
    console.log(`🔍 Fetching category by ID: ${id}`);
    const response = await apiClient.get<CourseCategoryDtoBackend>(`/CourseCategories/${id}`, {
      timeout: 10000 // 10 second timeout
    });
    
    // Cache the result
    individualCategoryCache.set(id, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching category by ID:', error);
    
    // Return cached data on error if available
    if (cached) {
      console.log(`🔄 Returning expired cached category due to error: ${id}`);
      return cached.data;
    }
    
    if (error.response?.status === 404) {
      throw new Error('Category not found or has been removed');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out - please try again');
    } else if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
};

/**
 * Clear any local caches - updated to clear new cache
 */
export const clearCategoriesCache = () => {
  console.log('Clearing categories cache');
  categoryCache.data = null;
  categoryCache.timestamp = 0;
  categoryCache.isLoading = false;
  individualCategoryCache.clear(); // Clear individual category cache too
  // Clear any session storage cache
  sessionStorage.removeItem('course_categories_simple');
};