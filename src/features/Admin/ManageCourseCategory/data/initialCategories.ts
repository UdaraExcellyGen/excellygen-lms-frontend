import { Category } from '../types/Category';

export const initialCategories: Category[] = [
  {
    id: '1',
    title: 'Software Engineering',
    description: 'Master modern software development practices',
    totalCourses: 8,
    icon: 'Code2',
    status: 'active'
  },
  {
    id: '2',
    title: 'Data Science',
    description: 'Learn data analysis and machine learning',
    totalCourses: 6,
    icon: 'Database',
    status: 'active'
  }
];