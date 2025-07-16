import React from 'react';

export interface Course {
  id: number;
  title: string;
  progress: number;
}

export interface Activity {
  id: number;
  type: string;
  course: string;
  time?: string;
}

// THIS IS THE UPDATED TYPE
export interface DailyLearningTime {
  day: string;
  fullDate: string;
  totalMinutes: number | null; // Can be null for future days
  isToday: boolean;            // Flag from backend
}

export interface LearningStat {
  title: string;
  value: number | string;
  trend: string;
  link?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface ActiveCoursesProps {
  courses: Course[];
  isLoading?: boolean;
}

export interface RecentActivitiesProps {
  activities: Activity[];
}

export interface LearningActivityChartProps {
  data: DailyLearningTime[];
  isLoading: boolean;
}

export interface RecentAchievementsProps {
  badges: Array<{
    icon: React.ReactNode;
    name: string;
    color: string;
  }>;
  nextBadges: Array<{
    name: string;
    progress: number;
  }>;
}