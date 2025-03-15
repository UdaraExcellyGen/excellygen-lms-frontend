export interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number | null;
}

export interface QuizDetails {
    title: string;
    bankSize: string;
    quizSize: string;
    duration: string;
}

export interface QuizBank {
    quizDetails: QuizDetails;
    questions: Question[];
    name: string;
    bankSize: number;
    quizSize: number;
    duration: number;
}