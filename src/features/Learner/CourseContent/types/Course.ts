export interface Course {
    id: string;
    title: string;
    duration: string;
    level: string;
    enrolled?: boolean;
    progress?: number;
    category: string;
    activeUsers?: number;
    description?: string;
  }