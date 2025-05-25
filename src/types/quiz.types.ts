// src/types/quiz.types.ts

// Backend DTOs mapped to TypeScript interfaces

export interface QuizDto {
    quizId: number;
    quizTitle: string;
    timeLimitMinutes: number;
    totalMarks: number;
    quizSize: number;
    quizBankId: number;
    lessonId: number;
    lessonName: string;
}

export interface QuizDetailDto extends QuizDto {
    questions: QuizBankQuestionDto[];
}

export interface QuizBankDto {
    quizBankId: number;
    quizBankSize: number;
    questions: QuizBankQuestionDto[];
}

export interface QuizBankQuestionDto {
    quizBankQuestionId: number;
    questionContent: string;
    questionType: string; // e.g., "mcq"
    questionBankOrder: number | null;
    options: MCQQuestionOptionDto[];
}

export interface MCQQuestionOptionDto {
    mcqOptionId: number;
    optionText: string;
    isCorrect: boolean;
}

export interface LearnerQuizQuestionDto {
    quizBankQuestionId: number;
    questionContent: string;
    questionType: string;
    options: LearnerMCQOptionDto[];
}

export interface LearnerMCQOptionDto {
    mcqOptionId: number;
    optionText: string;
    // IsCorrect is deliberately omitted for learner view
}

// Payloads for quiz creation/update (match backend DTOs)

export interface CreateQuizDto {
    quizTitle: string;
    timeLimitMinutes: number;
    quizSize: number;
    lessonId: number;
}

export interface CreateQuizBankDto {
    quizBankSize: number;
    questions?: CreateQuizBankQuestionDto[];
}

export interface CreateQuizBankQuestionDto {
    questionContent: string;
    options: CreateMCQOptionDto[];
    questionBankOrder?: number | null;
}

export interface CreateMCQOptionDto {
    optionText: string;
    isCorrect: boolean;
}

export interface UpdateQuizBankQuestionDto {
    questionContent?: string;
    options?: CreateMCQOptionDto[];
    questionBankOrder?: number | null;
}

// Quiz attempt DTOs

export interface QuizAttemptDto {
    quizAttemptId: number;
    quizId: number;
    quizTitle: string;
    startTime: string; // ISO 8601 string
    completionTime: string | null; // ISO 8601 string
    score: number | null;
    isCompleted: boolean;
    totalQuestions: number;
    correctAnswers: number;
}

export interface QuizAttemptDetailDto extends QuizAttemptDto {
    answers: QuizAttemptAnswerDto[];
}

export interface QuizAttemptAnswerDto {
    quizAttemptAnswerId: number;
    quizBankQuestionId: number;
    questionContent: string;
    selectedOptionId: number | null;
    selectedOptionText: string;
    isCorrect: boolean;
    correctOptionText: string;
}

export interface StartQuizAttemptDto {
    quizId: number;
}

export interface SubmitQuizAnswerDto {
    quizAttemptId: number;
    quizBankQuestionId: number;
    selectedOptionId: number;
}

export interface CompleteQuizAttemptDto {
    quizAttemptId: number;
}