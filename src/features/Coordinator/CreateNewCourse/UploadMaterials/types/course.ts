import { QuizBank } from './quiz';

export interface MaterialFile {
    id: string;
    name: string;
    type: 'document' | 'video';
    file: File | null;
    videoLink?: string;
}

export interface Subtopic {
    id: string;
    title: string;
    materials: MaterialFile[];
    hasQuiz: boolean;
    quizBank?: QuizBank | null;
    subtopicPoints: number;
}