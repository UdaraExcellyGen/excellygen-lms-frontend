// Path: src/features/ProjectManager/ProjectManagerDashboard/types/types.ts

import { ComponentType } from 'react';

export interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

// Updated PM Dashboard specific stats to match backend DTO exactly
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    withEmployees: number;  // Added this field from backend
  };
  employees: {
    total: number;
    onProjects: number;     // This should now show correct count from backend
    available: number;
    fullyUtilized: number;
  };
  technologies: {
    total: number;
    active: number;
  };
}

// Backend DTO interface for type safety when calling API
export interface ProjectManagerDashboardStatsDto {
  projects: {
    total: number;
    active: number;
    withEmployees: number;
  };
  employees: {
    total: number;
    onProjects: number;
    available: number;
    fullyUtilized: number;
  };
  technologies: {
    total: number;
    active: number;
  };
}

export interface QuickAction {
  text: string;
  icon: ComponentType<any>;
  color: string;
  onClick: () => void;
}

export interface StatCardProps {
  icon: ComponentType<any>;
  title: string;
  stats: {
    total: number;
    active: number;
  };
  totalLabel: string;
  activeLabel: string;
  onClick?: () => void;
}

export interface QuickActionsGridProps {
  actions: QuickAction[];
}

export interface HeaderProps {
  notifications?: Notification[];
  adminName?: string;
  role?: string;
  avatar?: string | null;
}

export interface NotificationCardProps {
  notifications: Notification[];
}