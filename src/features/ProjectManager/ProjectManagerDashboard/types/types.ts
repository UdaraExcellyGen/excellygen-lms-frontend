// Path: src/features/ProjectManager/ProjectManagerDashboard/types/types.ts

import { ComponentType } from 'react';

export interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

// PM Dashboard specific stats (matching Admin pattern)
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
  };
  employees: {
    total: number;
    active: number;
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