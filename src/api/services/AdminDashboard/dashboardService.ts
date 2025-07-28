// src/api/services/AdminDashboard/dashboardService.ts
// ENTERPRISE OPTIMIZED: Real-time dashboard stats with smart event handling
import apiClient from "../../apiClient";
import { DashboardStats, Notification } from "../../../features/Admin/AdminDashboard/types/types";
import { dashboardEvents } from "../../../utils/dashboardEvents";

// ENTERPRISE: Import services to calculate stats from cached data
import { getAllCategories } from "../../../features/Admin/ManageCourseCategory/data/api";
import TechnologyService from "./TechnologyService";
import { getAllUsers } from "../userService";

// ENTERPRISE: Enhanced caching with real-time invalidation
let dashboardCache: {
  stats: { data: DashboardStats | null; timestamp: number; isLoading: boolean };
  notifications: { data: Notification[] | null; timestamp: number; isLoading: boolean };
  realTimeMode: boolean; // Flag to use calculated stats vs API stats
} = {
  stats: { data: null, timestamp: 0, isLoading: false },
  notifications: { data: null, timestamp: 0, isLoading: false },
  realTimeMode: true // Enable real-time calculation by default
};

// ENTERPRISE: Smart cache durations based on data type
const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for stats
const NOTIFICATIONS_CACHE_DURATION = 30 * 1000; // 30 seconds for notifications
const REALTIME_STATS_CACHE_DURATION = 10 * 1000; // 10 seconds for real-time calculated stats

// ENTERPRISE: Request deduplication to prevent duplicate API calls
const activeRequests = new Map<string, Promise<any>>();

// ENTERPRISE: Initialize event listeners for real-time updates
let eventListenersInitialized = false;

/**
 * ENTERPRISE: Initialize real-time dashboard event listeners
 */
const initializeEventListeners = () => {
  if (eventListenersInitialized) return;
  
  console.log('🎯 Initializing dashboard real-time event listeners...');
  
  // Listen to all relevant events and invalidate cache
  dashboardEvents.subscribeToMultiple([
    'user-status-changed',
    'user-created', 
    'user-deleted',
    'category-status-changed',
    'category-created',
    'category-deleted',
    'tech-status-changed',
    'tech-created',
    'tech-deleted',
    'dashboard-refresh-needed'
  ], (event) => {
    console.log(`🔄 Dashboard stats invalidated due to: ${event.type}`);
    
    // Invalidate stats cache to force recalculation
    dashboardCache.stats.data = null;
    dashboardCache.stats.timestamp = 0;
    
    // Clear any active requests to force fresh data
    activeRequests.delete('dashboard_stats');
    activeRequests.delete('calculated_stats');
  });
  
  eventListenersInitialized = true;
};

/**
 * ENTERPRISE: Calculate dashboard stats from cached service data
 * This provides real-time updates without waiting for API
 */
const calculateStatsFromCachedData = async (): Promise<DashboardStats | null> => {
  try {
    console.log('📊 Calculating dashboard stats from cached data...');
    
    // Try to get data from service caches (these are fast and usually available)
    const [categoriesResult, usersResult, technologiesResult] = await Promise.allSettled([
      getAllCategories(true), // Include deleted for total count
      getAllUsers(),
      TechnologyService.getAllTechnologies()
    ]);
    
    // Process categories
    let categoryStats = { total: 0, active: 0 };
    if (categoriesResult.status === 'fulfilled') {
      const categories = categoriesResult.value;
      categoryStats = {
        total: categories.filter(cat => !cat.isDeleted).length,
        active: categories.filter(cat => !cat.isDeleted && cat.status === 'active').length
      };
    }
    
    // Process users
    let userStats = { total: 0, active: 0 };
    if (usersResult.status === 'fulfilled') {
      const users = usersResult.value;
      userStats = {
        total: users.length,
        active: users.filter(user => user.status === 'active').length
      };
    }
    
    // Process technologies
    let techStats = { total: 0, active: 0 };
    if (technologiesResult.status === 'fulfilled') {
      const technologies = technologiesResult.value;
      techStats = {
        total: technologies.length,
        active: technologies.filter(tech => tech.status === 'active').length
      };
    }
    
    const calculatedStats: DashboardStats = {
      courseCategories: categoryStats,
      users: userStats,
      technologies: techStats
    };
    
    console.log('✅ Dashboard stats calculated from cache:', calculatedStats);
    return calculatedStats;
    
  } catch (error) {
    console.error('❌ Error calculating stats from cached data:', error);
    return null;
  }
};

