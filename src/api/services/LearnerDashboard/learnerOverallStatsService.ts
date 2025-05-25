// src/api/services/LearnerDashboard/learnerOverallStatsService.ts
// NEW SERVICE FILE FOR LEARNER-FACING OVERALL STATS
import apiClient from "../../apiClient";
// FIXED: Import OverallLmsStatsDto directly (as it's now explicitly exported)
import { OverallLmsStatsDto } from "../../../types/course.types"; 

/**
 * Fetches overall LMS statistics from the API for learner-facing pages.
 * Calls the backend's /api/learner/stats/overall endpoint.
 * @returns Overall LMS statistics including total published courses, active learners, etc.
 */
export const getOverallLmsStatsForLearner = async (): Promise<OverallLmsStatsDto> => { 
  try {
    const response = await apiClient.get<OverallLmsStatsDto>('/learner/stats/overall'); 
    console.log('Overall LMS stats response:', response.data); // Add logging here
    return response.data;
  } catch (error) {
    console.error('Error fetching overall LMS stats for learner:', error);
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
