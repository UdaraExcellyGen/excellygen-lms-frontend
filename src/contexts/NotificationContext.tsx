// Path: src/contexts/NotificationContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  
  const { user, isAuthenticated } = useAuth();

  // Check if user should get notifications
  const shouldFetchNotifications = (() => {
    const hasAccessToken = !!localStorage.getItem('access_token');
    const hasUserId = user?.id || false;
    const currentRoleFromStorage = localStorage.getItem('current_role');
    
    const hasLearnerRole = (
      user?.currentRole === UserRole.Learner ||
      user?.currentRole === 'Learner' ||
      user?.roles?.includes('Learner') ||
      user?.roles?.includes(UserRole.Learner) ||
      currentRoleFromStorage === 'Learner' ||
      currentRoleFromStorage === UserRole.Learner
    );
    
    const isUserAuthenticated = isAuthenticated || (hasAccessToken && hasUserId);
    
    return isUserAuthenticated && hasUserId && hasLearnerRole;
  })();

  const refreshNotifications = async () => {
    if (!shouldFetchNotifications) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [summaryData, notificationsData] = await Promise.all([
        learnerNotificationApi.getNotificationSummary(),
        learnerNotificationApi.getNotifications(1, 20)
      ]);
      
      setSummary(summaryData);
      setUnreadCount(summaryData.unreadCount);
      setNotifications(notificationsData);
    } catch (err: any) {
      if (err.response) {
        setError(`API Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('Network error - unable to reach server');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await learnerNotificationApi.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (summary) {
        setSummary(prev => prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : null);
      }
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await learnerNotificationApi.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      if (summary) {
        setSummary(prev => prev ? { ...prev, unreadCount: 0 } : null);
      }
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await learnerNotificationApi.deleteNotification(notificationId);
      
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (summary) {
          setSummary(prev => prev ? { 
            ...prev, 
            unreadCount: Math.max(0, prev.unreadCount - 1),
            totalCount: Math.max(0, prev.totalCount - 1)
          } : null);
        }
      } else if (summary) {
        setSummary(prev => prev ? { 
          ...prev, 
          totalCount: Math.max(0, prev.totalCount - 1)
        } : null);
      }
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  // Fetch notifications when component mounts and when conditions change
  useEffect(() => {
    if (shouldFetchNotifications) {
      refreshNotifications();
    } else {
      setUnreadCount(0);
      setNotifications([]);
      setSummary(null);
    }
  }, [shouldFetchNotifications, user?.id]);

  // Periodically refresh notifications (every 30 seconds)
  useEffect(() => {
    if (!shouldFetchNotifications) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [shouldFetchNotifications]);

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