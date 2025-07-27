// src/api/services/Course/learnerCourseService.ts

import apiClient from '../../apiClient';
import { LearnerCourseDto, LessonProgressDto, MarkLessonCompletedPayload } from '../../../types/course.types';

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

// FIXED: Preserve real creator data - only fix lesson counts, don't touch creator info
const normalizeLessonCounts = (course: LearnerCourseDto): LearnerCourseDto => {
  const totalLessons = course.lessons?.length || course.totalLessons || 0;
  const completedLessons = course.lessons?.filter(lesson => lesson?.isCompleted).length || course.completedLessons || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : (course.progressPercentage || 0);
  
  // 🔥 CRITICAL FIX: Do NOT override creator data - keep original from backend
  console.log(`🔍 RAW Creator Data for "${course.title}":`, {
    creatorId: course.creator?.id,
    creatorName: course.creator?.name,
    originalCreator: course.creator
  });
  
  return {
    ...course,
    totalLessons,
    completedLessons,
    progressPercentage,
    // PRESERVE original creator data completely - no fallbacks!
    creator: course.creator,
    // Ensure activeLearnersCount is available
    activeLearnersCount: course.activeLearnersCount || 0
  };
};

export const getCoursePreview = async (courseId: number): Promise<LearnerCourseDto> => {
  const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/preview/${courseId}`);
  console.log(`🔍 Course Preview API Response for ${courseId}:`, {
    title: response.data.title,
    lessonsCount: response.data.lessons?.length || 0,
    totalLessons: response.data.totalLessons,
    lessons: response.data.lessons?.map(l => l.lessonName)
  });
  return response.data;
};

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
      const params = categoryId ? `?categoryId=${categoryId}` : '';
      const response = await apiClient.get<LearnerCourseDto[]>(`/LearnerCourses/available${params}`);
      
      // 🔥 DEBUG: Log raw response to see what backend sends
      console.log('🔍 RAW API Response for Available Courses:', response.data.slice(0, 2).map(course => ({
        title: course.title,
        rawCreator: course.creator,
        creatorName: course.creator?.name,
        activeLearnersCount: course.activeLearnersCount
      })));
      
      // Only normalize lesson counts, preserve everything else
      return response.data.map(normalizeLessonCounts);
    },
    `available courses (category: ${cacheKey})`
  );
};

export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
  return withCache(
    cache.enrolled,
    ENROLLED_COURSES_CACHE_DURATION,
    async () => {
      const response = await apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled');
      
      // 🔥 DEBUG: Log raw response
      console.log('🔍 RAW API Response for Enrolled Courses:', response.data.slice(0, 2).map(course => ({
        title: course.title,
        rawCreator: course.creator,
        creatorName: course.creator?.name,
        progressPercentage: course.progressPercentage
      })));
      
      return response.data.map(normalizeLessonCounts);
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
      const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/${courseId}`);
      
      // 🔥 DEBUG: Log raw response
      console.log(`🔍 RAW API Response for Course ${courseId}:`, {
        title: response.data.title,
        rawCreator: response.data.creator,
        creatorName: response.data.creator?.name,
        progressPercentage: response.data.progressPercentage
      });
      
      return normalizeLessonCounts(response.data);
    },
    `course details (${courseId})`
  );
};

// 🔥 FIXED: Enhanced markDocumentCompleted with progress refresh
export const markDocumentCompleted = async (documentId: number): Promise<{ courseId: number }> => {
  try {
    const response = await apiClient.post<{ documentId: number; isCompleted: boolean; courseId: number }>(`/LearnerCourses/documents/${documentId}/complete`);
    
    const courseId = response.data.courseId;
    
    // Clear caches to force fresh data fetch
    cache.enrolled.data = null;
    cache.enrolled.timestamp = 0;
    cache.courseDetails.delete(courseId);
    
    console.log(`✅ Document ${documentId} marked complete for course ${courseId}, caches cleared`);
    
    // 🔥 CRITICAL: Trigger immediate refresh of both enrolled courses and course details
    setTimeout(async () => {
      try {
        await Promise.all([
          getEnrolledCoursesForLearner(),
          getLearnerCourseDetails(courseId)
        ]);
        console.log(`🔄 Course ${courseId} progress refreshed successfully`);
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { 
          detail: { courseId, documentId } 
        }));
      } catch (error) {
        console.error(`❌ Failed to refresh course ${courseId} progress:`, error);
      }
    }, 100);
    
    return { courseId };
  } catch (error) {
    console.error(`Error marking document ${documentId} as complete:`, error);
    throw error;
  }
};

export const getCoursesForCategory = async (categoryId: string): Promise<{
  available: LearnerCourseDto[];
  enrolled: LearnerCourseDto[];
  categoryEnrolled: LearnerCourseDto[];
}> => {
  console.log(`🔍 Batch fetching courses for category: ${categoryId}`);
  
  try {
    const [available, enrolled] = await Promise.all([
      getAvailableCoursesForLearner(categoryId),
      getEnrolledCoursesForLearner()
    ]);
    
    // Fix: Handle both string and number category IDs and ensure proper filtering
    const categoryEnrolled = enrolled.filter(course => {
      const courseCategory = course.category?.id || course.category;
      return String(courseCategory) === String(categoryId);
    });
    
    console.log(`📚 Category ${categoryId} Results:`, {
      available: available.length,
      enrolled: enrolled.length,
      categoryEnrolled: categoryEnrolled.length
    });
    
    // 🔥 ENHANCED Debug logging - check what data we're actually returning
    if (available.length > 0) {
      console.log('🔍 Final Available Courses Data:', available.slice(0, 3).map(course => ({
        title: course.title,
        creatorId: course.creator?.id,
        creatorName: course.creator?.name,
        totalLessons: course.totalLessons,
        activeLearnersCount: course.activeLearnersCount,
        fullCreatorObject: course.creator
      })));
    }
    
    return { available, enrolled, categoryEnrolled };
  } catch (error) {
    console.error('❌ Error in batch fetch:', error);
    return { available: [], enrolled: [], categoryEnrolled: [] };
  }
};

export const clearCourseCaches = () => {
  cache.available.clear();
  cache.enrolled = { data: null, timestamp: 0, promise: null };
  cache.courseDetails.clear();
  console.log('🗑️ All course caches cleared');
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