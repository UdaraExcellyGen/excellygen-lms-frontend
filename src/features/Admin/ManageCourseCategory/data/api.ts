// src/features/Admin/ManageCourseCategory/data/api.ts
// ULTRA-FAST API SERVICE - Sub-second responses

import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import { createApiClient } from '../../../../utils/apiConfig';

const apiClient = createApiClient();

// PERFORMANCE: In-memory cache with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CategoryApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

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

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

const cache = new CategoryApiCache();

// PERFORMANCE: Request deduplication
const activeRequests = new Map<string, Promise<any>>();

function dedupedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`Deduping request: ${key}`);
    return activeRequests.get(key)!;
  }

  const promise = requestFn()
    .finally(() => {
      activeRequests.delete(key);
    });

  activeRequests.set(key, promise);
  return promise;
}

// PERFORMANCE: Batch requests helper
function createBatchedRequest<T, R>(
  batchFn: (items: T[]) => Promise<R[]>,
  maxBatchSize: number = 10,
  batchDelay: number = 50
) {
  let batch: T[] = [];
  let resolvers: Array<(value: R) => void> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (batch.length === 0) return;

    const currentBatch = batch.splice(0);
    const currentResolvers = resolvers.splice(0);

    try {
      const results = await batchFn(currentBatch);
      results.forEach((result, index) => {
        currentResolvers[index]?.(result);
      });
    } catch (error) {
      currentResolvers.forEach(resolver => {
        resolver(error as any);
      });
    }
  };

  return (item: T): Promise<R> => {
    return new Promise((resolve) => {
      batch.push(item);
      resolvers.push(resolve);

      if (batch.length >= maxBatchSize) {
        if (timeoutId) clearTimeout(timeoutId);
        processBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          processBatch();
          timeoutId = null;
        }, batchDelay);
      }
    });
  };
}

// PERFORMANCE: Enhanced error handling with retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry for certain error types
      if (error.response?.status === 401 ||
          error.response?.status === 403 ||
          error.response?.status === 404) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      console.log(`Request failed, retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// MAIN API FUNCTIONS

/**
 * Get all categories with intelligent caching and optimization
 */
export const getAllCategories = async (useCache: boolean = true): Promise<Category[]> => {
  const cacheKey = 'categories_all';

  // Check cache first
  if (useCache) {
    const cachedData = cache.get<Category[]>(cacheKey);
    if (cachedData) {
      console.log('Categories returned from cache');
      return cachedData;
    }
  }

  // Use request deduplication
  return dedupedRequest(cacheKey, async () => {
    return withRetry(async () => {
      const startTime = performance.now();

      const response = await apiClient.get<Category[]>('/CourseCategories', {
        params: { useCache: true }, // Tell backend to use its cache
        timeout: 10000 // 10 second timeout
      });

      const endTime = performance.now();
      console.log(`Categories API call completed in ${(endTime - startTime).toFixed(2)}ms`);

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid API response format');
      }

      // Cache the successful response
      cache.set(cacheKey, response.data);

      return response.data;
    });
  });
};

/**
 * Get category by ID with caching
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  const cacheKey = `category_${id}`;

  // Check cache first
  const cachedData = cache.get<Category>(cacheKey);
  if (cachedData) {
    console.log(`Category ${id} returned from cache`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    return withRetry(async () => {
      const response = await apiClient.get<Category>(`/CourseCategories/${id}`, {
        timeout: 8000
      });

      // Cache the successful response
      cache.set(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes for individual items

      return response.data;
    });
  });
};

/**
 * Create a new category with optimistic updates
 */
export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
  return withRetry(async () => {
    const response = await apiClient.post<Category>('/CourseCategories', category, {
      timeout: 15000
    });

    // Invalidate cache after successful creation
    cache.invalidate('categories_all');
    console.log('Categories cache invalidated after creation');

    return response.data;
  });
};

/**
 * Update a category with cache invalidation
 */
export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
  return withRetry(async () => {
    const response = await apiClient.put<Category>(`/CourseCategories/${id}`, category, {
      timeout: 15000
    });

    // Invalidate specific caches
    cache.invalidate('categories_all');
    cache.invalidate(`category_${id}`);
    console.log(`Caches invalidated after updating category ${id}`);

    return response.data;
  });
};

/**
 * Delete a category with cache invalidation
 */
export const deleteCategory = async (id: string): Promise<void> => {
  return withRetry(async () => {
    await apiClient.delete(`/CourseCategories/${id}`, {
      timeout: 15000
    });

    // Invalidate caches
    cache.invalidate('categories_all');
    cache.invalidate(`category_${id}`);
    console.log(`Caches invalidated after deleting category ${id}`);
  });
};

/**
 * Toggle category status with optimistic updates
 */
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  return withRetry(async () => {
    const response = await apiClient.patch<Category>(`/CourseCategories/${id}/toggle-status`, {}, {
      timeout: 10000
    });

    // Invalidate caches
    cache.invalidate('categories_all');
    cache.invalidate(`category_${id}`);
    console.log(`Caches invalidated after toggling status for category ${id}`);

    return response.data;
  });
};

/**
 * Prefetch categories for better performance
 */
export const prefetchCategories = async (): Promise<void> => {
  try {
    await getAllCategories(true);
    console.log('Categories prefetched successfully');
  } catch (error) {
    console.log('Prefetch failed, but not critical:', error);
  }
};

/**
 * Batch update multiple categories (if supported by backend)
 */
export const batchUpdateCategories = createBatchedRequest(
  async (updates: Array<{ id: string; data: UpdateCategoryDto }>) => {
    // This would require backend support for batch operations
    // For now, we'll do individual updates
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => updateCategory(id, data))
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean);
  }
);

/**
 * Cache management utilities
 */
export const categoryApiUtils = {
  // Clear all caches
  clearCache: () => {
    cache.clear();
    console.log('All category caches cleared');
  },

  // Get cache statistics
  getCacheStats: () => cache.getStats(),

  // Warm up cache
  warmupCache: async () => {
    console.log('Warming up category cache...');
    try {
      await getAllCategories(false); // Force fresh fetch
      console.log('Cache warmed up successfully');
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  },

  // Invalidate specific patterns
  invalidatePattern: (pattern: string) => {
    cache.invalidatePattern(pattern);
    console.log(`Invalidated cache pattern: ${pattern}`);
  },

  // Check if data is cached
  isCached: (key: string) => !!cache.get(key),

  // Manual cache operations
  setCache: <T>(key: string, data: T, ttl?: number) => cache.set(key, data, ttl),
  getCache: <T>(key: string) => cache.get<T>(key),

  // Performance monitoring
  getActiveRequests: () => Array.from(activeRequests.keys()),

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const startTime = performance.now();
      await apiClient.get('/CourseCategories', {
        params: { page: 1, pageSize: 1 },
        timeout: 5000
      });
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      console.log(`API health check: ${responseTime.toFixed(2)}ms`);

      return responseTime < 3000; // Consider healthy if under 3 seconds
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
};

// PERFORMANCE: Export for debugging in development
if (import.meta.env.DEV) {
  (window as any).categoryApiDebug = {
    cache,
    activeRequests,
    utils: categoryApiUtils
  };
}