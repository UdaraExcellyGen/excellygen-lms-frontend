export interface Notification {
  id: number;
  type: 'courseDeletionRequest';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  courseName: string;
  courseCoordinatorId: string;
  courseCoordinatorName: string;
  deletionStatus?: 'deleted';
  courseDescription: string;
  enrollmentCount: number;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
  onDeleteCourse: (id: number) => void;
  onOpenDeleteModal: (notification: Notification) => void;
}

export interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
  onDeleteCourse: (id: number) => void;
  onOpenDeleteModal: (notification: Notification) => void;
}

export interface NotificationsState {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}

export interface DeleteModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}