// data/courses.ts
import { Course } from '../types';

// Mock Course Data (as defined previously)
export const coursesWithStudents: Course[] = [
    {
        title: 'Introduction to React',
        students: [
            { id: 1, name: 'Alice Smith' },
            { id: 2, name: 'Bob Johnson' },
            { id: 3, name: 'Charlie Brown' },
        ],
    },
    {
        title: 'Advanced JavaScript Concepts',
        students: [
            { id: 4, name: 'Diana Miller' },
            { id: 5, name: 'Ethan Davis' },
            { id: 6, name: 'Fiona Wilson' },
            { id: 7, name: 'George White' },
        ],
    },
    {
        title: 'Node.js and Backend Development',
        students: [
            { id: 8, name: 'Hannah Moore' },
            { id: 9, name: 'Isaac Taylor' },
            { id: 10, name: 'Julia Anderson' },
            { id: 11, name: 'Kevin Clark' },
            { id: 12, name: 'Lily Baker' },
        ],
    },
    {
        title: 'Frontend Frameworks Bootcamp',
        students: [], // Course with no students enrolled for demonstration
    },
];