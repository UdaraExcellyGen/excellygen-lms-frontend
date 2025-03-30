import { ReactNode } from 'react';

export interface PathCard {
  title: string;
  icon: ReactNode;
  description: string;
  totalCourses: number;
  activeUsers: number;
  avgDuration: string;
}