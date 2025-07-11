// src/api/services/Course/learnerCourseService.ts
import apiClient from '../../apiClient';
import { LearnerCourseDto, LessonProgressDto, MarkLessonCompletedPayload } from '../../../types/course.types';

// OPTIMIZATION: Add caching for learner course data
let courseCache: {
  available: { [categoryId: string]: { data: LearnerCourseDto[] | null; timestamp: number; isLoading: boolean } };
  enrolled: { data: LearnerCourseDto[] | null; timestamp: number; isLoading: boolean };
  courseDetails: { [courseId: number]: { data: LearnerCourseDto | null; timestamp: number; isLoading: boolean } };
} = {
  available: {},
  enrolled: { data: null, timestamp: 0, isLoading: false },
  courseDetails: {}
};

// Cache durations
const AVAILABLE_COURSES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ENROLLED_COURSES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (changes more frequently)
const COURSE_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get all available courses for the current learner (not enrolled in yet) with caching
 */
export const getAvailableCoursesForLearner = async (categoryId?: string): Promise<LearnerCourseDto[]> => {
  const cacheKey = categoryId || 'all';
  const now = Date.now();
  
  // Initialize cache for this category if it doesn't exist
  if (!courseCache.available[cacheKey]) {
    courseCache.available[cacheKey] = { data: null, timestamp: 0, isLoading: false };
  }
  
  const cache = courseCache.available[cacheKey];
  
  // Return cached data if fresh
  if (cache.data && (now - cache.timestamp) < AVAILABLE_COURSES_CACHE_DURATION && !cache.isLoading) {
    console.log(`Returning cached available courses for category: ${cacheKey}`);
    return cache.data;
  }
  
  // Wait for existing request if already loading
  if (cache.isLoading) {
    console.log(`Available courses request for ${cacheKey} in progress, waiting...`);
    let attempts = 0;
    while (cache.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (cache.data) return cache.data;
  }
  
  try {
    cache.isLoading = true;
    console.log(`Fetching fresh available courses for category: ${cacheKey}`);
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await apiClient.get<LearnerCourseDto[]>(`/LearnerCourses/available${params}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache
    cache.data = response.data;
    cache.timestamp = now;
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching available courses:', error);
    
    // Return cached data if available (even if expired)
    if (cache.data) {
      console.log('Returning expired cached available courses due to error');
      return cache.data;
    }
    
    throw error;
  } finally {
    cache.isLoading = false;
  }
};

/**
 * Get all courses the current learner is enrolled in with caching
 */
export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
  const now = Date.now();
  const { enrolled } = courseCache;
  
  // Return cached data if fresh
  if (enrolled.data && (now - enrolled.timestamp) < ENROLLED_COURSES_CACHE_DURATION && !enrolled.isLoading) {
    console.log('Returning cached enrolled courses');
    return enrolled.data;
  }
  
  // Wait for existing request if already loading
  if (enrolled.isLoading) {
    console.log('Enrolled courses request in progress, waiting...');
    let attempts = 0;
    while (enrolled.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (enrolled.data) return enrolled.data;
  }
  
  try {
    enrolled.isLoading = true;
    console.log('Fetching fresh enrolled courses');
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache
    enrolled.data = response.data;
    enrolled.timestamp = now;
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching enrolled courses:', error);
    
    // Return cached data if available (even if expired)
    if (enrolled.data) {
      console.log('Returning expired cached enrolled courses due to error');
      return enrolled.data;
    }
    
    throw error;
  } finally {
    enrolled.isLoading = false;
  }
};

/**
 * Get detailed information for a specific course for the current learner with caching
 */
export const getLearnerCourseDetails = async (courseId: number): Promise<LearnerCourseDto> => {
  const now = Date.now();
  
  // Initialize cache for this course if it doesn't exist
  if (!courseCache.courseDetails[courseId]) {
    courseCache.courseDetails[courseId] = { data: null, timestamp: 0, isLoading: false };
  }
  
  const cache = courseCache.courseDetails[courseId];
  
  // Return cached data if fresh
  if (cache.data && (now - cache.timestamp) < COURSE_DETAILS_CACHE_DURATION && !cache.isLoading) {
    console.log(`Returning cached course details for course: ${courseId}`);
    return cache.data;
  }
  
  // Wait for existing request if already loading
  if (cache.isLoading) {
    console.log(`Course details request for ${courseId} in progress, waiting...`);
    let attempts = 0;
    while (cache.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (cache.data) return cache.data;
  }
  
  try {
    cache.isLoading = true;
    console.log(`Fetching fresh course details for course: ${courseId}`);
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/${courseId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache
    cache.data = response.data;
    cache.timestamp = now;
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    
    // Return cached data if available (even if expired)
    if (cache.data) {
      console.log('Returning expired cached course details due to error');
      return cache.data;
    }
    
    throw error;
  } finally {
    cache.isLoading = false;
  }
};

/**
 * Mark a specific lesson as completed for the current learner
 * This will invalidate related caches
 */
export const markLessonCompleted = async (lessonId: number): Promise<LessonProgressDto> => {
  try {
    const payload: MarkLessonCompletedPayload = { lessonId };
    const response = await apiClient.patch<LessonProgressDto>(`/LearnerCourses/lessons/${lessonId}/complete`, payload);
    
    // OPTIMIZATION: Clear related caches since progress has changed
    courseCache.enrolled.data = null;
    courseCache.enrolled.timestamp = 0;
    
    // Clear course details cache for all courses since we don't know which course this lesson belongs to
    Object.keys(courseCache.courseDetails).forEach(courseId => {
      courseCache.courseDetails[parseInt(courseId)] = { data: null, timestamp: 0, isLoading: false };
    });
    
    console.log('Lesson completed, related caches cleared');
    
    return response.data;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

/**
 * OPTIMIZATION: Batch fetch courses and enrolled status
 * This reduces the number of API calls needed
 */
export const getCoursesForCategory = async (categoryId: string): Promise<{
  available: LearnerCourseDto[];
  enrolled: LearnerCourseDto[];
  categoryEnrolled: LearnerCourseDto[];
}> => {
  console.log(`Batch fetching courses for category: ${categoryId}`);
  
  // Use Promise.allSettled for graceful error handling
  const [availableResult, enrolledResult] = await Promise.allSettled([
    getAvailableCoursesForLearner(categoryId),
    getEnrolledCoursesForLearner()
  ]);
  
  const available = availableResult.status === 'fulfilled' ? availableResult.value : [];
  const enrolled = enrolledResult.status === 'fulfilled' ? enrolledResult.value : [];
  const categoryEnrolled = enrolled.filter(course => course.category.id === categoryId);
  
  return { available, enrolled, categoryEnrolled };
};

/**
 * Clear course caches - useful for forcing refresh
 */
export const clearCourseCaches = () => {
  courseCache.available = {};
  courseCache.enrolled = { data: null, timestamp: 0, isLoading: false };
  courseCache.courseDetails = {};
  console.log('Course caches cleared');
};

/**
 * Preload courses for a category
 */
export const preloadCoursesForCategory = (categoryId: string) => {
  getCoursesForCategory(categoryId).catch(() => {
    // Silently handle errors for preload
  });
};