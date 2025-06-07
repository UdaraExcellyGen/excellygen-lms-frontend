// LearnerListPage/types/index.ts
export interface Student {
    id: number; 
    name: string;
    userId: string; 
}

export interface Course {
    title: string;
    students: Student[];
}