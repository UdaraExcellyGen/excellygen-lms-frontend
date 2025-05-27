// types/index.ts
export interface Material {
    type: 'document' | 'video';
    name: string;
    url: string;
    id: string;
    subtopic: string;
}

export interface QuizDetails {
    title: string;
    bankSize: number;
    quizSize: number;
    duration: number;
    subtopic: string;
    points: number;
    questions?: Question[];
}

export interface Question {
    questionText: string;
    questionType: string;
    options?: string[];
    correctAnswer?: string;
}

export interface CourseData {
    title?: string;
    description?: string;
    materials?: Material[];
    quizDetails?: QuizDetails[];
    questions?: Question[];
    deadline?: number;
    technologies?: string[];
}

export interface EditSubtopicData {
    name: string;
    points: number;
}