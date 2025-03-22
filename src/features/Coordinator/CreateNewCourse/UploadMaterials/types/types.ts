// components/types.ts
export interface MaterialFile {
    id: string;
    name: string;
    type: 'document' | 'video' | 'quiz';
    file: File | null;
    videoLink?: string;
    quizId?: string;
}

export interface Subtopic {
    id: string;
    title: string;
    materials: MaterialFile[];
    hasQuiz: boolean;
    quizBank?: QuizBank | null;
    subtopicPoints: number;
}

export interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface QuizDetails {
    title: string;
    description?: string;
}

export interface QuizBank {
    quizDetails: QuizDetails;
    questions: Question[];
    name: string;
}