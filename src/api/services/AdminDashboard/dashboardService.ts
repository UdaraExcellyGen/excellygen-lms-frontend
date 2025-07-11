import apiClient from "../../apiClient";
import { DashboardStats, Notification } from "../../../features/Admin/AdminDashboard/types/types";

// OPTIMIZATION: Add caching for dashboard data
let dashboardCache: {
  stats: { data: DashboardStats | null; timestamp: number; isLoading: boolean };
  notifications: { data: Notification[] | null; timestamp: number; isLoading: boolean };
} = {
  stats: { data: null, timestamp: 0, isLoading: false },
  notifications: { data: null, timestamp: 0, isLoading: false }
};

// Cache durations
const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for stats
const NOTIFICATIONS_CACHE_DURATION = 30 * 1000; // 30 seconds for notifications

/**
 * Fetches dashboard statistics from the API with caching
 * @returns Dashboard statistics including course categories, users, and technologies
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const now = Date.now();
  const { stats } = dashboardCache;
  
  // Return cached data if fresh
  if (stats.data && (now - stats.timestamp) < STATS_CACHE_DURATION && !stats.isLoading) {
    console.log('Returning cached dashboard stats');
    return stats.data;
  }
  
  // Wait for existing request if already loading
  if (stats.isLoading) {
    console.log('Stats request in progress, waiting...');
    let attempts = 0;
    while (stats.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (stats.data) return stats.data;
  }
  
  // Default fallback data
  const defaultStats: DashboardStats = {
    courseCategories: { total: 0, active: 0 },
    users: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  };
  
  try {
    stats.isLoading = true;
    console.log('Fetching fresh dashboard stats...');
    
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await apiClient.get('/admin/dashboard/stats', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache
    stats.data = response.data;
    stats.timestamp = now;
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return cached data if available (even if expired)
    if (stats.data) {
      console.log('Returning expired cached stats due to error');
      return stats.data;
    }
    
    // Return default stats for graceful degradation
    return defaultStats;
  } finally {
    stats.isLoading = false;
  }
};

/**
 * Fetches dashboard notifications from the API with caching
 * @returns List of notifications
 */
export const getDashboardNotifications = async (): Promise<Notification[]> => {
  const now = Date.now();
  const { notifications } = dashboardCache;
  
  // Return cached data if fresh
  if (notifications.data && (now - notifications.timestamp) < NOTIFICATIONS_CACHE_DURATION && !notifications.isLoading) {
    console.log('Returning cached notifications');
    return notifications.data;
  }
  
  // Wait for existing request if already loading
  if (notifications.isLoading) {
    console.log('Notifications request in progress, waiting...');
    let attempts = 0;
    while (notifications.isLoading && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (notifications.data) return notifications.data;
  }
  
  try {
    notifications.isLoading = true;
    console.log('Fetching fresh notifications...');
    
    // Add timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await apiClient.get('/admin/dashboard/notifications', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Update cache
    notifications.data = response.data;
    notifications.timestamp = now;
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    
    // Return cached data if available (even if expired)
    if (notifications.data) {
      console.log('Returning expired cached notifications due to error');
      return notifications.data;
    }
    
    // Return empty array for graceful degradation
    return [];
  } finally {
    notifications.isLoading = false;
  }
};

/**
 * Fetch both stats and notifications in parallel with optimized error handling
 */
export const getDashboardData = async (): Promise<{ stats: DashboardStats; notifications: Notification[] }> => {
  console.log('Fetching dashboard data in parallel...');
  
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
 * Clear dashboard cache - useful for forcing refresh
 */
export const clearDashboardCache = () => {
  dashboardCache.stats.data = null;
  dashboardCache.stats.timestamp = 0;
  dashboardCache.notifications.data = null;
  dashboardCache.notifications.timestamp = 0;
  console.log('Dashboard cache cleared');
};

/**
 * Preload dashboard data in background
 */
export const preloadDashboardData = () => {
  getDashboardData().catch(() => {
    // Silently handle errors for preload
  });
};