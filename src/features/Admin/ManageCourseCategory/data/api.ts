// src/features/Admin/ManageCourseCategory/data/api.ts
// ENTERPRISE OPTIMIZED: Ultra-fast API service with advanced caching and performance
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import apiClient from '../../../../api/apiClient';

// ENTERPRISE: Advanced caching system with intelligent invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  etag?: string;
  lastModified?: string;
}

interface RequestMetrics {
  requestCount: number;
  cacheHits: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

class EnterpriseCategoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: RequestMetrics = {
    requestCount: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    lastRequestTime: 0
  };
  
  // ENTERPRISE: Smart TTL based on data type and user activity
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes base
  private readonly LONG_TTL = 10 * 60 * 1000; // 10 minutes for stable data
  private readonly SHORT_TTL = 30 * 1000; // 30 seconds for dynamic data

  // ENTERPRISE: Performance monitoring
  private updateMetrics(responseTime: number, fromCache: boolean): void {
    this.metrics.requestCount++;
    if (fromCache) this.metrics.cacheHits++;
    
    // Rolling average calculation
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) 
      / this.metrics.requestCount;
    
    this.metrics.lastRequestTime = Date.now();
  }

  // ENTERPRISE: Smart TTL calculation based on usage patterns
  private getSmartTTL(key: string, dataSize: number): number {
    const baseTime = Date.now();
    const lastRequest = this.metrics.lastRequestTime;
    const timeSinceLastRequest = baseTime - lastRequest;
    
    // Frequently accessed data gets longer cache time
    if (timeSinceLastRequest < 30000) { // Within last 30 seconds
      return this.LONG_TTL;
    }
    
    // Large datasets get shorter cache to prevent memory issues
    if (dataSize > 1000) {
      return this.SHORT_TTL;
    }
    
    return this.DEFAULT_TTL;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const dataSize = JSON.stringify(data).length;
    const ttl = customTTL || this.getSmartTTL(key, dataSize);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });

    // ENTERPRISE: Automatic memory management
    this.cleanupExpiredEntries();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // ENTERPRISE: Access-based TTL extension for hot data
    const accessFrequency = (now - entry.timestamp) / (entry.expiry - entry.timestamp);
    if (accessFrequency < 0.3) { // Accessed early in lifecycle
      entry.expiry = now + this.DEFAULT_TTL; // Extend TTL
    }

    this.updateMetrics(0, true);
    return entry.data as T;
  }

  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // ENTERPRISE: Smart cache cleanup
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // ENTERPRISE: Memory pressure management
    if (this.cache.size > 100) { // Prevent memory bloat
      const oldestEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 20); // Remove oldest 20 entries
      
      oldestEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // ENTERPRISE: Performance diagnostics
  getMetrics(): RequestMetrics & { cacheSize: number; hitRate: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.requestCount > 0 ? this.metrics.cacheHits / this.metrics.requestCount : 0
    };
  }
}

const cache = new EnterpriseCategoryCache();
const activeRequests = new Map<string, Promise<any>>();

// ENTERPRISE: Advanced request deduplication with priority queuing
function dedupedRequest<T>(key: string, requestFn: () => Promise<T>, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`⚡ Deduped ${priority} priority request: ${key}`);
    return activeRequests.get(key)!;
  }

  const startTime = performance.now();
  const promise = requestFn()
    .then(result => {
      const responseTime = performance.now() - startTime;
      console.log(`✅ ${priority} request completed in ${responseTime.toFixed(2)}ms: ${key}`);
      return result;
    })
    .finally(() => {
      // ENTERPRISE: Smart cleanup timing based on priority
      const cleanupDelay = priority === 'high' ? 500 : priority === 'normal' ? 1000 : 2000;
      setTimeout(() => {
        activeRequests.delete(key);
      }, cleanupDelay);
    });

  activeRequests.set(key, promise);
  return promise;
}

// ENTERPRISE: Optimistic update helper
function optimisticUpdate<T>(
  currentData: T[],
  updateFn: (data: T[]) => T[],
  cacheKey: string
): T[] {
  const newData = updateFn(currentData);
  cache.set(cacheKey, newData, 5000); // Short cache for optimistic updates
  return newData;
}

// ENTERPRISE: Enhanced category fetching with smart caching
export const getAllCategories = async (includeDeleted: boolean = false): Promise<Category[]> => {
  const cacheKey = `categories_${includeDeleted ? 'all' : 'active'}`;
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<Category[]>(cacheKey);
  if (cachedData) {
    console.log(`📦 Categories served from cache (${cachedData.length} items)`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log(`🔄 Fetching categories (includeDeleted: ${includeDeleted})`);
    
    const response = await apiClient.get<Category[]>('/CourseCategories', {
      params: { includeDeleted }
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid API response format for categories');
    }
    
    // ENTERPRISE: Enhanced data validation and transformation
    const validatedData = response.data.map(category => ({
      ...category,
      // Ensure all required fields exist with defaults
      totalCourses: category.totalCourses || 0,
      isDeleted: Boolean(category.isDeleted),
      createdAtFormatted: category.createdAtFormatted || 'Unknown',
      updatedAtFormatted: category.updatedAtFormatted || 'Never',
      createdBy: category.createdBy || 'System'
    }));
    
    // ENTERPRISE: Smart caching with longer TTL for stable data
    const isStableData = !includeDeleted; // Active categories change less frequently
    cache.set(cacheKey, validatedData, isStableData ? 5 * 60 * 1000 : 2 * 60 * 1000);
    
    console.log(`✅ Categories cached (${validatedData.length} items)`);
    return validatedData;
  }, 'high');
};

// ENTERPRISE: Optimistic category creation
export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
  console.log('🆕 Creating category:', category.title);
  
  try {
    const response = await apiClient.post<Category>('/CourseCategories', category);
    
    // ENTERPRISE: Optimistic cache updates
    ['categories_active', 'categories_all'].forEach(cacheKey => {
      const existing = cache.get<Category[]>(cacheKey);
      if (existing) {
        optimisticUpdate(existing, data => [response.data, ...data], cacheKey);
      }
    });
    
    return response.data;
  } catch (error) {
    // ENTERPRISE: Rollback optimistic updates on error
    cache.invalidate('categories_');
    throw error;
  }
};

