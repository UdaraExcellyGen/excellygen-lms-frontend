// src/features/Admin/ManageCourseCategory/data/api.ts
// ULTRA-FAST API SERVICE - Sub-second responses

import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import apiClient from '../../../../api/apiClient';

// PERFORMANCE: Enhanced cache with better deduplication
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CategoryApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes - shorter for better freshness

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new CategoryApiCache();
const activeRequests = new Map<string, Promise<any>>();

// Enhanced deduplication with timeout
function dedupedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`⚡ Deduping request: ${key}`);
    return activeRequests.get(key)!;
  }

  const promise = requestFn()
    .finally(() => {
      // Clean up after 1 second to allow for very quick sequential calls
      setTimeout(() => {
        activeRequests.delete(key);
      }, 1000);
    });

  activeRequests.set(key, promise);
  return promise;
}

// Get all categories, with an option for admins to include soft-deleted items
export const getAllCategories = async (includeDeleted: boolean = false): Promise<Category[]> => {
    const cacheKey = `categories_all_${includeDeleted}`;
    
    // Check cache first
    const cachedData = cache.get<Category[]>(cacheKey);
    if (cachedData) {
        console.log(`📦 Categories returned from cache (${cachedData.length} items)`);
        return cachedData;
    }

    return dedupedRequest(cacheKey, async () => {
        console.log(`🔄 Fetching fresh categories (includeDeleted: ${includeDeleted})`);
        
        const response = await apiClient.get<Category[]>('/CourseCategories', {
            params: { includeDeleted }
        });
        
        if (!Array.isArray(response.data)) {
            throw new Error('Invalid API response format for categories');
        }
        
        // Cache the result
        cache.set(cacheKey, response.data);
        console.log(`✅ Categories cached (${response.data.length} items)`);
        
        return response.data;
    });
};

export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
    console.log('🆕 Creating new category:', category.title);
    const response = await apiClient.post<Category>('/CourseCategories', category);
    
    // Clear all caches to ensure fresh data
    cache.clear();
    activeRequests.clear();
    
    return response.data;
};

export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    console.log('📝 Updating category:', id);
    const response = await apiClient.put<Category>(`/CourseCategories/${id}`, category);
    
    // Invalidate relevant caches
    cache.invalidate(`categories_all_true`);
    cache.invalidate(`categories_all_false`);
    cache.invalidate(`category_${id}`);
    
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    console.log('🗑️ Deleting category:', id);
    await apiClient.delete(`/CourseCategories/${id}`);
    
    // Clear all caches since this affects the list
    cache.clear();
    activeRequests.clear();
};

export const restoreCategory = async (id: string): Promise<Category> => {
    console.log('♻️ Restoring category:', id);
    const response = await apiClient.post<Category>(`/CourseCategories/${id}/restore`, {});
    
    // Clear all caches to refresh all views
    cache.clear();
    activeRequests.clear();
    
    return response.data;
};

export const toggleCategoryStatus = async (id: string): Promise<Category> => {
    console.log('🔄 Toggling category status:', id);
    const response = await apiClient.patch<Category>(`/CourseCategories/${id}/toggle-status`);
    
    // Invalidate relevant caches
    cache.invalidate(`categories_all_true`);
    cache.invalidate(`categories_all_false`);
    cache.invalidate(`category_${id}`);
    
    return response.data;
};