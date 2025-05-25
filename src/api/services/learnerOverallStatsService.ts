// src/api/services/LearnerDashboard/learnerOverallStatsService.ts
// NEW SERVICE FILE FOR LEARNER-FACING OVERALL STATS
import apiClient from "../apiClient";
import { OverallLmsStatsDto as OverallLmsStatsBackendDto } from "../../types/course.types"; 

/**
 * Fetches overall LMS statistics from the API for learner-facing pages.
 * Calls the backend's /api/learner/stats/overall endpoint.
 * @returns Overall LMS statistics including total published courses, active learners, etc.
 */
export const getOverallLmsStatsForLearner = async (): Promise<OverallLmsStatsBackendDto> => { 
  try {
    // FIXED: Corrected endpoint URL to match LearnerStatsController's route
    const response = await apiClient.get<OverallLmsStatsBackendDto>('/learner/stats/overall'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching overall LMS stats for learner:', error);
    // Return default empty/N/A stats if there's an error (e.g., unauthorized access if not logged in)
    return {
      totalCategories: 0,
      totalPublishedCourses: 0,
      totalActiveLearners: 0,
      totalActiveCoordinators: 0,
      totalProjectManagers: 0,
      averageCourseDurationOverall: 'N/A'
    };
  }
};