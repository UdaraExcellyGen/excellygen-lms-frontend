// src/features/Coordinator/Analytics/types/analytics.ts

// Enhanced enrollment data with category and status information
export type ApiEnrollmentData = {
  courseId: number;
  course: string; // Full course name
  shortCourseName: string; // Truncated version for display
  categoryId: string; // String to match backend
  categoryName: string;
  totalEnrollments: number;
  ongoingEnrollments: number;
  completedEnrollments: number;
  coordinatorId: string;
  coordinatorName: string;
};

// Course category for filtering
export type ApiCourseCategory = {
  id: string; // String to match backend
  name: string;
  description: string;
  totalCourses: number;
  totalEnrollments: number;
};

// Enrollment status filter options
export enum EnrollmentStatus {
  ALL = 'all',
  ONGOING = 'ongoing', 
  COMPLETED = 'completed'
}

// Enhanced coordinator course data
export type ApiCoordinatorCourse = {
  courseId: number;
  courseTitle: string;
  shortTitle: string; // Truncated for display
  categoryId: string; // String to match backend
  categoryName: string;
  totalEnrollments: number;
  ongoingEnrollments: number;
  completedEnrollments: number;
  isCreatedByCurrentCoordinator: boolean;
};

// Quiz data remains similar but enhanced
export type ApiCourseQuiz = {
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
  totalAttempts: number;
  averageScore: number;
  isCreatedByCurrentCoordinator: boolean;
};

// Enhanced mark range data with better intervals
export type ApiMarkRangeData = {
  range: string; // e.g., "0-20", "21-40", "41-60", "61-80", "81-100"
  minMark: number;
  maxMark: number;
  count: number;
  percentage: number; // Percentage of total students
};

// Filter state management
export interface AnalyticsFilters {
  selectedCategoryId: string | null; // String to match backend
  enrollmentStatus: EnrollmentStatus;
  selectedCourseId: number | null;
  selectedQuizId: number | null;
}

// Component Props
export interface HeaderProps {
  title: string;
  subtitle: string;
  onBackClick: () => void;
}

export interface EnrollmentChartProps {
  data: ProcessedEnrollmentData[]; // Updated to use processed data
  categories: ApiCourseCategory[];
  selectedCategoryId: string | null; // String to match backend
  enrollmentStatus: EnrollmentStatus;
  onCategoryChange: (categoryId: string | null) => void;
  onStatusChange: (status: EnrollmentStatus) => void;
  loading?: boolean;
}

export interface QuizPerformanceProps {
  availableCourses: ApiCoordinatorCourse[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number) => void;
  availableQuizzes: ApiCourseQuiz[];
  selectedQuizId: number | null;
  onQuizChange: (quizId: number) => void;
  performanceData: ApiMarkRangeData[];
  loading?: boolean;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Chart data processing types
export type ProcessedEnrollmentData = {
  course: string;
  fullCourseName: string;
  count: number;
  categoryName: string;
  status: string;
  coordinatorName: string;
  courseId: number;
};

export type ProcessedQuizData = {
  range: string;
  count: number;
  percentage: number;
  minMark: number;
  maxMark: number;
};

// API Response types for new endpoints
export interface EnrollmentAnalyticsResponse {
  enrollments: ApiEnrollmentData[];
  categories: ApiCourseCategory[];
  totalStats: {
    totalCourses: number;
    totalEnrollments: number;
    totalOngoing: number;
    totalCompleted: number;
  };
}

export interface QuizPerformanceResponse {
  performanceData: ApiMarkRangeData[];
  quizStats: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
}