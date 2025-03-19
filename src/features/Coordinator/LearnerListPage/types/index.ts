// types/index.ts
export interface Student {
    id: number;
    name: string;
}

export interface Course {
    title: string;
    students: Student[];
}