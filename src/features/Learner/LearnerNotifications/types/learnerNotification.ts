// Path: src/features/Learner/LearnerNotifications/types/learnerNotification.ts

export interface LearnerNotification {
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

export interface NotificationGroup {
  title: string;
  notifications: LearnerNotification[];
  icon: string;
  color: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  projectAssignments: number;
  projectUpdates: number;
  projectRemovals: number;
}