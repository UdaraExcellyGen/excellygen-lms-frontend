// src/api/services/Course/learnerCourseService.ts
import apiClient from '../../apiClient';
import { LearnerCourseDto, LessonProgressDto, MarkLessonCompletedPayload } from '../../../types/course.types';

// OPTIMIZATION: Simplified caching with request deduplication
interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
  promise: Promise<T> | null;
}

const cache = {
  available: new Map<string, CacheEntry<LearnerCourseDto[]>>(),
  enrolled: { data: null, timestamp: 0, promise: null } as CacheEntry<LearnerCourseDto[]>,
  courseDetails: new Map<number, CacheEntry<LearnerCourseDto>>()
};

// Cache durations
const AVAILABLE_COURSES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ENROLLED_COURSES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const COURSE_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// OPTIMIZATION: Request deduplication helper
async function withCache<T>(
  cacheEntry: CacheEntry<T>,
  cacheDuration: number,
  fetchFunction: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (cacheEntry.data && (now - cacheEntry.timestamp) < cacheDuration) {
    console.log(`Returning cached data${cacheKey ? ` for ${cacheKey}` : ''}`);
    return cacheEntry.data;
  }
  
  // Return ongoing promise if exists
  if (cacheEntry.promise) {
    console.log(`Waiting for ongoing request${cacheKey ? ` for ${cacheKey}` : ''}`);
    return cacheEntry.promise;
  }
  
  // Create new request
  console.log(`Fetching fresh data${cacheKey ? ` for ${cacheKey}` : ''}`);
  cacheEntry.promise = fetchFunction();
  
  try {
    const data = await cacheEntry.promise;
    cacheEntry.data = data;
    cacheEntry.timestamp = now;
    return data;
  } catch (error) {
    // Return stale data if available on error
    if (cacheEntry.data) {
      console.warn(`API error, returning stale data${cacheKey ? ` for ${cacheKey}` : ''}:`, error);
      return cacheEntry.data;
    }
    throw error;
  } finally {
    cacheEntry.promise = null;
  }
}

/**
 * OPTIMIZATION: Get all available courses with request deduplication
 */
export const getAvailableCoursesForLearner = async (categoryId?: string): Promise<LearnerCourseDto[]> => {
  const cacheKey = categoryId || 'all';
  
  if (!cache.available.has(cacheKey)) {
    cache.available.set(cacheKey, { data: null, timestamp: 0, promise: null });
  }
  
  const cacheEntry = cache.available.get(cacheKey)!;
  
  return withCache(
    cacheEntry,
    AVAILABLE_COURSES_CACHE_DURATION,
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      try {
        const params = categoryId ? `?categoryId=${categoryId}` : '';
        const response = await apiClient.get<LearnerCourseDto[]>(`/LearnerCourses/available${params}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    `available courses (category: ${cacheKey})`
  );
};

/**
 * OPTIMIZATION: Get enrolled courses with request deduplication
 */
export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
  return withCache(
    cache.enrolled,
    ENROLLED_COURSES_CACHE_DURATION,
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      try {
        const response = await apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    'enrolled courses'
  );
};

/**
 * OPTIMIZATION: Get course details with request deduplication
 */
export const getLearnerCourseDetails = async (courseId: number): Promise<LearnerCourseDto> => {
  if (!cache.courseDetails.has(courseId)) {
    cache.courseDetails.set(courseId, { data: null, timestamp: 0, promise: null });
  }
  
  const cacheEntry = cache.courseDetails.get(courseId)!;
  
  return withCache(
    cacheEntry,
    COURSE_DETAILS_CACHE_DURATION,
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/${courseId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    `course details (${courseId})`
  );
};

/**
 * OPTIMIZATION: Mark lesson completed with cache invalidation
 */
export const markLessonCompleted = async (lessonId: number): Promise<LessonProgressDto> => {
  try {
    const payload: MarkLessonCompletedPayload = { lessonId };
    const response = await apiClient.patch<LessonProgressDto>(`/LearnerCourses/lessons/${lessonId}/complete`, payload);
    
    // OPTIMIZATION: Smart cache invalidation
    cache.enrolled.data = null;
    cache.enrolled.timestamp = 0;
    
    // Clear specific course details instead of all
    cache.courseDetails.forEach((entry, courseId) => {
      if (entry.data?.lessons?.some(lesson => lesson.id === lessonId)) {
        cache.courseDetails.delete(courseId);
      }
    });
    
    console.log('Lesson completed, relevant caches cleared');
    return response.data;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

/**
 * OPTIMIZATION: Batch fetch with intelligent error handling
 */
export const getCoursesForCategory = async (categoryId: string): Promise<{
  available: LearnerCourseDto[];
  enrolled: LearnerCourseDto[];
  categoryEnrolled: LearnerCourseDto[];
}> => {
  console.log(`Batch fetching courses for category: ${categoryId}`);
  
  try {
    // Use Promise.all for parallel requests (faster than Promise.allSettled)
    const [available, enrolled] = await Promise.all([
      getAvailableCoursesForLearner(categoryId),
      getEnrolledCoursesForLearner()
    ]);
    
    const categoryEnrolled = enrolled.filter(course => course.category.id === categoryId);
    
    return { available, enrolled, categoryEnrolled };
  } catch (error) {
    console.error('Error in batch fetch:', error);
    
    // Fallback: try to get data individually
    try {
      const [availableResult, enrolledResult] = await Promise.allSettled([
        getAvailableCoursesForLearner(categoryId),
        getEnrolledCoursesForLearner()
      ]);
      
      const available = availableResult.status === 'fulfilled' ? availableResult.value : [];
      const enrolled = enrolledResult.status === 'fulfilled' ? enrolledResult.value : [];
      const categoryEnrolled = enrolled.filter(course => course.category.id === categoryId);
      
      return { available, enrolled, categoryEnrolled };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { available: [], enrolled: [], categoryEnrolled: [] };
    }
  }
};

/**
 * OPTIMIZATION: Clear all caches
 */
export const clearCourseCaches = () => {
  cache.available.clear();
  cache.enrolled = { data: null, timestamp: 0, promise: null };
  cache.courseDetails.clear();
  console.log('All course caches cleared');
};

/**
 * OPTIMIZATION: Smart cache warming for specific category
 */
export const preloadCoursesForCategory = async (categoryId: string): Promise<void> => {
  try {
    // Don't await - fire and forget for preloading
    getCoursesForCategory(categoryId).catch(() => {
      // Silently handle preload errors
    });
  } catch {
    // Silently handle preload errors
  }
};

/**
 * OPTIMIZATION: Get cache status for debugging
 */
export const getCacheStatus = () => {
  const now = Date.now();
  return {
    available: Array.from(cache.available.entries()).map(([key, entry]) => ({
      key,
      hasData: !!entry.data,
      age: entry.timestamp ? now - entry.timestamp : 0,
      isLoading: !!entry.promise
    })),
    enrolled: {
      hasData: !!cache.enrolled.data,
      age: cache.enrolled.timestamp ? now - cache.enrolled.timestamp : 0,
      isLoading: !!cache.enrolled.promise
    },
    courseDetails: Array.from(cache.courseDetails.entries()).map(([courseId, entry]) => ({
      courseId,
      hasData: !!entry.data,
      age: entry.timestamp ? now - entry.timestamp : 0,
      isLoading: !!entry.promise
    }))
  };
};