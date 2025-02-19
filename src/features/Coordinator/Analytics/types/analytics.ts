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
  
  export interface HeaderProps {
    title: string;
    subtitle: string;
    onBackClick: () => void;
  }
  
  export interface EnrollmentChartProps {
    data: EnrollmentDataType;
  }
  
  export interface QuizPerformanceProps {
    quizData: QuizDataType;
    selectedCourse: string;
    selectedQuiz: string;
    onCourseChange: (course: string) => void;
    onQuizChange: (quiz: string) => void;
  }
  
  export interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }