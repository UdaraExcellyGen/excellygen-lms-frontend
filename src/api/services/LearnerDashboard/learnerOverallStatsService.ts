// src/api/services/LearnerDashboard/learnerOverallStatsService.ts
// ENTERPRISE OPTIMIZED: Ultra-fast stats service with smart caching and graceful degradation
import apiClient from "../../apiClient";
import { OverallLmsStatsDto } from "../../../types/course.types"; 
import { DailyLearningTime } from "../../../features/Learner/LearnerDashboard/types/types";
import { emitLearnerDashboardRefreshNeeded } from "../../../utils/learnerDashboardEvents";

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
  
  private readonly STATS_TTL = 5 * 60 * 1000; // 5 minutes for stats
  private readonly ACTIVITY_TTL = 2 * 60 * 1000; // 2 minutes for activity data
  private readonly ERROR_RETRY_TTL = 30 * 1000; // 30 seconds before retry on error

  private updateMetrics(responseTime: number, fromCache: boolean, isError: boolean = false): void {
    this.metrics.requestCount++;
    if (fromCache) this.metrics.cacheHits++;
    if (isError) this.metrics.errorCount++;
    
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
  
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (this.cache.size > 20) {
      const oldestEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 5);
      
      oldestEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getMetrics(): RequestMetrics & { cacheSize: number; hitRate: number; errorRate: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.requestCount > 0 ? this.metrics.cacheHits / this.metrics.requestCount : 0,
      errorRate: this.metrics.requestCount > 0 ? this.metrics.errorCount / this.metrics.requestCount : 0
    };
  }
}

export const dashboardCache = new EnterpriseStatsCache();
const activeRequests = new Map<string, Promise<any>>();

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
      const cleanupDelay = priority === 'high' ? 500 : priority === 'normal' ? 1000 : 2000;
      setTimeout(() => {
        activeRequests.delete(key);
      }, cleanupDelay);
    });

  activeRequests.set(key, promise);
  return promise;
}

const createDefaultStats = (): OverallLmsStatsDto => ({
  totalCategories: 0,
  totalPublishedCourses: 0,
  totalActiveLearners: 0,
  totalActiveCoordinators: 0,
  totalProjectManagers: 0,
  averageCourseDurationOverall: 'N/A'
});

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

export const getOverallLmsStatsForLearner = async (): Promise<OverallLmsStatsDto> => {
  const cacheKey = 'learner_overall_stats';
  
  const cachedData = dashboardCache.get<OverallLmsStatsDto>(cacheKey);
  if (cachedData) {
    console.log('📊 Stats served from cache');
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching fresh stats data from API...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await apiClient.get<OverallLmsStatsDto>('/learner/stats/overall', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📈 Overall LMS stats response received');
      const validatedStats = validateStatsResponse(response.data);
      dashboardCache.set(cacheKey, validatedStats);
      emitLearnerDashboardRefreshNeeded('stats-updated');
      
      return validatedStats;
      
    } catch (error: any) {
      // *** THIS IS THE FIX ***
      // Silently handle cancellation errors, as they are expected during navigation.
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log(`↩️ API request for overall stats was canceled. This is normal.`);
        return createDefaultStats(); // Return default data without logging a scary error.
      }
      
      // For all other actual errors, log them and handle gracefully.
      console.error('❌ Error fetching overall LMS stats for learner:', error);
      
      const expiredCache = dashboardCache.get<OverallLmsStatsDto>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Returning expired cached stats due to error');
        return expiredCache;
      }
      
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
      
      dashboardCache.set(cacheKey, defaultStats, 30000);
      
      return defaultStats;
    }
  }, 'normal');
};

export const getWeeklyActivity = async (): Promise<DailyLearningTime[]> => {
  const cacheKey = 'learner_weekly_activity';
  
  const cachedData = dashboardCache.get<DailyLearningTime[]>(cacheKey);
  if (cachedData) {
    console.log('📊 Weekly activity served from cache');
    return cachedData;
  }

  return dedupedRequest(cacheKey, async () => {
    console.log('🔄 Fetching weekly activity from API...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await apiClient.get<DailyLearningTime[]>('/learner/stats/weekly-activity', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const validatedData = Array.isArray(response.data) ? response.data : [];
      dashboardCache.set(cacheKey, validatedData, 2 * 60 * 1000);
      
      console.log(`✅ Weekly activity cached (${validatedData.length} days)`);
      return validatedData;
      
    } catch (error: any) {
      // Silently handle cancellation errors
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log(`↩️ API request for weekly activity was canceled. This is normal.`);
        return [];
      }

      console.error("❌ Error fetching weekly learning activity:", error);
      
      const expiredCache = dashboardCache.get<DailyLearningTime[]>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Returning expired cached activity due to error');
        return expiredCache;
      }
      
      return [];
    }
  }, 'low');
};

export const clearStatsCache = (): void => {
  dashboardCache.clear();
  activeRequests.clear();
  console.log('🧹 Stats cache cleared');
  emitLearnerDashboardRefreshNeeded('stats-updated');
};

export async function preloadStats(): Promise<void> {
  try {
    await Promise.all([
      getOverallLmsStatsForLearner(),
      getWeeklyActivity()
    ]);
    console.log('⚡ Stats data preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload stats:', error);
  }
};

export const getStatsMetrics = () => dashboardCache.getMetrics();

export const invalidateStatsCache = (type?: 'stats' | 'activity' | 'all'): void => {
  if (type === 'stats') {
    dashboardCache.delete('learner_overall_stats');
  } else if (type === 'activity') {
    dashboardCache.delete('learner_weekly_activity');
  } else {
    dashboardCache.clear();
  }
  console.log(`🧹 Stats cache invalidated: ${type || 'all'}`);
};