import { Course, Activity, WeeklyTimeData, LearningStat } from '../types/types';

export const learningStats: LearningStat[] = [
  { title: 'Courses Completed', value: 12, trend: '+2 this month', link: '/completed-courses' },
  { title: 'Hours Spent', value: 156, trend: '14 this week' },
  { title: 'Certificates', value: 5, trend: '2 in progress', link: '/certificates' },
  { title: 'Average Score', value: '92%', trend: '+5% from last' }
];

export const courses: Course[] = [
  { id: 1, title: 'Advanced React Development', progress: 75 },
  { id: 2, title: 'Machine Learning Fundamentals', progress: 45 },
  { id: 3, title: 'Cloud Architecture', progress: 30 }
];

export const activities: Activity[] = [
  { id: 1, type: 'Quiz Completed', course: 'Advanced React Development' },
  { id: 2, type: 'Badge Earned', course: 'Machine Learning Fundamentals' },
  { id: 3, type: 'Course Started', course: 'Cloud Architecture' }
];

export const weeklyTimeData: WeeklyTimeData[] = [
  { week: 'Week 1', hours: 12 },
  { week: 'Week 2', hours: 8 },
  { week: 'Week 3', hours: 15 },
  { week: 'Week 4', hours: 10 },
  { week: 'Week 5', hours: 14 },
  { week: 'Week 6', hours: 9 },
];