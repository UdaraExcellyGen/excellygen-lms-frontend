import React from 'react';

// Core Data Types
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

// Time Data Types
export interface WeeklyTimeData {
  week: string;
  hours: number;
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

// Card Component Props
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

// Feature Component Props
export interface ActiveCoursesProps {
  courses: Course[];
  isLoading?: boolean;
}

export interface RecentActivitiesProps {
  activities: Activity[];
  isLoading?: boolean;
}

export interface LearningActivityChartProps {
  data: DailyLearningTime[];
  isLoading: boolean;
}

// Legacy Chart Props (for backward compatibility)
export interface LearningActivityChartPropsLegacy {
  data: WeeklyTimeData[];
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