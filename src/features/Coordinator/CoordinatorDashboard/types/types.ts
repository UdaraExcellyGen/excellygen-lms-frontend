export interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

export interface DashboardStats {
  courses: {
    total: number;
    active: number;
  };
  students: {
    total: number;
    active: number;
  };
}

export interface QuickAction {
  text: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

export interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  stats: {
    total: number;
    active: number;
  };
  totalLabel: string;
  activeLabel: string;
  onViewMore: () => void;
}

export interface NotificationCardProps {
  notifications: Notification[];
}

export interface QuickActionsGridProps {
  actions: QuickAction[];
}