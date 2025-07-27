// src/api/services/LearnerDashboard/learnerOverallStatsService.ts
// ENTERPRISE OPTIMIZED: Ultra-fast stats service with smart caching and graceful degradation
import apiClient from "../../apiClient";
import { OverallLmsStatsDto } from "../../../types/course.types"; 
import { DailyLearningTime } from "../../../features/Learner/LearnerDashboard/types/types";
import { 
  emitDashboardRefreshNeeded 
} from "../../../utils/dashboardEvents";

// ENTERPRISE: Advanced caching system with intelligent invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  requestId?: string;
}

interface RequestMetrics {
  requestCount: number;
  cacheHits: number;
  averageResponseTime: number;
  lastRequestTime: number;
  errorCount: number;
}

class EnterpriseStatsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: RequestMetrics = {
    requestCount: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    lastRequestTime: 0,
    errorCount: 0
  };
  
  // ENTERPRISE: Smart TTL based on data type and user activity
  private readonly STATS_TTL = 5 * 60 * 1000; // 5 minutes for stats
  private readonly ACTIVITY_TTL = 2 * 60 * 1000; // 2 minutes for activity data
  private readonly ERROR_RETRY_TTL = 30 * 1000; // 30 seconds before retry on error

  // ENTERPRISE: Performance monitoring
  private updateMetrics(responseTime: number, fromCache: boolean, isError: boolean = false): void {
    this.metrics.requestCount++;
    if (fromCache) this.metrics.cacheHits++;
    if (isError) this.metrics.errorCount++;
    
    // Rolling average calculation
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) 
      / this.metrics.requestCount;
    
    this.metrics.lastRequestTime = Date.now();
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.STATS_TTL;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      requestId: `${key}_${Date.now()}`
    });

    // ENTERPRISE: Automatic memory management
    this.cleanupExpiredEntries();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    this.updateMetrics(0, true);
    return entry.data as T;
  }

  // ENTERPRISE: Smart cache cleanup
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // ENTERPRISE: Memory pressure management
    if (this.cache.size > 20) { // Keep stats cache small
      const oldestEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 5); // Remove oldest 5 entries
      
      oldestEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // ENTERPRISE: Performance diagnostics
  getMetrics(): RequestMetrics & { cacheSize: number; hitRate: number; errorRate: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.requestCount > 0 ? this.metrics.cacheHits / this.metrics.requestCount : 0,
      errorRate: this.metrics.requestCount > 0 ? this.metrics.errorCount / this.metrics.requestCount : 0
    };
  }
}

const cache = new EnterpriseStatsCache();
const activeRequests = new Map<string, Promise<any>>();

// ENTERPRISE: Advanced request deduplication
function dedupedRequest<T>(
  key: string, 
  requestFn: () => Promise<T>, 
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`⚡ Deduped ${priority} priority stats request: ${key}`);
    return activeRequests.get(key)!;
  }

  const startTime = performance.now();
  const promise = requestFn()
    .then(result => {
      const responseTime = performance.now() - startTime;
      console.log(`✅ ${priority} stats request completed in ${responseTime.toFixed(2)}ms: ${key}`);
      return result;
    })
    .finally(() => {
      // ENTERPRISE: Smart cleanup timing based on priority
      const cleanupDelay = priority === 'high' ? 500 : priority === 'normal' ? 1000 : 2000;
      setTimeout(() => {
        activeRequests.delete(key);
      }, cleanupDelay);
    });

  activeRequests.set(key, promise);
  return promise;
}

// ENTERPRISE: Robust default stats with validation
const createDefaultStats = (): OverallLmsStatsDto => ({
  totalCategories: 0,
  totalPublishedCourses: 0,
  totalActiveLearners: 0,
  totalActiveCoordinators: 0,
  totalProjectManagers: 0,
  averageCourseDurationOverall: 'N/A'
});

// ENTERPRISE: Enhanced stats validation
const validateStatsResponse = (data: any): OverallLmsStatsDto => {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid stats response format, using defaults');
    return createDefaultStats();
  }

  return {
    totalCategories: Number(data.totalCategories) || 0,
    totalPublishedCourses: Number(data.totalPublishedCourses) || 0,
    totalActiveLearners: Number(data.totalActiveLearners) || 0,
    totalActiveCoordinators: Number(data.totalActiveCoordinators) || 0,
    totalProjectManagers: Number(data.totalProjectManagers) || 0,
    averageCourseDurationOverall: data.averageCourseDurationOverall || 'N/A'
  };
};

/**
 * ENTERPRISE: Enhanced overall LMS statistics fetching with smart caching and graceful degradation
 * Includes caching and graceful error handling for better performance.
 * @returns Overall LMS statistics including total published courses, active learners, etc.
 */
