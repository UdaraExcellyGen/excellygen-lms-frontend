import { Notification, NotificationsState } from '../types/PMnotification';

export const mockNotifications: NotificationsState = {
  today: [
    {
      id: 1,
      type: 'projectAcceptance',
      title: 'Project Acceptance',
      message: '{learnerId} {learnerName} has accepted {projectName} {projectId}',
      time: '2 hours ago',
      isRead: false,
      projectName: 'E-commerce Website',
      projectId: 'EC-2024-001',
      learnerName: 'Bob Williams',
      learnerId: 'BW789',
    },
    {
      id: 2,
      type: 'projectAcceptance',
      title: 'Project Acceptance',
      message: '{learnerId} {learnerName} has accepted {projectName} {projectId}',
      time: '3 hours ago',
      isRead: false,
      projectName: 'Mobile App Redesign',
      projectId: 'MA-2024-002',
      learnerName: 'Charlie Davis',
      learnerId: 'CD101',
    }
  ],
  yesterday: [],
  earlier: [],
};

export const generateMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: Math.floor(Math.random() * 1000),
  type: 'projectAcceptance',
  title: 'Project Acceptance',
  message: '{learnerId} {learnerName} has accepted {projectName} {projectId}',
  time: '2 hours ago',
  isRead: false,
  ...overrides
});