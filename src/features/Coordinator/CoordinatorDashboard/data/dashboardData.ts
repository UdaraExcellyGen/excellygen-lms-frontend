import { Book, Users, BarChart2, LayoutList } from 'lucide-react';
import { Notification, QuickAction } from '../types/types';

export const initialNotifications: Notification[] = [
  { id: 1, text: 'New student enrolled in Advanced AI course', time: '2 hours ago', isNew: true },
  { id: 2, text: 'Quiz results ready for review', time: '3 hours ago', isNew: true },
  { id: 3, text: 'Course material update needed', time: '5 hours ago', isNew: false },
];

export const getQuickActions = (navigate: (path: string) => void): QuickAction[] => [
  { 
    text: 'Create New Course', 
    icon: Book,
    onClick: () => navigate('/coordinator/course-details/${createdCourse.id}')
  },
  { 
    text: 'View My Courses', 
    icon: LayoutList,
    onClick: () => navigate('/coordinator/course-display-page')
  },
  { 
    text: 'View Students', 
    icon: Users,
    onClick: () => navigate('/coordinator/learner-list')
  },
  { 
    text: 'Course Analytics', 
    icon: BarChart2,
    onClick: () => navigate('/coordinator/analytics')
  }
];