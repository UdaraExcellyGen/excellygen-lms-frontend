// src/api/services/Course/courseAccessService.ts

const BASE_STORAGE_KEY = 'recentlyAccessedCourses';
const MAX_RECENT_COURSES = 10;

interface CourseAccessRecord {
  courseId: number;
  lastAccessed: number; // Timestamp
}

/**
 * Logs that a course has been accessed by a specific user.
 * Stores a timestamped record in a user-specific localStorage key.
 * @param courseId The ID of the course that was accessed.
 * @param userId The ID of the current user.
 */
export const logCourseAccess = (courseId: number, userId: string): void => {
  if (!userId) return; // Do nothing if there is no user ID
  try {
    const userStorageKey = `${BASE_STORAGE_KEY}_${userId}`;
    const now = Date.now();
    let recentCourses: CourseAccessRecord[] = [];
    
    const storedData = localStorage.getItem(userStorageKey);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed)) {
          recentCourses = parsed;
        }
      } catch (e) {
        console.error("Failed to parse recent courses from localStorage:", e);
        recentCourses = [];
      }
    }

    const filteredCourses = recentCourses.filter(c => c.courseId !== courseId);

    const updatedCourses: CourseAccessRecord[] = [
      { courseId, lastAccessed: now },
      ...filteredCourses
    ].slice(0, MAX_RECENT_COURSES);

    localStorage.setItem(userStorageKey, JSON.stringify(updatedCourses));

  } catch (error) {
    console.error("Failed to log course access to localStorage:", error);
  }
};

/**
 * Retrieves a sorted list of recently accessed course IDs for a specific user.
 * @param userId The ID of the current user.
 * @returns An array of course IDs, sorted from most to least recent.
 */
export const getRecentlyAccessedCourseIds = (userId: string): number[] => {
  if (!userId) return []; // Return empty if there is no user ID
  try {
    const userStorageKey = `${BASE_STORAGE_KEY}_${userId}`;
    const storedData = localStorage.getItem(userStorageKey);
    if (!storedData) {
      return [];
    }

    const recentCourses: CourseAccessRecord[] = JSON.parse(storedData);
    if (!Array.isArray(recentCourses)) return [];

    recentCourses.sort((a, b) => b.lastAccessed - a.lastAccessed);

    return recentCourses.map(c => c.courseId);

  } catch (error) {
    console.error("Failed to get recently accessed courses from localStorage:", error);
    return [];
  }
};

/**
 * Removes a specific course ID from the user-specific recently accessed list.
 * @param courseIdToRemove The ID of the course to remove.
 * @param userId The ID of the current user.
 */
export const removeCourseFromRecents = (courseIdToRemove: number, userId: string): void => {
  if (!userId) return; // Do nothing if there is no user ID
  try {
    const userStorageKey = `${BASE_STORAGE_KEY}_${userId}`;
    const storedData = localStorage.getItem(userStorageKey);
    if (!storedData) {
      return;
    }

    let recentCourses: CourseAccessRecord[] = JSON.parse(storedData);
    if (!Array.isArray(recentCourses)) return;

    const updatedCourses = recentCourses.filter(c => c.courseId !== courseIdToRemove);

    if (updatedCourses.length < recentCourses.length) {
      localStorage.setItem(userStorageKey, JSON.stringify(updatedCourses));
      console.log(`[courseAccessService] Cleaned up unenrolled/deleted course ${courseIdToRemove} from recents for user ${userId}.`);
    }
  } catch (error) {
    console.error(`Failed to remove course ${courseIdToRemove} from recents in localStorage:`, error);
  }
};