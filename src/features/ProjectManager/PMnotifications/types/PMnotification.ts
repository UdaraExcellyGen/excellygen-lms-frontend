export type NotificationType = 'projectAcceptance';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  projectName?: string;
  projectId?: string;
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