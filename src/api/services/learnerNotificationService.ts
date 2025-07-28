// Path: src/api/services/learnerNotificationService.ts

import apiClient from '../apiClient';

export interface LearnerNotificationDto {
  id: number;
  userId: string;
  title: string;
  message: string;
  
  type: 'project_assignment' | 'project_update' | 'project_removal' | 'general';
  isRead: boolean;
  createdAt: string;
  projectId?: string;
  projectName?: string;
  assignerName?: string;
  role?: string;
  workloadPercentage?: number;
}

export interface LearnerNotificationSummaryDto {
  totalCount: number;
  unreadCount: number;
  recentNotifications: LearnerNotificationDto[];
}

export const learnerNotificationApi = {
  // Get notification summary (includes unread count and recent notifications)
  getNotificationSummary: async (): Promise<LearnerNotificationSummaryDto> => {
    const response = await apiClient.get('/learner-notifications/summary');
    return response.data;
  },

  // Get all notifications with pagination
  getNotifications: async (page: number = 1, pageSize: number = 20): Promise<LearnerNotificationDto[]> => {
    const response = await apiClient.get(`/learner-notifications?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/learner-notifications/unread-count');
    return response.data;
  },

  // Mark a specific notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/learner-notifications/${notificationId}/mark-read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/learner-notifications/mark-all-read');
  },

  // Delete a notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/learner-notifications/${notificationId}`);
  }
};