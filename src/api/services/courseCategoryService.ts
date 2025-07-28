// src/api/services/courseCategoryService.ts
// ENTERPRISE OPTIMIZED: Ultra-fast API service with smart caching and enrollment filtering
import apiClient from '../apiClient'; 
import { LearnerCourseDto } from '../../types/course.types';
import { 
  emitDashboardRefreshNeeded 
} from '../../utils/dashboardEvents';

// ENTERPRISE: Enhanced interface matching the backend DTO with comprehensive validation
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
    if (this.cache.size > 50) { // Prevent memory bloat
      const oldestEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 10); // Remove oldest 10 entries
      
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
function dedupedRequest<T>(
  key: string, 
  requestFn: () => Promise<T>, 
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<T> {
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

/**
 * ENTERPRISE: Enhanced category fetching with smart caching and validation
 * Get all course categories for the current user.
 * Backend automatically filters inactive/deleted categories for learners.
 */
export const getCategories = async (): Promise<CourseCategoryDtoBackend[]> => {
  const cacheKey = 'learner_categories';
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<CourseCategoryDtoBackend[]>(cacheKey);
  if (cachedData) {
    console.log(`📦 Categories served from cache (${cachedData.length} items)`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching fresh categories from API...');
    
    const response = await apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories', {
      timeout: 15000 // 15 second timeout for learner-facing requests
    });
    
    if (!Array.isArray(response.data)) {
      console.error('API response for categories is not an array:', response.data);
      throw new Error('Invalid API response format for categories');
    }
    
    // ENTERPRISE: Enhanced data validation and transformation
    const validatedData: CourseCategoryDtoBackend[] = response.data.map(category => ({
      ...category,
      // Ensure all required fields exist with defaults
      id: category.id || '',
      title: category.title || 'Untitled Category',
      description: category.description || 'No description available',
      icon: category.icon || 'code2',
      status: category.status || 'active',
      totalCourses: category.totalCourses || 0,
      activeLearnersCount: category.activeLearnersCount || 0,
      avgDuration: category.avgDuration || 'N/A'
    }));
    
    // ENTERPRISE: Smart caching with longer TTL for learner data (less frequent changes)
    cache.set(cacheKey, validatedData, 5 * 60 * 1000); // 5 minutes for learner categories
    
    // ENTERPRISE: Emit dashboard events for real-time updates
    emitDashboardRefreshNeeded('categories-loaded');
    
    console.log(`✅ Categories cached (${validatedData.length} items)`);
    return validatedData;
  }, 'high');
};

/**
 * ENTERPRISE: Get categories with enrolled course filtering
 * Only shows categories that have courses OR where learner has enrollments
 */
