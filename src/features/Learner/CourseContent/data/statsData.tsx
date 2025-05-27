import { BookOpen, Users, Clock } from 'lucide-react';

export const getStatsData = (availableCoursesCount: number, enrolledCoursesCount: number) => [
  { 
    icon: BookOpen, 
    label: 'Available Courses', 
    value: `${availableCoursesCount}+` 
  },
  { 
    icon: Users, 
    label: 'Enrolled Courses', 
    value: `${enrolledCoursesCount}` 
  },
  { 
    icon: Clock, 
    label: 'Avg. Duration', 
    value: '8 weeks' 
  }
];