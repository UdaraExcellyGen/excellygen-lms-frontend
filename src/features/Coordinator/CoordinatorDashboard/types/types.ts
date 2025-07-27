import { ComponentType } from 'react';

export interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

export interface QuickAction {
  text: string;
  icon: ComponentType<any>;
  onClick: () => void;
}

export interface StatCardProps {
  icon: ComponentType<any>;
  title: string;
  stats: {
    total: number;
    active: number;
    inactive?: number;
  };
  totalLabel: string;
  activeLabel: string;
   inactiveLabel?: string;
  onClick?: () => void;
}

export interface QuickActionsGridProps {
  actions: QuickAction[];
}

export interface HeaderProps {
  notifications?: Notification[];
  coordinatorName?: string;
  role?: string;
  avatar?: string | null;
}

export interface NotificationCardProps {
  notifications: Notification[];
}