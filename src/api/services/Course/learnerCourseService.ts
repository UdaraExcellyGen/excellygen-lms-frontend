// src/api/services/Course/learnerCourseService.ts
// ENTERPRISE OPTIMIZED: Ultra-fast course service with smart caching and deduplication
import apiClient from '../../apiClient';
import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';

// ENTERPRISE: Create a simple event emitter to avoid import issues
const emitDashboardRefreshNeeded = (eventType: string) => {
  try {
    window.dispatchEvent(new CustomEvent('dashboard-refresh-needed', { 
      detail: { eventType } 
    }));
  } catch (error) {
    console.warn('Failed to emit dashboard refresh event:', error);
  }
};

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
  errorCount: number;
}

class EnterpriseCourseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: RequestMetrics = {
    requestCount: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    lastRequestTime: 0,
    errorCount: 0
  };
  
  // ENTERPRISE: Smart TTL based on data type and user activity
  private readonly COURSES_TTL = 3 * 60 * 1000; // 3 minutes for course lists
  private readonly COURSE_DETAIL_TTL = 5 * 60 * 1000; // 5 minutes for individual courses
  private readonly ENROLLMENT_TTL = 1 * 60 * 1000; // 1 minute for enrollment data
  private readonly ERROR_RETRY_TTL = 30 * 1000; // 30 seconds before retry on error

  // ENTERPRISE: Performance monitoring
  private updateMetrics(responseTime: number, fromCache: boolean, isError: boolean = false): void {
    this.metrics.requestCount++;
    if (fromCache) this.metrics.cacheHits++;
    if (isError) this.metrics.errorCount++;
    
    // Rolling average calculation
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) 
      / this.metrics.requestCount;
    
    this.metrics.lastRequestTime = Date.now();
  }

  // ENTERPRISE: Smart TTL calculation based on data type
  private getSmartTTL(key: string, dataSize: number): number {
    if (key.includes('enrollment')) return this.ENROLLMENT_TTL;
    if (key.includes('detail')) return this.COURSE_DETAIL_TTL;
    if (dataSize > 5000) return this.COURSES_TTL / 2; // Shorter cache for large data
    return this.COURSES_TTL;
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
      entry.expiry = now + this.COURSES_TTL; // Extend TTL
    }

    this.updateMetrics(0, true);
    return entry.data as T;
  }

  // ENTERPRISE: Get expired cache data for fallback
  getExpired<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data as T : null;
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
    console.log('🧹 Course cache cleared');
  }

  // ENTERPRISE: Performance diagnostics
  getMetrics(): RequestMetrics & { cacheSize: number; hitRate: number; errorRate: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.requestCount > 0 ? this.metrics.cacheHits / this.metrics.requestCount : 0,
      errorRate: this.metrics.requestCount > 0 ? this.metrics.errorCount / this.metrics.requestCount : 0
    };
  }
}

