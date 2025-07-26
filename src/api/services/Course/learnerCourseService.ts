import apiClient from '../../apiClient';
import { LearnerCourseDto, LessonProgressDto, MarkLessonCompletedPayload } from '../../../types/course.types';

// NOTE: The complex caching logic here can still conflict with browser and other caching layers.
// This simplified version relies on deduplication for in-flight requests.
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

const AVAILABLE_COURSES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ENROLLED_COURSES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const COURSE_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function withCache<T>(
  cacheEntry: CacheEntry<T>,
  cacheDuration: number,
  fetchFunction: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  const now = Date.now();
  
  if (cacheEntry.data && (now - cacheEntry.timestamp) < cacheDuration) {
    console.log(`Returning cached data${cacheKey ? ` for ${cacheKey}` : ''}`);
    return cacheEntry.data;
  }
  
  if (cacheEntry.promise) {
    console.log(`Waiting for ongoing request${cacheKey ? ` for ${cacheKey}` : ''}`);
    return cacheEntry.promise;
  }
  
  console.log(`Fetching fresh data${cacheKey ? ` for ${cacheKey}` : ''}`);
  cacheEntry.promise = fetchFunction();
  
  try {
    const data = await cacheEntry.promise;
    cacheEntry.data = data;
    cacheEntry.timestamp = now;
    return data;
  } catch (error) {
    if (cacheEntry.data) {
      console.warn(`API error, returning stale data${cacheKey ? ` for ${cacheKey}` : ''}:`, error);
      return cacheEntry.data;
    }
    throw error;
  } finally {
    cacheEntry.promise = null;
  }
}

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
      // FIX: Removed manual AbortController and timeout to prevent conflict with apiClient.ts
      const params = categoryId ? `?categoryId=${categoryId}` : '';
      const response = await apiClient.get<LearnerCourseDto[]>(`/LearnerCourses/available${params}`);
      return response.data;
    },
    `available courses (category: ${cacheKey})`
  );
};

export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
  return withCache(
    cache.enrolled,
    ENROLLED_COURSES_CACHE_DURATION,
    async () => {
      // FIX: Removed manual AbortController and timeout to prevent conflict with apiClient.ts
      const response = await apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled');
      return response.data;
    },
    'enrolled courses'
  );
};

export const getLearnerCourseDetails = async (courseId: number): Promise<LearnerCourseDto> => {
  if (!cache.courseDetails.has(courseId)) {
    cache.courseDetails.set(courseId, { data: null, timestamp: 0, promise: null });
  }
  
  const cacheEntry = cache.courseDetails.get(courseId)!;
  
  return withCache(
    cacheEntry,
    COURSE_DETAILS_CACHE_DURATION,
    async () => {
       // FIX: Removed manual AbortController and timeout to prevent conflict with apiClient.ts
      const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/${courseId}`);
      return response.data;
    },
    `course details (${courseId})`
  );
};

// ==========================================================
// === START: THIS IS THE CORRECTED FUNCTION              ===
// ==========================================================
export const markDocumentCompleted = async (documentId: number): Promise<void> => {
  try {
    // This now sends a real POST request to your backend controller
    await apiClient.post(`/LearnerCourses/documents/${documentId}/complete`);
    
    // Invalidate caches since progress has been updated
    cache.enrolled.data = null; 
    cache.courseDetails.clear(); 
    console.log(`Document ${documentId} marked as complete, caches cleared.`);

  } catch (error) {
    console.error(`Error marking document ${documentId} as complete:`, error);
    throw error; // Re-throw the error so the component can handle it
  }
};
// ==========================================================
// === END: THIS IS THE CORRECTED FUNCTION                ===
// ==========================================================


export const getCoursesForCategory = async (categoryId: string): Promise<{
  available: LearnerCourseDto[];
  enrolled: LearnerCourseDto[];
  categoryEnrolled: LearnerCourseDto[];
}> => {
  console.log(`Batch fetching courses for category: ${categoryId}`);
  
  try {
    const [available, enrolled] = await Promise.all([
      getAvailableCoursesForLearner(categoryId),
      getEnrolledCoursesForLearner()
    ]);
    
    const categoryEnrolled = enrolled.filter(course => course.category.id === categoryId);
    
    return { available, enrolled, categoryEnrolled };
  } catch (error) {
    // This will now catch genuine errors from apiClient, not self-cancellations.
    console.error('Error in batch fetch:', error);
    return { available: [], enrolled: [], categoryEnrolled: [] };
  }
};

export const clearCourseCaches = () => {
  cache.available.clear();
  cache.enrolled = { data: null, timestamp: 0, promise: null };
  cache.courseDetails.clear();
  console.log('All course caches cleared');
};

export const preloadCoursesForCategory = async (categoryId: string): Promise<void> => {
    getCoursesForCategory(categoryId).catch(() => { /* Silently ignore preload errors */ });
};

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