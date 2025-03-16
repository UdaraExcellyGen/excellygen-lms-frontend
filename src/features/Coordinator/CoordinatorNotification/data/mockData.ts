import { NotificationsState } from '../types/CCNotification';

export const mockNotifications: NotificationsState = {
  today: [
    {
      id: 1,
      type: 'deletion',
      title: 'Course Deletion Request',
      message: 'Admin has deleted the course: {courseName}',
      time: '2 hours ago',
      isRead: false,
      courseName: 'React Fundamentals',
      courseId: 'react-fundamentals-123'
    },
    {
      id: 2,
      type: 'enrollment',
      title: 'New Enrollment',
      message: '{learnerName} ({learnerId}) has enrolled in {courseName}',
      time: '4 hours ago',
      isRead: false,
      learnerName: 'Alice Johnson',
      learnerId: 'LJ123',
      courseName: 'Advanced JavaScript'
    }
  ],
  yesterday: [],
  earlier: []
};