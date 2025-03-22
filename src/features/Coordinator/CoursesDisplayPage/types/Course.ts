// components/types/Course.ts
export interface CourseDetails {
    title: string;
    category: string;
    description: string;
    deadline: string;
    thumbnail: File | null;
    coordinatorPoints: string;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number | null;
    correctAnswers: string[];
}

export interface QuizDetails {
    title: string;
    bankSize: string;
    quizSize: string;
    duration: string;
}

export interface Course {
    id: string;
    title: string;
    category: string;
    description: string;
    deadline: string;
    thumbnailUrl: string | null;
    coordinatorPoints: string;
    materials: MaterialFile[];
    quizDetails: QuizDetails | null;
    questions: Question[];
    status: 'draft' | 'published';
    instructor: string;
    studentCount: number;
}

export interface MaterialFile {
    subtopicName: string;
    subtopicPoints: number;
    materials: Material[];
}

export interface Material {
    name: string;
    file?: File | null;
    link?: string;
}