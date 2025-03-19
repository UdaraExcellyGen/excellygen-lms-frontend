import { DashboardStats, Notification, QuickAction } from '../types/types';

export const initialNotifications: Notification[] = [
  { id: 1, text: 'New student enrolled in Advanced AI course', time: '2 hours ago', isNew: true },
  { id: 2, text: 'Quiz results ready for review', time: '3 hours ago', isNew: true },
  { id: 3, text: 'Course material update needed', time: '5 hours ago', isNew: true },
];

export const initialStats: DashboardStats = {
  courses: { total: 12, active: 8 },
  students: { total: 450, active: 380 },
};

export const getQuickActions = (navigate: (path: string) => void): QuickAction[] => [
  { 
    text: 'Create New Course', 
    color: 'bg-[#03045e]',
    hoverColor: 'hover:scale-105',
    onClick: () => navigate('/coordinator/course-details')
  },
  { 
    text: 'View Students', 
    color: 'bg-[#03045e]', 
    hoverColor: 'hover:scale-105',
    onClick: () => navigate('/coordinator/learner-list')
  },
  { 
    text: 'Course Analytics', 
    color: 'bg-[#03045e]', 
    hoverColor: 'hover:scale-105',
    onClick: () => navigate('/coordinator/analytics')
  }
];