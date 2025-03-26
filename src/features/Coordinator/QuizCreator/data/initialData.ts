import { Question, QuizDetails } from '../types/types';

export const initialQuestion: Question = {
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null as number | null,
};

export const initialQuizDetails: QuizDetails = {
    title: '',
    bankSize: '20',
    quizSize: '10',
    duration: '15'
};