// src/features/Learner/LearnerDashboard/types/types.ts
// ENTERPRISE OPTIMIZED: Professional type definitions with JSDoc documentation
import React from 'react';

/**
 * ENTERPRISE: Core Data Types
 * Optimized interfaces for learner dashboard data structures
 */

/**
 * Represents a course with learner progress information
 * @interface Course
 */
export interface Course {
  /** Unique course identifier */
  id: number;
  /** Course title/name */
  title: string;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Represents a learner activity/achievement
 * @interface Activity
 */
export interface Activity {
  /** Unique activity identifier */
  id: number;
  /** Type of activity (e.g., "Certificate Earned", "Badge Earned") */
  type: string;
  /** Associated course name */
  course: string;
  /** Optional timestamp string for when the activity occurred */
  time?: string;
}

/**
 * ENTERPRISE: Time Data Types
 * Optimized for performance and type safety
 */

/**
 * Legacy weekly time data interface (maintained for backward compatibility)
 * @interface WeeklyTimeData
 * @deprecated Use DailyLearningTime instead
 */
export interface WeeklyTimeData {
  /** Week identifier string */
  week: string;
  /** Learning hours for the week */
  hours: number;
}

/**
 * Represents daily learning time data with enhanced metadata
 * @interface DailyLearningTime
 */
export interface DailyLearningTime {
  /** Short day name (e.g., "Mon", "Tue") */
  day: string;
  /** Full formatted date string */
  fullDate: string;
  /** Total learning minutes for the day (null for future days) */
  totalMinutes: number | null;
  /** Flag indicating if this is today's data */
  isToday: boolean;
}

/**
 * Represents learning statistics with trend information
 * @interface LearningStat
 */
export interface LearningStat {
  /** Statistic title/label */
  title: string;
  /** Statistic value (number or formatted string) */
  value: number | string;
  /** Trend indicator string */
  trend: string;
  /** Optional navigation link */
  link?: string;
}

/**
 * ENTERPRISE: Card Component Props
 * Optimized React component prop interfaces
 */

/**
 * Base card component properties
 * @interface CardProps
 */
export interface CardProps {
  /** Child React elements */
  children: React.ReactNode;
  /** Optional CSS class names */
  className?: string;
}

/**
 * Card header component properties
 * @interface CardHeaderProps
 */
export interface CardHeaderProps {
  /** Child React elements */
  children: React.ReactNode;
}

/**
 * Card title component properties
 * @interface CardTitleProps
 */
export interface CardTitleProps {
  /** Child React elements */
  children: React.ReactNode;
  /** Optional CSS class names */
  className?: string;
}

/**
 * Card content component properties
 * @interface CardContentProps
 */
export interface CardContentProps {
  /** Child React elements */
  children: React.ReactNode;
  /** Optional CSS class names */
  className?: string;
}

/**
 * ENTERPRISE: Feature Component Props
 * Performance-optimized props interfaces for dashboard sections
 */

/**
 * Active courses section component properties
 * @interface ActiveCoursesProps
 */
export interface ActiveCoursesProps {
  /** Array of course data */
  courses: Course[];
  /** Optional loading state indicator */
  isLoading?: boolean;
}

/**
 * Recent activities section component properties
 * @interface RecentActivitiesProps
 */
export interface RecentActivitiesProps {
  /** Array of activity data */
  activities: Activity[];
  /** Optional loading state indicator */
  isLoading?: boolean;
}

/**
 * Learning activity chart component properties
 * @interface LearningActivityChartProps
 */
export interface LearningActivityChartProps {
  /** Array of daily learning time data */
  data: DailyLearningTime[];
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * ENTERPRISE: Legacy Chart Props
 * Maintained for backward compatibility
 */

/**
 * Legacy learning activity chart properties
 * @interface LearningActivityChartPropsLegacy
 * @deprecated Use LearningActivityChartProps instead
 */
export interface LearningActivityChartPropsLegacy {
  /** Legacy weekly time data */
  data: WeeklyTimeData[];
}

/**
 * Recent achievements component properties
 * @interface RecentAchievementsProps
 */
export interface RecentAchievementsProps {
  /** Array of earned badges */
  badges: Array<{
    /** Badge icon React element */
    icon: React.ReactNode;
    /** Badge name/title */
    name: string;
    /** Badge color theme */
    color: string;
  }>;
  /** Array of next available badges */
  nextBadges: Array<{
    /** Badge name/title */
    name: string;
    /** Progress towards earning (0-100) */
    progress: number;
  }>;
}

/**
 * ENTERPRISE: Type Guards and Utilities
 * Performance-optimized type checking functions
 */

/**
 * Type guard to check if an object is a valid Course
 * @param obj - Object to check
 * @returns True if object is a valid Course
 */
export const isCourse = (obj: any): obj is Course => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.progress === 'number' &&
    obj.progress >= 0 &&
    obj.progress <= 100
  );
};

/**
 * Type guard to check if an object is a valid Activity
 * @param obj - Object to check
 * @returns True if object is a valid Activity
 */
export const isActivity = (obj: any): obj is Activity => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.type === 'string' &&
    typeof obj.course === 'string' &&
    (obj.time === undefined || typeof obj.time === 'string')
  );
};

/**
 * Type guard to check if an object is valid DailyLearningTime
 * @param obj - Object to check
 * @returns True if object is valid DailyLearningTime
 */
export const isDailyLearningTime = (obj: any): obj is DailyLearningTime => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.day === 'string' &&
    typeof obj.fullDate === 'string' &&
    (obj.totalMinutes === null || typeof obj.totalMinutes === 'number') &&
    typeof obj.isToday === 'boolean'
  );
};

/**
 * ENTERPRISE: Constants and Enums
 * Performance-optimized constants for the dashboard
 */

/**
 * Dashboard loading states
 */
export const LoadingState = {
  INITIAL: 'initial',
  LOADING: 'loading',
  COMPLETE: 'complete',
  ERROR: 'error'
} as const;

export type LoadingStateType = typeof LoadingState[keyof typeof LoadingState];

/**
 * Dashboard refresh intervals (in milliseconds)
 */
export const RefreshIntervals = {
  COURSES: 5 * 60 * 1000,      // 5 minutes
  ACTIVITIES: 2 * 60 * 1000,   // 2 minutes
  CHART_DATA: 3 * 60 * 1000,   // 3 minutes
  USER_PROFILE: 10 * 60 * 1000  // 10 minutes
} as const;

/**
 * Cache keys for dashboard data
 */
export const CacheKeys = {
  USER_PROFILE: 'user_profile',
  ACTIVE_COURSES: 'active_courses',
  RECENT_ACTIVITIES: 'recent_activities',
  LEARNING_ACTIVITY: 'learning_activity'
} as const;