const cache = new EnterpriseCourseCache();
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
    .catch(error => {
      console.error(`❌ ${priority} request failed: ${key}`, error);
      throw error;
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

// ENTERPRISE: Enhanced data validation for course responses
const validateCourseData = (course: any): LearnerCourseDto => {
  if (!course || typeof course !== 'object') {
    console.warn('Invalid course data received:', course);
    return {
      id: 0,
      title: 'Invalid Course',
      description: '',
      isEnrolled: false,
      progressPercentage: 0,
      totalLessons: 0,
      completedLessons: 0,
      estimatedTime: 0,
      activeLearnersCount: 0,
      creator: { name: 'Unknown', id: '' },
      category: { id: '', title: 'Unknown' },
      technologies: [],
      lessons: [],
      thumbnailUrl: null,
      isInactive: false,
      enrollmentId: null
    };
  }

  return {
    ...course,
    id: course.id || 0,
    title: course.title || 'Untitled Course',
    description: course.description || '',
    isEnrolled: Boolean(course.isEnrolled),
    progressPercentage: Number(course.progressPercentage) || 0,
    totalLessons: Number(course.totalLessons) || 0,
    completedLessons: Number(course.completedLessons) || 0,
    estimatedTime: Number(course.estimatedTime) || 0,
    activeLearnersCount: Number(course.activeLearnersCount) || 0,
    creator: course.creator || { name: 'Unknown', id: '' },
    category: course.category || { id: '', title: 'Unknown' },
    technologies: Array.isArray(course.technologies) ? course.technologies : [],
    lessons: Array.isArray(course.lessons) ? course.lessons : [],
    thumbnailUrl: course.thumbnailUrl || null,
    isInactive: Boolean(course.isInactive),
    enrollmentId: course.enrollmentId || null
  };
};

/**
 * ENTERPRISE: Enhanced courses fetching by category with smart caching
 * Gets available and enrolled courses for a specific category
 */
export const getCoursesForCategory = async (categoryId: string): Promise<{
  available: LearnerCourseDto[];
  categoryEnrolled: LearnerCourseDto[];
}> => {
  const cacheKey = `courses_category_${categoryId}`;
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<{ available: LearnerCourseDto[]; categoryEnrolled: LearnerCourseDto[] }>(cacheKey);
  if (cachedData) {
    console.log(`📦 Courses served from cache for category: ${categoryId}`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log(`🔄 Fetching courses for category: ${categoryId}`);
    
    try {
      // ENTERPRISE: Call existing endpoints if category endpoint doesn't exist - INCREASED TIMEOUT
      const [availableResponse, enrolledResponse] = await Promise.all([
        apiClient.get(`/LearnerCourses/available?categoryId=${categoryId}`, { timeout: 20000 }),
        apiClient.get(`/LearnerCourses/enrolled`, { timeout: 20000 })
      ]);
      
      // Filter enrolled courses by category
      const categoryEnrolledCourses = enrolledResponse.data.filter(
        (course: any) => course.category?.id === categoryId
      );
      
      const response = {
        data: {
          available: availableResponse.data,
          categoryEnrolled: categoryEnrolledCourses
        }
      };
      
      if (!response.data || typeof response.data !== 'object') {
        console.warn('Invalid API response format for courses:', response.data);
        // Return empty data instead of throwing error
        return {
          available: [],
          categoryEnrolled: []
        };
      }
      
      // ENTERPRISE: Enhanced data validation and transformation
      const validatedData = {
        available: Array.isArray(response.data.available) 
          ? response.data.available.map(validateCourseData)
          : [],
        categoryEnrolled: Array.isArray(response.data.categoryEnrolled)
          ? response.data.categoryEnrolled.map(validateCourseData)
          : []
      };
      
      // ENTERPRISE: Smart caching
      cache.set(cacheKey, validatedData);
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitDashboardRefreshNeeded('courses-loaded');
      
      console.log(`✅ Courses cached for category: ${categoryId} (${validatedData.available.length} available, ${validatedData.categoryEnrolled.length} enrolled)`);
      return validatedData;
      
    } catch (error: any) {
      console.error(`❌ Error fetching courses for category ${categoryId}:`, error);
      
      // ENTERPRISE: Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.warn('🕐 Request was cancelled/timed out, using fallback');
        const expiredData = cache.getExpired<{ available: LearnerCourseDto[]; categoryEnrolled: LearnerCourseDto[] }>(cacheKey);
        if (expiredData) {
          console.log('🔄 Using expired cache due to timeout');
          return expiredData;
        }
      }
      
      // ENTERPRISE: Graceful fallback with empty data
      if (error.response?.status === 404) {
        console.log('Category not found, returning empty course lists');
        return {
          available: [],
          categoryEnrolled: []
        };
      }
      
      // ENTERPRISE: Try to return cached data on error (even if expired)
      const keys = Array.from(cache['cache'].keys());
      const expiredCacheKey = keys.find(key => key.includes(`courses_category_${categoryId}`));
      if (expiredCacheKey) {
        const expiredCache = cache['cache'].get(expiredCacheKey);
        if (expiredCache) {
          console.log('🔄 Returning expired cached courses due to error');
          return expiredCache.data;
        }
      }
      
      // Final fallback
      return {
        available: [],
        categoryEnrolled: []
      };
    }
  }, 'high');
};

/**
 * ENTERPRISE: Get enrolled courses for learner dashboard
 * Returns all courses the current learner is enrolled in across all categories
 */
export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
  const cacheKey = 'learner_enrolled_courses';
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<LearnerCourseDto[]>(cacheKey);
  if (cachedData) {
    console.log(`📦 Enrolled courses served from cache (${cachedData.length} items)`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching enrolled courses for learner...');
    
    try {
      const response = await apiClient.get('/LearnerCourses/enrolled', {
        timeout: 20000 // INCREASED timeout from 15s to 20s
      });
      
      if (!Array.isArray(response.data)) {
        console.warn('Invalid API response format for enrolled courses:', response.data);
        return [];
      }
      
      // ENTERPRISE: Enhanced data validation and transformation
      const validatedData = response.data.map(validateCourseData);
      
      // ENTERPRISE: Smart caching
      cache.set(cacheKey, validatedData);
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitDashboardRefreshNeeded('enrolled-courses-loaded');
      
      console.log(`✅ Enrolled courses cached (${validatedData.length} items)`);
      return validatedData;
      
    } catch (error: any) {
      console.error('❌ Error fetching enrolled courses:', error);
      
      // ENTERPRISE: Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.warn('🕐 Request was cancelled/timed out, using fallback');
        const expiredData = cache.getExpired<LearnerCourseDto[]>(cacheKey);
        if (expiredData) {
          console.log('🔄 Using expired cache due to timeout');
          return expiredData;
        }
      }
      
      // ENTERPRISE: Graceful fallback with empty data
      if (error.response?.status === 404) {
        console.log('No enrolled courses endpoint found, returning empty array');
        return [];
      }
      
      // ENTERPRISE: Try to return cached data on error (even if expired)
      const keys = Array.from(cache['cache'].keys());
      const expiredCacheKey = keys.find(key => key.includes('learner_enrolled_courses'));
      if (expiredCacheKey) {
        const expiredCache = cache['cache'].get(expiredCacheKey);
        if (expiredCache) {
          console.log('🔄 Returning expired cached enrolled courses due to error');
          return expiredCache.data;
        }
      }
      
      // Final fallback
      return [];
    }
  }, 'high');
};

