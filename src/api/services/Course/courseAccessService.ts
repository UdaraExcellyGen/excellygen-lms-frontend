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
      recentCourses = JSON.parse(storedData);
    }

    // Remove any existing record for this courseId to update its timestamp
    const filteredCourses = recentCourses.filter(c => c.courseId !== courseId);

    // Add the new access record to the top
    const updatedCourses: CourseAccessRecord[] = [
      { courseId, lastAccessed: now },
      ...filteredCourses
    ].slice(0, MAX_RECENT_COURSES); // Keep the list from growing indefinitely

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

    // The list is already sorted by insertion, but we can sort just in case
    recentCourses.sort((a, b) => b.lastAccessed - a.lastAccessed);

    return recentCourses.map(c => c.courseId);

  } catch (error) {
    console.error("Failed to get recently accessed courses from localStorage:", error);
    return [];
  }
};