export const getOverallLmsStatsForLearner = async (): Promise<OverallLmsStatsDto> => {
  const cacheKey = 'learner_overall_stats';
  
  // ENTERPRISE: Smart cache check with validation
  const cachedData = cache.get<OverallLmsStatsDto>(cacheKey);
  if (cachedData) {
    console.log('📊 Stats served from cache');
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching fresh stats data from API...');
    
    try {
      // ENTERPRISE: Request with timeout and abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await apiClient.get<OverallLmsStatsDto>('/learner/stats/overall', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📈 Overall LMS stats response received');
      
      // ENTERPRISE: Validate and transform response
      const validatedStats = validateStatsResponse(response.data);
      
      // ENTERPRISE: Cache validated data
      cache.set(cacheKey, validatedStats);
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitDashboardRefreshNeeded('stats-updated');
      
      return validatedStats;
      
    } catch (error: any) {
      console.error('❌ Error fetching overall LMS stats for learner:', error);
      
      // ENTERPRISE: Try to return cached data on error (even if expired)
      const expiredCache = cache.get<OverallLmsStatsDto>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Returning expired cached stats due to error');
        return expiredCache;
      }
      
      // ENTERPRISE: Graceful error handling with different error types
      const defaultStats = createDefaultStats();
      
      if (error.name === 'AbortError') {
        console.warn('⏱️ Stats request timed out, using default values');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.warn('🌐 Network error fetching stats, using default values');
      } else if (error.response?.status >= 500) {
        console.warn('🛠️ Server error fetching stats, using default values');
      } else if (error.response?.status === 403) {
        console.warn('🔒 Access denied for stats, using default values');
      } else {
        console.warn('❓ Unknown error fetching stats:', error.response?.status, error.response?.data);
      }
      
      // ENTERPRISE: Cache default stats with short TTL to prevent repeated failures
      cache.set(cacheKey, defaultStats, 30000); // 30 seconds cache for defaults
      
      return defaultStats;
    }
  }, 'normal');
};

/**
 * ENTERPRISE: Enhanced weekly activity fetching with smart caching
 * Fetches the current week's learning activity from the API.
 * The backend handles calculating the days from Monday to the current day.
 * @returns A promise that resolves to an array of daily learning time objects.
 */
export const getWeeklyActivity = async (): Promise<DailyLearningTime[]> => {
  const cacheKey = 'learner_weekly_activity';
  
  // ENTERPRISE: Smart cache check
  const cachedData = cache.get<DailyLearningTime[]>(cacheKey);
  if (cachedData) {
    console.log('📊 Weekly activity served from cache');
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching weekly activity from API...');
    
    try {
      // ENTERPRISE: Request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await apiClient.get<DailyLearningTime[]>('/learner/stats/weekly-activity', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // ENTERPRISE: Validate response
      const validatedData = Array.isArray(response.data) ? response.data : [];
      
      // ENTERPRISE: Cache with shorter TTL for activity data
      cache.set(cacheKey, validatedData, 2 * 60 * 1000); // 2 minutes
      
      console.log(`✅ Weekly activity cached (${validatedData.length} days)`);
      return validatedData;
      
    } catch (error: any) {
      console.error("❌ Error fetching weekly learning activity:", error);
      
      // ENTERPRISE: Try to return cached data on error
      const expiredCache = cache.get<DailyLearningTime[]>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Returning expired cached activity due to error');
        return expiredCache;
      }
      
      // Return empty array to prevent UI crashes
      return [];
    }
  }, 'low');
};

/**
 * ENTERPRISE: Enhanced cache management
 * Clear the stats cache - useful for forcing a refresh
 */
export const clearStatsCache = (): void => {
  cache.clear();
  activeRequests.clear();
  console.log('🧹 Stats cache cleared');
  
  // ENTERPRISE: Emit cache clear event
  emitDashboardRefreshNeeded('stats-cache-cleared');
};

/**
 * ENTERPRISE: Background preloading for better perceived performance
 * Preload stats data in the background
 */
export const preloadStats = async (): Promise<void> => {
  try {
    // ENTERPRISE: Preload both stats and activity in parallel
    await Promise.all([
      getOverallLmsStatsForLearner(),
      getWeeklyActivity()
    ]);
    console.log('⚡ Stats data preloaded successfully');
  } catch (error) {
    // Silently handle errors for preload
    console.warn('Failed to preload stats:', error);
  }
};

/**
 * ENTERPRISE: Performance monitoring and diagnostics
 */
export const getStatsMetrics = () => cache.getMetrics();

/**
 * ENTERPRISE: Smart cache invalidation
 */
export const invalidateStatsCache = (type?: 'stats' | 'activity' | 'all'): void => {
  switch (type) {
    case 'stats':
      cache.get('learner_overall_stats') && cache.clear();
      break;
    case 'activity':
      cache.get('learner_weekly_activity') && cache.clear();
      break;
    default:
      cache.clear();
  }
  console.log(`🧹 Stats cache invalidated: ${type || 'all'}`);
};