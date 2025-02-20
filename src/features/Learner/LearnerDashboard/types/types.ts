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
  
  export interface WeeklyTimeData {
    week: string;
    hours: number;
  }
  
  export interface LearningStat {
    title: string;
    value: number | string;
    trend: string;
    link?: string;
  }
  
  // Props Types
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
  }
  
  export interface RecentActivitiesProps {
    activities: Activity[];
  }
  
  export interface LearningActivityChartProps {
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