/**
 * ENTERPRISE: Enhanced individual course details fetching with smart caching
 * Gets detailed information for a specific course
 */
export const getLearnerCourseDetails = async (courseId: number): Promise<LearnerCourseDto> => {
  const cacheKey = `course_detail_${courseId}`;
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<LearnerCourseDto>(cacheKey);
  if (cachedData) {
    console.log(`📦 Course details served from cache: ${courseId}`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log(`🔄 Fetching course details: ${courseId}`);
    
    try {
      const response = await apiClient.get(`/LearnerCourses/${courseId}`, {
        timeout: 15000 // INCREASED timeout from 10s to 15s
      });
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid API response format for course details');
      }
      
      // ENTERPRISE: Enhanced data validation
      const validatedData = validateCourseData(response.data);
      
      // ENTERPRISE: Cache with longer TTL for course details
      cache.set(cacheKey, validatedData, 5 * 60 * 1000); // 5 minutes
      
      console.log(`✅ Course details cached: ${courseId}`);
      return validatedData;
      
    } catch (error: any) {
      console.error(`❌ Error fetching course details ${courseId}:`, error);
      
      // ENTERPRISE: Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.warn('🕐 Request was cancelled/timed out, using fallback');
        const expiredData = cache.getExpired<LearnerCourseDto>(cacheKey);
        if (expiredData) {
          console.log('🔄 Using expired cache due to timeout');
          return expiredData;
        }
      }
      
      // ENTERPRISE: Try to return cached data on error
      const keys = Array.from(cache['cache'].keys());
      const expiredCacheKey = keys.find(key => key.includes(`course_detail_${courseId}`));
      if (expiredCacheKey) {
        const expiredCache = cache['cache'].get(expiredCacheKey);
        if (expiredCache) {
          console.log('🔄 Returning expired cached course details due to error');
          return expiredCache.data;
        }
      }
      
      throw error;
    }
  }, 'high');
};

/**
 * ENTERPRISE: Get learner's overall course statistics
 * Returns aggregated statistics for dashboard
 */
export const getLearnerCourseStats = async (): Promise<{
  totalEnrolled: number;
  totalCompleted: number;
  totalInProgress: number;
  totalHoursLearned: number;
}> => {
  const cacheKey = 'learner_course_stats';
  
  // ENTERPRISE: Smart cache check
  const cachedData = cache.get<any>(cacheKey);
  if (cachedData) {
    console.log('📦 Course stats served from cache');
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching learner course statistics...');
    
    try {
      const response = await apiClient.get('/LearnerCourses/stats', {
        timeout: 15000 // INCREASED timeout
      });
      
      const stats = {
        totalEnrolled: Number(response.data.totalEnrolled) || 0,
        totalCompleted: Number(response.data.totalCompleted) || 0,
        totalInProgress: Number(response.data.totalInProgress) || 0,
        totalHoursLearned: Number(response.data.totalHoursLearned) || 0
      };
      
      // ENTERPRISE: Cache stats with shorter TTL (more dynamic data)
      cache.set(cacheKey, stats, 2 * 60 * 1000); // 2 minutes
      
      console.log('✅ Course stats cached');
      return stats;
      
    } catch (error: any) {
      console.error('❌ Error fetching course stats:', error);
      
      // ENTERPRISE: Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.warn('🕐 Request was cancelled/timed out, using fallback');
        const expiredData = cache.getExpired<any>(cacheKey);
        if (expiredData) {
          console.log('🔄 Using expired cache due to timeout');
          return expiredData;
        }
      }
      
      // ENTERPRISE: Fallback to calculating from enrolled courses
      try {
        const enrolledCourses = await getEnrolledCoursesForLearner();
        const fallbackStats = {
          totalEnrolled: enrolledCourses.length,
          totalCompleted: enrolledCourses.filter(c => c.progressPercentage === 100).length,
          totalInProgress: enrolledCourses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length,
          totalHoursLearned: enrolledCourses.reduce((sum, c) => sum + (c.estimatedTime || 0) * (c.progressPercentage || 0) / 100, 0)
        };
        
        console.log('🔄 Using fallback stats calculation');
        return fallbackStats;
      } catch (fallbackError) {
        console.error('❌ Fallback stats calculation failed:', fallbackError);
        return {
          totalEnrolled: 0,
          totalCompleted: 0,
          totalInProgress: 0,
          totalHoursLearned: 0
        };
      }
    }
  }, 'normal');
};

/**
 * ENTERPRISE: Mark document as completed with optimistic updates
 */
export const markDocumentCompleted = async (documentId: number): Promise<{ 
  courseId: number;
  lessonId: number;
  documentId: number;
}> => {
  console.log(`📝 Marking document as completed: ${documentId}`);
  
  try {
    // ENTERPRISE: Use the correct endpoint that matches backend controller
    const response = await apiClient.post(`/LearnerCourses/documents/${documentId}/complete`);
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid API response format for document completion');
    }
    
    const result = {
      courseId: Number(response.data.courseId) || 0,
      lessonId: Number(response.data.lessonId) || 0,
      documentId: Number(response.data.documentId) || documentId
    };
    
    // ENTERPRISE: Invalidate related caches
    cache.invalidate(`course_detail_${result.courseId}`);
    cache.invalidate(`courses_category_`);
    cache.invalidate('learner_enrolled_courses');
    cache.invalidate('learner_course_stats');
    
    // ENTERPRISE: Emit dashboard events for real-time updates
    emitDashboardRefreshNeeded('document-completed');
    
    console.log(`✅ Document completed and caches invalidated: ${documentId}`);
    return result;
    
  } catch (error) {
    console.error('❌ Failed to mark document as completed:', error);
    throw error;
  }
};

/**
 * ENTERPRISE: Clear all course-related caches
 */
export const clearCourseCaches = (): void => {
  console.log('🧹 Clearing all course caches');
  cache.clear();
  activeRequests.clear();
  
  // ENTERPRISE: Emit cache clear event
  emitDashboardRefreshNeeded('course-cache-cleared');
};

/**
 * ENTERPRISE: Performance monitoring and diagnostics
 */
export const getCourseMetrics = () => cache.getMetrics();

/**
 * ENTERPRISE: Smart cache invalidation for specific patterns
 */
export const invalidateCourseCaches = (pattern?: string): void => {
  if (pattern) {
    cache.invalidate(pattern);
    console.log(`🧹 Course cache invalidated: ${pattern}`);
  } else {
    clearCourseCaches();
  }
};

/**
 * ENTERPRISE: Preload courses for better perceived performance
 */
export const preloadCoursesForCategory = async (categoryId: string): Promise<void> => {
  try {
    await getCoursesForCategory(categoryId);
    console.log(`⚡ Courses preloaded successfully for category: ${categoryId}`);
  } catch (error) {
    console.warn(`Failed to preload courses for category ${categoryId}:`, error);
  }
};

/**
 * ENTERPRISE: Get course preview for non-enrolled learners
 * Returns course details for preview before enrollment
 */
export const getCoursePreview = async (courseId: number): Promise<LearnerCourseDto> => {
  const cacheKey = `course_preview_${courseId}`;
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<LearnerCourseDto>(cacheKey);
  if (cachedData) {
    console.log(`📦 Course preview served from cache: ${courseId}`);
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log(`🔄 Fetching course preview: ${courseId}`);
    
    try {
      const response = await apiClient.get(`/LearnerCourses/preview/${courseId}`, {
        timeout: 15000 // INCREASED timeout
      });
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid API response format for course preview');
      }
      
      // ENTERPRISE: Enhanced data validation
      const validatedData = validateCourseData(response.data);
      
      // ENTERPRISE: Cache preview with medium TTL
      cache.set(cacheKey, validatedData, 3 * 60 * 1000); // 3 minutes
      
      console.log(`✅ Course preview cached: ${courseId}`);
      return validatedData;
      
    } catch (error: any) {
      console.error(`❌ Error fetching course preview ${courseId}:`, error);
      
      // ENTERPRISE: Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.warn('🕐 Request was cancelled/timed out, using fallback');
        const expiredData = cache.getExpired<LearnerCourseDto>(cacheKey);
        if (expiredData) {
          console.log('🔄 Using expired cache due to timeout');
          return expiredData;
        }
      }
      
      // ENTERPRISE: Try to return cached data on error
      const keys = Array.from(cache['cache'].keys());
      const expiredCacheKey = keys.find(key => key.includes(`course_preview_${courseId}`));
      if (expiredCacheKey) {
        const expiredCache = cache['cache'].get(expiredCacheKey);
        if (expiredCache) {
          console.log('🔄 Returning expired cached course preview due to error');
          return expiredCache.data;
        }
      }
      
      throw error;
    }
  }, 'high');
};

/**
 * ENTERPRISE: Force refresh course data (bypassing cache)
 */
export const refreshCourseData = async (categoryId?: string, courseId?: number): Promise<void> => {
  if (courseId) {
    cache.invalidate(`course_detail_${courseId}`);
    await getLearnerCourseDetails(courseId);
  }
  
  if (categoryId) {
    cache.invalidate(`courses_category_${categoryId}`);
    await getCoursesForCategory(categoryId);
  }
  
  if (!categoryId && !courseId) {
    clearCourseCaches();
  }
  
  console.log('🔄 Course data refreshed');
};