// src/types/analytics.ts

export type ApiEnrollmentData = {
  course: string; // Matches DTO: courseTitle mapped to 'course'
  count: number;  // Matches DTO: enrollmentCount mapped to 'count'
};

export type ApiCoordinatorCourse = {
  courseId: number;
  courseTitle: string;
};

export type ApiCourseQuiz = {
  quizId: number;
  quizTitle: string;
};

export type ApiMarkRangeData = {
  range: string; 
  count: number;
};

// Props for components might need to be adjusted
export interface HeaderProps {
  title: string;
  subtitle: string;
  onBackClick: () => void;
}

export interface EnrollmentChartProps {
  data: ApiEnrollmentData[]; 
}

export interface QuizPerformanceProps {
  availableCourses: ApiCoordinatorCourse[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number) => void;

  availableQuizzes: ApiCourseQuiz[];
  selectedQuizId: number | null;
  onQuizChange: (quizId: number) => void;

  performanceData: ApiMarkRangeData[]; // Data for the barchart
  
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}


export type EnrollmentDataType = { 
  course: string;
  count: number;
}[];

export type QuizRangeData = { 
  range: string;
  count: number;
};

export type QuizDataType = { 
  [course: string]: {
    [quiz: string]: QuizRangeData[];
  };
};