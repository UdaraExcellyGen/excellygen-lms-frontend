import { Course } from '../types/Course';

export const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Software Engineering',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Software Engineering',
    activeUsers: 450,
    description: 'Learn the fundamentals of software engineering and development practices'
  },
  {
    id: '2',
    title: 'Data Structures and Algorithms',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'Software Engineering',
    activeUsers: 380,
    description: 'Master essential programming concepts and problem-solving techniques'
  },
  {
    id: '3',
    title: 'Advanced Frontend Development',
    duration: '10 weeks',
    level: 'Advanced',
    category: 'Software Engineering',
    activeUsers: 290,
    description: 'Master modern frontend frameworks and advanced web development'
  }
];

export const initialEnrolledCourses: Course[] = [
  {
    id: '4',
    title: 'Web Development Fundamentals',
    duration: '8 weeks',
    level: 'Beginner',
    enrolled: true,
    progress: 75,
    category: 'Software Engineering',
    activeUsers: 450,
    description: 'Learn the basics of web development with HTML, CSS, and JavaScript'
  }
];

export const validPaths = [
  'Software Engineering',
  'Quality Assurance',
  'Project Management',
  'DevOps',
  'UI/UX Design',
  'Data Science',
  'Cloud Computing',
  'Cyber Security'
];