export const getCategoriesWithEnrollmentFilter = async (): Promise<CourseCategoryDtoBackend[]> => {
  const cacheKey = 'learner_categories_with_enrollments';
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<CourseCategoryDtoBackend[]>(cacheKey);
  if (cachedData) {
    console.log(`📦 Filtered categories served from cache (${cachedData.length} items)`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching categories with enrollment filtering...');
    
    try {
      // Fetch all categories and enrolled courses in parallel
      const [categoriesResponse, enrolledCoursesResponse] = await Promise.allSettled([
        apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories', { timeout: 15000 }),
        apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled', { timeout: 15000 })
      ]);
      
      // Handle categories response
      if (categoriesResponse.status === 'rejected') {
        throw categoriesResponse.reason;
      }
      
      if (!Array.isArray(categoriesResponse.value.data)) {
        console.error('Invalid categories response:', categoriesResponse.value.data);
        return [];
      }
      
      const allCategories = categoriesResponse.value.data;
      
      // Handle enrolled courses response (non-blocking)
      let enrolledCourses: LearnerCourseDto[] = [];
      if (enrolledCoursesResponse.status === 'fulfilled' && Array.isArray(enrolledCoursesResponse.value.data)) {
        enrolledCourses = enrolledCoursesResponse.value.data;
      } else {
        console.warn('Failed to fetch enrolled courses for filtering, showing all active categories');
      }
      
      // Get category IDs where learner has enrolled courses
      const enrolledCategoryIds = new Set(
        enrolledCourses
          .map(course => course.category?.id)
          .filter(Boolean)
      );
      
      // Filter categories based on business logic:
      // 1. Show if category has courses (totalCourses > 0) AND is active
      // 2. OR show if learner has enrolled courses in this category (even if inactive)
      const filteredCategories = allCategories.filter(category => {
        const hasActiveCourses = category.totalCourses > 0 && category.status?.toLowerCase() === 'active';
        const hasEnrolledCourses = enrolledCategoryIds.has(category.id);
        
        console.log(`📋 Category "${category.title}": hasActiveCourses=${hasActiveCourses}, hasEnrolledCourses=${hasEnrolledCourses}`);
        
        return hasActiveCourses || hasEnrolledCourses;
      });
      
      // ENTERPRISE: Enhanced data validation
      const validatedData: CourseCategoryDtoBackend[] = filteredCategories.map(category => ({
        ...category,
        id: category.id || '',
        title: category.title || 'Untitled Category',
        description: category.description || 'No description available',
        icon: category.icon || 'code2',
        status: category.status || 'active',
        totalCourses: category.totalCourses || 0,
        activeLearnersCount: category.activeLearnersCount || 0,
        avgDuration: category.avgDuration || 'N/A'
      }));
      
      // ENTERPRISE: Smart caching with shorter TTL for filtered data (more dynamic)
      cache.set(cacheKey, validatedData, 2 * 60 * 1000); // 2 minutes for filtered data
      
      console.log(`✅ Filtered categories cached (${validatedData.length}/${allCategories.length} items shown)`);
      return validatedData;
      
    } catch (error: any) {
      console.error('❌ Error fetching filtered categories:', error);
      
      // ENTERPRISE: Fallback to regular categories on error
      try {
        const fallbackResponse = await apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories', { timeout: 10000 });
        if (Array.isArray(fallbackResponse.data)) {
          console.log('🔄 Using fallback categories (no filtering)');
          const fallbackData = fallbackResponse.data.filter(cat => cat.totalCourses > 0 && cat.status?.toLowerCase() === 'active');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback categories fetch failed:', fallbackError);
      }
      
      return [];
    }
  }, 'high');
};

/**
 * ENTERPRISE: Enhanced individual category fetching with smart caching
 * Get a specific category by ID - optimized for admin/coordinator use
 */
export const getCategoryById = async (id: string): Promise<CourseCategoryDtoBackend> => {
  const cacheKey = `category_${id}`;
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<CourseCategoryDtoBackend>(cacheKey);
  if (cachedData) {
    console.log(`📦 Category served from cache: ${id}`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log(`🔍 Fetching category by ID: ${id}`);
    
    const response = await apiClient.get<CourseCategoryDtoBackend>(`/CourseCategories/${id}`, {
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid API response format for category');
    }
    
    // ENTERPRISE: Enhanced data validation
    const validatedData: CourseCategoryDtoBackend = {
      ...response.data,
      id: response.data.id || id,
      title: response.data.title || 'Untitled Category',
      description: response.data.description || 'No description available',
      icon: response.data.icon || 'code2',
      status: response.data.status || 'active',
      totalCourses: response.data.totalCourses || 0,
      activeLearnersCount: response.data.activeLearnersCount || 0,
      avgDuration: response.data.avgDuration || 'N/A'
    };
    
    // ENTERPRISE: Cache individual category with medium TTL
    cache.set(cacheKey, validatedData, 3 * 60 * 1000); // 3 minutes for individual categories
    
    console.log(`✅ Category cached: ${id}`);
    return validatedData;
  }, 'high');
};

/**
 * ENTERPRISE: Enhanced cache management with intelligent invalidation
 * Clear any local caches - updated to clear new cache
 */
export const clearCategoriesCache = (): void => {
  console.log('🧹 Clearing categories cache');
  cache.clear();
  activeRequests.clear();
  
  // Clear any session storage cache
  try {
    sessionStorage.removeItem('course_categories_simple');
  } catch (error) {
    console.warn('Failed to clear session storage:', error);
  }
  
  // ENTERPRISE: Emit cache clear event
  emitDashboardRefreshNeeded('cache-cleared');
};

/**
 * ENTERPRISE: Performance monitoring and diagnostics
 */
export const getCacheMetrics = () => cache.getMetrics();

/**
 * ENTERPRISE: Preload categories for better perceived performance
 */
export const preloadCategories = async (): Promise<void> => {
  try {
    await getCategoriesWithEnrollmentFilter(); // Use filtered version by default
    console.log('⚡ Filtered categories preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload filtered categories:', error);
  }
};

/**
 * ENTERPRISE: Smart cache invalidation for specific patterns
 */
export const invalidateCategoryCache = (categoryId?: string): void => {
  if (categoryId) {
    cache.invalidate(`category_${categoryId}`);
  } else {
    cache.invalidate('category');
    cache.invalidate('learner_categories');
    cache.invalidate('learner_categories_with_enrollments');
  }
  console.log(`🧹 Category cache invalidated: ${categoryId || 'all'}`);
};