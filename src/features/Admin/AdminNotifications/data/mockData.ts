import { NotificationsState } from '../types/AdminNotification';

export const initialNotifications: NotificationsState = {
  today: [
    {
      id: 1,
      type: 'courseDeletionRequest',
      title: 'Course Deletion Request',
      message: '', 
      time: '2 hours ago',
      isRead: false,
      courseName: 'Introduction to React',
      courseCoordinatorId: 'CC123',
      courseCoordinatorName: 'Alice Smith',
      courseDescription: 'Learn the fundamentals of React, including components, state management, and hooks in this comprehensive introduction course.',
      enrollmentCount: 78
    }
  ],
  yesterday: [],
  earlier: []
};

export const generateInitialMessages = (notifications: NotificationsState): { [key: number]: string } => {
  const initialMessages: { [key: number]: string } = {};
  
  Object.keys(notifications).forEach(timeframe => {
    notifications[timeframe as keyof NotificationsState].forEach(notification => {
      initialMessages[notification.id] = `${notification.courseCoordinatorId} ${notification.courseCoordinatorName} has requested to delete ${notification.courseName}`;
    });
  });
  
  return initialMessages;
};