import { DashboardStats, Notification, QuickAction } from '../types/types';

export const initialNotifications: Notification[] = [
  { id: 1, text: 'New course submission needs review', time: '2 hours ago', isNew: true },
  { id: 2, text: 'User reports for certificate generation', time: '3 hours ago', isNew: true },
  { id: 3, text: 'System maintenance scheduled', time: '5 hours ago', isNew: true },
];

export const initialStats: DashboardStats = {
  coordinators: { total: 45, active: 28 },
  users: { total: 1250, active: 890 },
  technologies: { total: 25, active: 20 }
};
export const getQuickActions = (navigate: (path: string) => void): QuickAction[] => [
  {
    text: 'Manage Course Categories',
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/admin/course-categories')
  },
  {
    text: 'Manage Users',
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/admin/manage-users')
  },
  {
    text: 'Manage Permissions',
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/admin/permissions')
  },
  {
    text: "Manage Technologies",
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/admin/manage-tech')
  }
];