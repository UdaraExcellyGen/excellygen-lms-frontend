export interface Notification {
  id: number;
  type: 'course' | 'achievement' | 'discussion' | 'Project';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  projectDetails?: {
    name: string;
    technologies: string[];
    assignedEmployees: string[];
  };
  accepted?: boolean;
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

export interface ProjectDetailsPopupProps {
  project: {
    name: string;
    technologies: string[];
    assignedEmployees: string[];
  };
  isAccepted: boolean;
  onClose: () => void;
  onAccept: () => void;
}