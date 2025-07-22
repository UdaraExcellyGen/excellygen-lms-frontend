// src/contexts/NotificationContext.tsx
// OPTIMIZED: Smart notification polling with activity-based intervals

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { learnerNotificationApi, LearnerNotificationDto, LearnerNotificationSummaryDto } from '../api/services/learnerNotificationService';
import { useAuth } from './AuthContext';
import { UserRole } from '../types/auth.types';
import ActivityTracker from '../api/services/ActivityTracker';

interface NotificationContextType {
  unreadCount: number;
  notifications: LearnerNotificationDto[];
  summary: LearnerNotificationSummaryDto | null;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  // OPTIMIZATION: New methods for better control
  getPollingStatus: () => PollingStatus;
  pausePolling: () => void;
  resumePolling: () => void;
}

interface PollingStatus {
  isPolling: boolean;
  interval: number;
  lastUpdate: number | null;
  requestCount: number;
}

interface NotificationCache {
  summary: LearnerNotificationSummaryDto | null;
  notifications: LearnerNotificationDto[];
  timestamp: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<LearnerNotificationDto[]>([]);
  const [summary, setSummary] = useState<LearnerNotificationSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, initialized, currentRole } = useAuth();
  
  // OPTIMIZATION: Polling control with refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number | null>(null);
  const requestCountRef = useRef<number>(0);
  const isPollingPausedRef = useRef<boolean>(false);
  const activityTrackerRef = useRef<ActivityTracker | null>(null);
  
  // OPTIMIZATION: Cache management
  const cacheRef = useRef<NotificationCache>({
    summary: null,
    notifications: [],
    timestamp: 0
  });
  
  // OPTIMIZATION: Smart polling intervals
  const POLLING_INTERVALS = {
    ACTIVE_USER: 2 * 60 * 1000,      // 2 minutes for active users
    IDLE_USER: 10 * 60 * 1000,       // 10 minutes for idle users
    VERY_IDLE_USER: 30 * 60 * 1000,  // 30 minutes for very idle users
    CACHE_DURATION: 60 * 1000,       // 1 minute cache duration
    MAX_IDLE_TIME: 20 * 60 * 1000    // 20 minutes max idle before stopping
  };

  // Check if user should get notifications
  const shouldFetchNotifications = (() => {
    const hasAccessToken = !!localStorage.getItem('access_token');
    const hasUserId = user?.id || false;
    const currentRoleFromStorage = localStorage.getItem('current_role');
    
    // FIXED: Use consistent UserRole enum values and string comparisons
    const hasLearnerRole = (
      currentRole === UserRole.Learner ||
      user?.roles?.includes(UserRole.Learner) ||
      currentRoleFromStorage === 'Learner' ||
      currentRoleFromStorage === UserRole.Learner
    );
    
    // FIXED: Use initialized and user presence instead of isAuthenticated
    const isUserAuthenticated = initialized && user && hasAccessToken && hasUserId;
    
    return isUserAuthenticated && hasUserId && hasLearnerRole;
  })();

  // OPTIMIZATION: Initialize activity tracker
  useEffect(() => {
    if (shouldFetchNotifications) {
      activityTrackerRef.current = ActivityTracker.getInstance();
      activityTrackerRef.current.startTracking();
    }
    
    return () => {
      if (activityTrackerRef.current) {
        activityTrackerRef.current.stopTracking();
      }
    };
  }, [shouldFetchNotifications]);

  // OPTIMIZATION: Smart cache checking
  const getCachedData = useCallback((): NotificationCache | null => {
    const cache = cacheRef.current;
    const now = Date.now();
    
    if (cache.timestamp && (now - cache.timestamp) < POLLING_INTERVALS.CACHE_DURATION) {
      if (import.meta.env.DEV) {
        console.log('📦 Using cached notification data');
      }
      return cache;
    }
    
    return null;
  }, []);

  // OPTIMIZATION: Determine polling interval based on user activity
  const getPollingInterval = useCallback((): number => {
    if (!activityTrackerRef.current) return POLLING_INTERVALS.IDLE_USER;
    
    const idleTime = activityTrackerRef.current.getIdleTime();
    
    if (idleTime > POLLING_INTERVALS.MAX_IDLE_TIME) {
      if (import.meta.env.DEV) {
        console.log('🛑 User very idle, stopping notification polling');
      }
      return 0; // Stop polling
    }
    
    if (idleTime < 5 * 60 * 1000) { // Less than 5 minutes idle
      return POLLING_INTERVALS.ACTIVE_USER;
    }
    
    if (idleTime < 15 * 60 * 1000) { // Less than 15 minutes idle
      return POLLING_INTERVALS.IDLE_USER;
    }
    
    return POLLING_INTERVALS.VERY_IDLE_USER;
  }, []);

  // OPTIMIZATION: Enhanced refresh with caching and deduplication
  const refreshNotifications = useCallback(async () => {
    if (!shouldFetchNotifications || isPollingPausedRef.current) {
      return;
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !loading) {
      setSummary(cachedData.summary);
      setNotifications(cachedData.notifications);
      setUnreadCount(cachedData.summary?.unreadCount || 0);
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      if (import.meta.env.DEV) {
        console.log('🔄 Notification refresh already in progress, skipping');
      }
      return;
    }

    setLoading(true);
    setError(null);
    requestCountRef.current++;
    
    try {
      if (import.meta.env.DEV) {
        console.log('🔔 Refreshing notifications from API');
      }
      
      // OPTIMIZATION: Only fetch summary first, then notifications if needed
      const summaryData = await learnerNotificationApi.getNotificationSummary();
      
      // Check if we need to fetch full notifications
      let notificationsData: LearnerNotificationDto[] = [];
      
      if (summaryData.totalCount > 0) {
        // Only fetch full notifications if there are any
        notificationsData = await learnerNotificationApi.getNotifications(1, 20);
      }
      
      // Update cache
      cacheRef.current = {
        summary: summaryData,
        notifications: notificationsData,
        timestamp: Date.now()
      };
      
      setSummary(summaryData);
      setUnreadCount(summaryData.unreadCount);
      setNotifications(notificationsData);
      lastUpdateRef.current = Date.now();
      
      if (import.meta.env.DEV) {
        console.log(`✅ Notifications updated: ${summaryData.unreadCount} unread`);
      }
      
    } catch (err: any) {
      // OPTIMIZATION: Better error handling with retry logic
      if (err.response) {
        setError(`API Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('Network error - unable to reach server');
      } else {
        setError(`Error: ${err.message}`);
      }
      
      if (import.meta.env.DEV) {
        console.error('❌ Notification refresh failed:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [shouldFetchNotifications, loading, getCachedData]);

  // OPTIMIZATION: Smart polling management
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    const scheduleNext = () => {
      const interval = getPollingInterval();
      
      if (interval === 0) {
        // Stop polling if user is very idle
        if (import.meta.env.DEV) {
          console.log('📴 Stopping notification polling due to user inactivity');
        }
        return;
      }
      
      pollingIntervalRef.current = setTimeout(() => {
        refreshNotifications().finally(() => {
          scheduleNext(); // Schedule next poll
        });
      }, interval);
      
      if (import.meta.env.DEV) {
        console.log(`⏰ Next notification poll in ${interval / 1000}s`);
      }
    };
    
    scheduleNext();
  }, [getPollingInterval, refreshNotifications]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // OPTIMIZATION: Enhanced mark as read with cache update
  const markAsRead = async (notificationId: number) => {
    try {
      await learnerNotificationApi.markAsRead(notificationId);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (summary) {
        const updatedSummary = { ...summary, unreadCount: Math.max(0, summary.unreadCount - 1) };
        setSummary(updatedSummary);
        
        // Update cache
        cacheRef.current.summary = updatedSummary;
        cacheRef.current.notifications = cacheRef.current.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
      }
    } catch (err) {
      setError('Failed to mark notification as read');
      if (import.meta.env.DEV) {
        console.error('❌ Mark as read failed:', err);
      }
    }
  };

  // OPTIMIZATION: Enhanced mark all as read
  const markAllAsRead = async () => {
    try {
      await learnerNotificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      if (summary) {
        const updatedSummary = { ...summary, unreadCount: 0 };
        setSummary(updatedSummary);
        
        // Update cache
        cacheRef.current.summary = updatedSummary;
        cacheRef.current.notifications = cacheRef.current.notifications.map(n => ({ ...n, isRead: true }));
      }
    } catch (err) {
      setError('Failed to mark all notifications as read');
      if (import.meta.env.DEV) {
        console.error('❌ Mark all as read failed:', err);
      }
    }
  };

  // OPTIMIZATION: Enhanced delete with cache update
  const deleteNotification = async (notificationId: number) => {
    try {
      await learnerNotificationApi.deleteNotification(notificationId);
      
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (summary) {
          const updatedSummary = { 
            ...summary, 
            unreadCount: Math.max(0, summary.unreadCount - 1),
            totalCount: Math.max(0, summary.totalCount - 1)
          };
          setSummary(updatedSummary);
          cacheRef.current.summary = updatedSummary;
        }
      } else if (summary) {
        const updatedSummary = { 
          ...summary, 
          totalCount: Math.max(0, summary.totalCount - 1)
        };
        setSummary(updatedSummary);
        cacheRef.current.summary = updatedSummary;
      }
      
      // Update cache
      cacheRef.current.notifications = cacheRef.current.notifications.filter(n => n.id !== notificationId);
      
    } catch (err) {
      setError('Failed to delete notification');
      if (import.meta.env.DEV) {
        console.error('❌ Delete notification failed:', err);
      }
    }
  };

  // OPTIMIZATION: Utility methods for external control
  const getPollingStatus = useCallback((): PollingStatus => {
    return {
      isPolling: pollingIntervalRef.current !== null,
      interval: getPollingInterval(),
      lastUpdate: lastUpdateRef.current,
      requestCount: requestCountRef.current
    };
  }, [getPollingInterval]);

  const pausePolling = useCallback(() => {
    isPollingPausedRef.current = true;
    stopPolling();
    if (import.meta.env.DEV) {
      console.log('⏸️ Notification polling paused');
    }
  }, [stopPolling]);

  const resumePolling = useCallback(() => {
    isPollingPausedRef.current = false;
    startPolling();
    if (import.meta.env.DEV) {
      console.log('▶️ Notification polling resumed');
    }
  }, [startPolling]);

  // OPTIMIZATION: Initialize notifications and start smart polling
  useEffect(() => {
    if (shouldFetchNotifications) {
      // Initial fetch
      refreshNotifications();
      // Start smart polling
      startPolling();
    } else {
      // Clear data and stop polling
      setUnreadCount(0);
      setNotifications([]);
      setSummary(null);
      stopPolling();
      
      // Clear cache
      cacheRef.current = { summary: null, notifications: [], timestamp: 0 };
    }

    return () => {
      stopPolling();
    };
  }, [shouldFetchNotifications, refreshNotifications, startPolling, stopPolling]);

  // OPTIMIZATION: Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (activityTrackerRef.current) {
        activityTrackerRef.current.stopTracking();
      }
    };
  }, [stopPolling]);

  const value: NotificationContextType = {
    unreadCount,
    notifications,
    summary,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getPollingStatus,
    pausePolling,
    resumePolling
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};