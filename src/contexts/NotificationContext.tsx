// src/contexts/NotificationContext.tsx
// Professional notification context - minimal polling like real-world apps

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { learnerNotificationApi, LearnerNotificationDto, LearnerNotificationSummaryDto } from '../api/services/learnerNotificationService';
import { useAuth } from './AuthContext';
import { UserRole } from '../types/auth.types';

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
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshInProgressRef = useRef<boolean>(false);
  
  // Professional polling - much less aggressive
  const POLLING_INTERVAL = 10 * 60 * 1000; // 10 minutes - like most professional apps

  // Check if user should get notifications
  const shouldFetchNotifications = (() => {
    const hasAccessToken = !!localStorage.getItem('access_token');
    const hasUserId = user?.id || false;
    const currentRoleFromStorage = localStorage.getItem('current_role');
    
    const hasLearnerRole = (
      currentRole === UserRole.Learner ||
      user?.roles?.includes(UserRole.Learner) ||
      currentRoleFromStorage === 'Learner' ||
      currentRoleFromStorage === UserRole.Learner
    );
    
    const isUserAuthenticated = initialized && user && hasAccessToken && hasUserId;
    
    return isUserAuthenticated && hasUserId && hasLearnerRole;
  })();

  // Professional refresh - minimal API calls
  const refreshNotifications = useCallback(async () => {
    if (!shouldFetchNotifications || refreshInProgressRef.current) {
      return;
    }

    refreshInProgressRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Only fetch summary for polling - keep it lightweight
      const summaryData = await learnerNotificationApi.getNotificationSummary();
      
      // Only fetch full notifications if user navigates to notifications page
      // or if unread count changed significantly
      const shouldFetchDetails = summaryData.unreadCount !== unreadCount && summaryData.unreadCount > 0;
      
      let notificationsData = notifications;
      if (shouldFetchDetails) {
        notificationsData = await learnerNotificationApi.getNotifications(1, 10); // Smaller batch
      }
      
      setSummary(summaryData);
      setUnreadCount(summaryData.unreadCount);
      if (shouldFetchDetails) {
        setNotifications(notificationsData);
      }
      
    } catch (err: any) {
      // Silent errors for background polling - don't disturb user
      if (err.response?.status !== 401) {
        setError('Failed to fetch notifications');
      }
    } finally {
      setLoading(false);
      refreshInProgressRef.current = false;
    }
  }, [shouldFetchNotifications, unreadCount, notifications]);

  // Professional polling - simple and reliable
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      refreshNotifications();
    }, POLLING_INTERVAL);
  }, [refreshNotifications]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Optimistic updates for better UX
  const markAsRead = async (notificationId: number) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await learnerNotificationApi.markAsRead(notificationId);
      if (summary) {
        setSummary({ ...summary, unreadCount: Math.max(0, summary.unreadCount - 1) });
      }
    } catch (err) {
      // Revert on error
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      setUnreadCount(prev => prev + 1);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    
    try {
      await learnerNotificationApi.markAllAsRead();
      if (summary) {
        setSummary({ ...summary, unreadCount: 0 });
      }
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    
    // Optimistic update
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    if (notificationToDelete && !notificationToDelete.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await learnerNotificationApi.deleteNotification(notificationId);
      if (summary) {
        setSummary({ 
          ...summary, 
          unreadCount: notificationToDelete && !notificationToDelete.isRead 
            ? Math.max(0, summary.unreadCount - 1) 
            : summary.unreadCount,
          totalCount: Math.max(0, summary.totalCount - 1)
        });
      }
    } catch (err) {
      // Revert on error
      if (notificationToDelete) {
        setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => b.id - a.id));
        if (!notificationToDelete.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      }
      setError('Failed to delete notification');
    }
  };

  // Initialize notifications with professional approach
  useEffect(() => {
    if (shouldFetchNotifications) {
      // Initial fetch - delayed to not block app startup
      const timeoutId = setTimeout(() => {
        refreshNotifications();
        startPolling(); // Start gentle polling
      }, 3000); // 3 second delay
      
      return () => {
        clearTimeout(timeoutId);
        stopPolling();
      };
    } else {
      // Clear data and stop polling
      setUnreadCount(0);
      setNotifications([]);
      setSummary(null);
      stopPolling();
    }
  }, [shouldFetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
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
    deleteNotification
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