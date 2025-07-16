// src/api/services/LearnerDashboard/learnerOverallStatsService.ts
// OPTIMIZED SERVICE FILE FOR LEARNER-FACING OVERALL STATS
import apiClient from "../../apiClient";
import { OverallLmsStatsDto } from "../../../types/course.types"; 
import { DailyLearningTime } from "../../../features/Learner/LearnerDashboard/types/types";

// Cache for stats to avoid repeated API calls
let statsCache: {
  data: OverallLmsStatsDto | null;
  timestamp: number;
  isLoading: boolean;
} = {
  data: null,
  timestamp: 0,
  isLoading: false
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Fetches overall LMS statistics from the API for learner-facing pages.
 * Includes caching and graceful error handling for better performance.
 * @returns Overall LMS statistics including total published courses, active learners, etc.
 */
export const getOverallLmsStatsForLearner = async (): Promise<OverallLmsStatsDto> => { 
  const now = Date.now();
  
  if (statsCache.data && (now - statsCache.timestamp) < CACHE_DURATION && !statsCache.isLoading) {
    console.log('Returning cached stats data');
    return statsCache.data;
  }
  
  if (statsCache.isLoading) {
    console.log('Stats request already in progress, waiting...');
    let attempts = 0;
    while (statsCache.isLoading && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (statsCache.data) {
      return statsCache.data;
    }
  }
  
  const defaultStats: OverallLmsStatsDto = {
    totalCategories: 0,
    totalPublishedCourses: 0,
    totalActiveLearners: 0,
    totalActiveCoordinators: 0,
    totalProjectManagers: 0,
    averageCourseDurationOverall: 'N/A'
  };
  
  try {
    statsCache.isLoading = true;
    console.log('Fetching fresh stats data from API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await apiClient.get<OverallLmsStatsDto>('/learner/stats/overall', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Overall LMS stats response:', response.data);
    
    if (response.data && typeof response.data === 'object') {
      statsCache.data = response.data;
      statsCache.timestamp = now;
      return response.data;
    } else {
      console.warn('Invalid stats response format, using defaults');
      return defaultStats;
    }
    
  } catch (error: any) {
    console.error('Error fetching overall LMS stats for learner:', error);
    
    if (statsCache.data) {
      console.log('Returning expired cached data due to error');
      return statsCache.data;
    }
    
    if (error.name === 'AbortError') {
      console.warn('Stats request timed out, using default values');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.warn('Network error fetching stats, using default values');
    } else {
      console.warn('API error fetching stats:', error.response?.status, error.response?.data);
    }
    
    return defaultStats;
  } finally {
    statsCache.isLoading = false;
  }
};

/**
 * THIS ENTIRE FUNCTION IS NEW
 * Fetches the current week's learning activity from the API.
 * The backend handles calculating the days from Monday to the current day.
 * @returns A promise that resolves to an array of daily learning time objects.
 */
export const getWeeklyActivity = async (): Promise<DailyLearningTime[]> => {
  try {
    const response = await apiClient.get<DailyLearningTime[]>('/learner/stats/weekly-activity');
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly learning activity:", error);
    // Return an empty array to prevent the UI from crashing on an API error.
    return [];
  }
};


/**
 * Clear the stats cache - useful for forcing a refresh
 */
export const clearStatsCache = () => {
  statsCache.data = null;
  statsCache.timestamp = 0;
  statsCache.isLoading = false;
  console.log('Stats cache cleared');
};

/**
 * Preload stats data in the background
 */
export const preloadStats = () => {
  getOverallLmsStatsForLearner().catch(() => {
    // Silently handle errors for preload
  });
};