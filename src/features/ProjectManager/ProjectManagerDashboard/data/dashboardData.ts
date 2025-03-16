import { NavigateFunction } from 'react-router-dom';
import { Notification, QuickAction } from '../types/types';

export const initialNotifications: Notification[] = [
  {
    id: 1,
    text: "New project 'Website Redesign' has been created",
    time: "2 hours ago",
    isNew: true
  },
  {
    id: 2,
    text: "Mobile App Development deadline in 3 days",
    time: "5 hours ago",
    isNew: true
  },
  {
    id: 3,
    text: "Employee request for Database Optimization project",
    time: "1 day ago",
    isNew: false
  },
  {
    id: 4,
    text: "Training Program Development marked as completed",
    time: "2 days ago",
    isNew: false
  }
];

export const initialStats = {
  projects: {
    total: 45,
    active: 28
  },
  employees: {
    total: 1250,
    active: 890
  },
  technologies: {
    total: 25,
    active: 20
  }
};

export const getQuickActions = (navigate: NavigateFunction): QuickAction[] => [
  {
    text: "Manage Projects",
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/manager/projects')
  },
  {
    text: "Manage Employees",
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/manager/employee-assignment')
  },
  {
    text: "Manage Permissions",
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/manager/permissions')
  },
  {
    text: "Manage Technologies",
    color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
    hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
    onClick: () => navigate('/manager/technologies')
  }
];