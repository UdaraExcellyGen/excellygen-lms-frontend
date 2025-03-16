export interface Notification {
  id: number;
  type: 'course' | 'enrollment' | 'deletion';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  courseName?: string;
  courseId?: string;
  learnerName?: string;
  learnerId?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
}

export interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
}

export interface NotificationsState {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}