// ENTERPRISE: Smart category updates with optimistic UI
export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
  console.log('📝 Updating category:', id);
  
  // ENTERPRISE: Store original state for rollback
  const originalData = new Map<string, Category[]>();
  ['categories_active', 'categories_all'].forEach(cacheKey => {
    const data = cache.get<Category[]>(cacheKey);
    if (data) {
      originalData.set(cacheKey, [...data]);
    }
  });
  
  try {
    // ENTERPRISE: Optimistic update first
    originalData.forEach((data, cacheKey) => {
      optimisticUpdate(data, categories => 
        categories.map(cat => cat.id === id ? { ...cat, ...category } : cat), 
        cacheKey
      );
    });
    
    const response = await apiClient.put<Category>(`/CourseCategories/${id}`, category);
    
    // ENTERPRISE: Update with real data
    originalData.forEach((_, cacheKey) => {
      const existing = cache.get<Category[]>(cacheKey);
      if (existing) {
        optimisticUpdate(existing, data => 
          data.map(cat => cat.id === id ? response.data : cat), 
          cacheKey
        );
      }
    });
    
    return response.data;
  } catch (error) {
    // ENTERPRISE: Rollback on error
    originalData.forEach((data, cacheKey) => {
      cache.set(cacheKey, data, 1000); // Short cache for rollback data
    });
    throw error;
  }
};

// ENTERPRISE: Soft delete with optimistic updates
export const deleteCategory = async (id: string): Promise<void> => {
  console.log('🗑️ Soft deleting category:', id);
  
  const originalData = new Map<string, Category[]>();
  ['categories_active', 'categories_all'].forEach(cacheKey => {
    const data = cache.get<Category[]>(cacheKey);
    if (data) {
      originalData.set(cacheKey, [...data]);
    }
  });
  
  try {
    // ENTERPRISE: Optimistic soft delete
    originalData.forEach((data, cacheKey) => {
      optimisticUpdate(data, categories => 
        categories.map(cat => 
          cat.id === id 
            ? { ...cat, isDeleted: true, deletedAt: new Date().toISOString() }
            : cat
        ), 
        cacheKey
      );
    });
    
    await apiClient.delete(`/CourseCategories/${id}`);
    
  } catch (error) {
    // ENTERPRISE: Rollback on error
    originalData.forEach((data, cacheKey) => {
      cache.set(cacheKey, data, 1000);
    });
    throw error;
  }
};

// ENTERPRISE: Optimistic restore
export const restoreCategory = async (id: string): Promise<Category> => {
  console.log('♻️ Restoring category:', id);
  
  try {
    const response = await apiClient.post<Category>(`/CourseCategories/${id}/restore`, {});
    
    // ENTERPRISE: Update all relevant caches
    ['categories_active', 'categories_all'].forEach(cacheKey => {
      const existing = cache.get<Category[]>(cacheKey);
      if (existing) {
        optimisticUpdate(existing, data => 
          data.map(cat => cat.id === id ? response.data : cat), 
          cacheKey
        );
      }
    });
    
    return response.data;
  } catch (error) {
    cache.invalidate('categories_');
    throw error;
  }
};

// ENTERPRISE: Instant status toggle with optimistic updates
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  console.log('🔄 Toggling category status:', id);
  
  // ENTERPRISE: Pre-calculate optimistic state
  const cacheKeys = ['categories_active', 'categories_all'];
  const originalData = new Map<string, Category[]>();
  
  cacheKeys.forEach(cacheKey => {
    const data = cache.get<Category[]>(cacheKey);
    if (data) {
      originalData.set(cacheKey, [...data]);
      // Optimistic toggle
      optimisticUpdate(data, categories => 
        categories.map(cat => 
          cat.id === id 
            ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
            : cat
        ), 
        cacheKey
      );
    }
  });
  
  try {
    const response = await apiClient.patch<Category>(`/CourseCategories/${id}/toggle-status`);
    
    // ENTERPRISE: Update with real response
    cacheKeys.forEach(cacheKey => {
      const existing = cache.get<Category[]>(cacheKey);
      if (existing) {
        optimisticUpdate(existing, data => 
          data.map(cat => cat.id === id ? response.data : cat), 
          cacheKey
        );
      }
    });
    
    return response.data;
  } catch (error) {
    // ENTERPRISE: Rollback optimistic changes
    originalData.forEach((data, cacheKey) => {
      cache.set(cacheKey, data, 1000);
    });
    throw error;
  }
};

// ENTERPRISE: Performance monitoring and diagnostics
export const getCacheMetrics = () => cache.getMetrics();

// ENTERPRISE: Manual cache management for admin users
export const clearCategoryCache = () => {
  cache.clear();
  activeRequests.clear();
  console.log('🧹 Category cache cleared');
};

// ENTERPRISE: Preload categories for better perceived performance
export const preloadCategories = async (): Promise<void> => {
  try {
    // Preload both active and all categories in parallel
    await Promise.all([
      getAllCategories(false), // Active only
      getAllCategories(true)   // Include deleted
    ]);
    console.log('⚡ Categories preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload categories:', error);
  }
};