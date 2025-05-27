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

export interface QuizDetails {
    title: string;
    bankSize: string;
    quizSize: string;
    duration: string;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number | null;
    correctAnswer?: string;
}

export interface QuizBank {
    quizDetails: QuizDetails;
    questions: Question[];
    name: string;
    bankSize: number;
    quizSize: number;
    duration: number;
}