/**
 * ENTERPRISE: Enhanced dashboard stats fetching with real-time calculation
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const now = Date.now();
  const { stats } = dashboardCache;
  
  // Initialize event listeners on first call
  initializeEventListeners();
  
  // Return cached data if fresh and not currently loading
  const cacheValidDuration = dashboardCache.realTimeMode ? REALTIME_STATS_CACHE_DURATION : STATS_CACHE_DURATION;
  if (stats.data && (now - stats.timestamp) < cacheValidDuration && !stats.isLoading) {
    console.log('📦 Returning cached dashboard stats');
    return stats.data;
  }
  
  // Check if request is already in progress
  const requestKey = dashboardCache.realTimeMode ? 'calculated_stats' : 'dashboard_stats';
  if (activeRequests.has(requestKey)) {
    console.log('⚡ Stats request already in progress, waiting...');
    return activeRequests.get(requestKey)!;
  }
  
  // Default fallback data
  const defaultStats: DashboardStats = {
    courseCategories: { total: 0, active: 0 },
    users: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  };
  
  // Create new request promise
  const requestPromise = (async () => {
    try {
      stats.isLoading = true;
      
      let calculatedStats: DashboardStats | null = null;
      
      // ENTERPRISE: Try to calculate from cached data first (much faster)
      if (dashboardCache.realTimeMode) {
        calculatedStats = await calculateStatsFromCachedData();
      }
      
      // If we got calculated stats, use them
      if (calculatedStats) {
        stats.data = calculatedStats;
        stats.timestamp = now;
        return calculatedStats;
      }
      
      // ENTERPRISE: Fallback to API call if calculation failed
      console.log('🔄 Fetching dashboard stats from API...');
      
      // Add timeout for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await apiClient.get('/admin/dashboard/stats', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Update cache with API data
      stats.data = response.data;
      stats.timestamp = now;
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      
      // Return cached data if available (even if expired)
      if (stats.data) {
        console.log('⚠️ Returning expired cached stats due to error');
        return stats.data;
      }
      
      // Try one more time with calculated stats if API failed
      if (!dashboardCache.realTimeMode) {
        console.log('🔄 API failed, trying calculated stats as fallback...');
        const fallbackStats = await calculateStatsFromCachedData();
        if (fallbackStats) {
          stats.data = fallbackStats;
          stats.timestamp = now;
          return fallbackStats;
        }
      }
      
      // Return default stats for graceful degradation
      return defaultStats;
    } finally {
      stats.isLoading = false;
      activeRequests.delete(requestKey);
    }
  })();
  
  // Store the request to prevent duplication
  activeRequests.set(requestKey, requestPromise);
  
  return requestPromise;
};

/**
 * ENTERPRISE: Enhanced notifications fetching with smart caching
 */
export const getDashboardNotifications = async (): Promise<Notification[]> => {
  const now = Date.now();
  const { notifications } = dashboardCache;
  
  // Return cached data if fresh and not currently loading
  if (notifications.data && (now - notifications.timestamp) < NOTIFICATIONS_CACHE_DURATION && !notifications.isLoading) {
    console.log('📦 Returning cached notifications');
    return notifications.data;
  }
  
  // Check if request is already in progress
  const requestKey = 'dashboard_notifications';
  if (activeRequests.has(requestKey)) {
    console.log('⚡ Notifications request already in progress, waiting...');
    return activeRequests.get(requestKey)!;
  }
  
  // Create new request promise
  const requestPromise = (async () => {
    try {
      notifications.isLoading = true;
      console.log('🔄 Fetching fresh notifications...');
      
      // Add timeout for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await apiClient.get('/admin/dashboard/notifications', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Update cache with fresh data
      notifications.data = response.data;
      notifications.timestamp = now;
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      
      // Return cached data if available (even if expired)
      if (notifications.data) {
        console.log('⚠️ Returning expired cached notifications due to error');
        return notifications.data;
      }
      
      // Return empty array for graceful degradation
      return [];
    } finally {
      notifications.isLoading = false;
      activeRequests.delete(requestKey);
    }
  })();
  
  // Store the request to prevent duplication
  activeRequests.set(requestKey, requestPromise);
  
  return requestPromise;
};

/**
 * ENTERPRISE: Fetch both stats and notifications with real-time calculation
 */
export const getDashboardData = async (): Promise<{ stats: DashboardStats; notifications: Notification[] }> => {
  console.log('🔄 Fetching dashboard data with real-time stats...');
  
  // Use Promise.allSettled to handle partial failures gracefully
  const [statsResult, notificationsResult] = await Promise.allSettled([
    getDashboardStats(),
    getDashboardNotifications()
  ]);
  
  const stats = statsResult.status === 'fulfilled' 
    ? statsResult.value 
    : { courseCategories: { total: 0, active: 0 }, users: { total: 0, active: 0 }, technologies: { total: 0, active: 0 } };
    
  const notifications = notificationsResult.status === 'fulfilled' 
    ? notificationsResult.value 
    : [];
  
  return { stats, notifications };
};

/**
 * ENTERPRISE: Force refresh dashboard stats (for manual refresh button)
 */
export const refreshDashboardStats = async (): Promise<DashboardStats> => {
  console.log('🔄 Force refreshing dashboard stats...');
  
  // Clear cache and active requests
  dashboardCache.stats.data = null;
  dashboardCache.stats.timestamp = 0;
  activeRequests.clear();
  
  // Get fresh stats
  return getDashboardStats();
};

/**
 * ENTERPRISE: Clear dashboard cache - useful for forcing refresh
 */
export const clearDashboardCache = () => {
  dashboardCache.stats.data = null;
  dashboardCache.stats.timestamp = 0;
  dashboardCache.notifications.data = null;
  dashboardCache.notifications.timestamp = 0;
  activeRequests.clear();
  console.log('🧹 Dashboard cache cleared');
};

/**
 * ENTERPRISE: Toggle between real-time calculated stats and API stats
 */
export const setRealTimeMode = (enabled: boolean) => {
  dashboardCache.realTimeMode = enabled;
  // Clear cache when switching modes
  clearDashboardCache();
  console.log(`🔄 Dashboard real-time mode ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * ENTERPRISE: Get current dashboard cache status
 */
export const getDashboardCacheStatus = () => {
  return {
    hasStatsCache: !!dashboardCache.stats.data,
    hasNotificationsCache: !!dashboardCache.notifications.data,
    statsAge: dashboardCache.stats.timestamp ? Date.now() - dashboardCache.stats.timestamp : 0,
    notificationsAge: dashboardCache.notifications.timestamp ? Date.now() - dashboardCache.notifications.timestamp : 0,
    realTimeMode: dashboardCache.realTimeMode,
    activeRequests: Array.from(activeRequests.keys())
  };
};

/**
 * ENTERPRISE: Preload dashboard data in background for better perceived performance
 */
export const preloadDashboardData = () => {
  getDashboardData().catch(() => {
    // Silently handle errors for preload
  });
};