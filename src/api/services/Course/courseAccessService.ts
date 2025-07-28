// src/api/services/Course/courseAccessService.ts

const STORAGE_KEY = 'recentlyAccessedCourses';
const MAX_RECENT_COURSES = 10; // Store up to 10 recent courses to be safe

interface CourseAccessRecord {
  courseId: number;
  lastAccessed: number; // Timestamp
}

/**
 * Logs that a course has been accessed by the user.
 * Stores a timestamped record in localStorage.
 * @param courseId The ID of the course that was accessed.
 */
export const logCourseAccess = (courseId: number): void => {
  try {
    const now = Date.now();
    let recentCourses: CourseAccessRecord[] = [];
    
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        recentCourses = JSON.parse(storedData);
        if (!Array.isArray(recentCourses)) recentCourses = [];
      } catch {
        recentCourses = [];
      }
    }

    const filteredCourses = recentCourses.filter(c => c.courseId !== courseId);

    const updatedCourses: CourseAccessRecord[] = [
      { courseId, lastAccessed: now },
      ...filteredCourses
    ].slice(0, MAX_RECENT_COURSES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCourses));

  } catch (error) {
    console.error("Failed to log course access to localStorage:", error);
  }
};

/**
 * Retrieves a sorted list of recently accessed course IDs from localStorage.
 * @returns An array of course IDs, sorted from most to least recent.
 */
export const getRecentlyAccessedCourseIds = (): number[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
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
 * Removes a specific course ID from the recently accessed list in localStorage.
 * This is used to clean up data for courses that have been unenrolled or deleted.
 * @param courseIdToRemove The ID of the course to remove.
 */
export const removeCourseFromRecents = (courseIdToRemove: number): void => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return;
    }

    let recentCourses: CourseAccessRecord[] = JSON.parse(storedData);
    if (!Array.isArray(recentCourses)) return;

    const updatedCourses = recentCourses.filter(c => c.courseId !== courseIdToRemove);

    if (updatedCourses.length < recentCourses.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCourses));
      console.log(`[courseAccessService] Cleaned up unenrolled/deleted course ${courseIdToRemove} from recents.`);
    }
  } catch (error) {
    console.error(`Failed to remove course ${courseIdToRemove} from recents in localStorage:`, error);
  }
};