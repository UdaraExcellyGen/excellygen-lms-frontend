// // src/types/quiz.types.ts

// export interface QuizDto {
//   quizId: number;
//   quizTitle: string;
//   timeLimitMinutes: number;
//   totalMarks: number;
//   quizSize: number;
//   quizBankId: number;
//   lessonId: number;
//   lessonName?: string; // Optional since backend might not always include it
// }

// export interface QuizDetailDto {
//   quizId: number;
//   quizTitle: string;
//   timeLimitMinutes: number;
//   totalMarks: number;
//   quizSize: number;
//   quizBankId: number;
//   lessonId: number;
//   lessonName?: string;
//   questions: QuizBankQuestionDto[];
// }

// export interface QuizBankDto {
//   quizBankId: number;
//   quizBankSize: number;
//   questions: QuizBankQuestionDto[];
// }

// export interface QuizBankQuestionDto {
//   quizBankQuestionId: number;
//   questionContent: string;
//   questionType: string;
//   questionBankOrder?: number; // Optional since it can be null
//   options: MCQQuestionOptionDto[];
// }

// export interface MCQQuestionOptionDto {
//   mcqOptionId: number;
//   optionText: string;
//   isCorrect: boolean;
// }

// // FIXED: Renamed to match backend exactly
// export interface LearnerQuizQuestionDto {
//   quizBankQuestionId: number;
//   questionContent: string;
//   questionType: string;
//   options: LearnerMCQOptionDto[];
// }

// // FIXED: Renamed to match backend exactly
// export interface LearnerMCQOptionDto {
//   mcqOptionId: number;
//   optionText: string;
//   // IsCorrect is deliberately omitted for learner view
// }

// // DTOs for Quiz Attempts
// export interface QuizAttemptDto {
//   quizAttemptId: number;
//   quizId: number;
//   quizTitle: string;
//   startTime: string;
//   completionTime?: string | null;
//   score?: number | null;
//   isCompleted: boolean;
//   totalQuestions: number;
//   correctAnswers: number;
// }

// export interface QuizAttemptDetailDto {
//   quizAttemptId: number;
//   quizId: number;
//   quizTitle: string;
//   startTime: string;
//   completionTime?: string | null;
//   score?: number | null;
//   isCompleted: boolean;
//   totalQuestions: number;
//   correctAnswers: number;
//   answers: QuizAttemptAnswerDto[];
// }

// export interface QuizAttemptAnswerDto {
//   quizAttemptAnswerId: number;
//   quizAttemptId: number;
//   quizBankQuestionId: number;
//   questionContent: string;
//   selectedOptionId?: number | null;
//   selectedOptionText?: string | null;
//   correctOptionId: number;
//   correctOptionText: string;
//   isCorrect: boolean;
// }

// // Request Payloads
// export interface CreateQuizDto {
//   quizTitle: string;
//   timeLimitMinutes: number;
//   quizSize: number;
//   lessonId: number;
// }

// export interface CreateQuizBankDto {
//   quizBankSize: number;
//   questions?: CreateQuizBankQuestionDto[]; // Optional since questions can be added separately
// }

// export interface CreateQuizBankQuestionDto {
//   questionContent: string;
//   questionType?: string; // Optional, defaults to "mcq"
//   questionBankOrder?: number; // Optional
//   options: (CreateMCQOptionDto & { mcqOptionId?: number })[];
// }

// export interface CreateMCQOptionDto {
//   optionText: string;
//   isCorrect: boolean;
// }

// export interface UpdateQuizBankQuestionDto {
//   questionContent?: string; // Optional for partial updates
//   options?: UpdateMCQOptionDto[]; // Optional for partial updates
//   questionBankOrder?: number; // Optional
// }

// export interface UpdateMCQOptionDto {
//   mcqOptionId?: number; // Optional for new options
//   optionText: string;
//   isCorrect: boolean;
// }

// export interface StartQuizAttemptDto {
//   quizId: number;
// }

// export interface SubmitQuizAnswerDto {
//   quizAttemptId: number;
//   quizBankQuestionId: number;
//   selectedOptionId: number;
// }

// export interface CompleteQuizAttemptDto {
//   quizAttemptId: number;
// }

// // Frontend-specific state types for UI management
// export interface QuizCreationState {
//   quizTitle: string;
//   timeLimitMinutes: number;
//   quizSize: number;
//   quizBankSize: number;
//   questions: (CreateQuizBankQuestionDto & { questionBankQuestionId?: number })[];
//   currentQuestionIndex: number;
//   lessonId: number;
// }

// export interface ActiveQuizState {
//   quizId: number;
//   quizTitle: string;
//   timeLimitMinutes: number;
//   attemptId: number;
//   questions: LearnerQuizQuestionDto[];
//   currentQuestionIndex: number;
//   selectedAnswers: Record<number, number>; // questionId -> optionId
//   startTime: Date;
//   timeRemaining: number; // in seconds
//   isCompleted: boolean;
// }

// export interface QuizBank {
//     id: number; // Corresponds to quizId
//     title: string;
//     description: string;
//     questions: QuizBankQuestionDto[]; // Array of questions
//     timeLimitMinutes: number;
//     totalMarks: number;
//     lessonId: number;
// }

// src/types/quiz.types.ts

export interface QuizDto {
  quizId: number;
  quizTitle: string;
  timeLimitMinutes: number;
  totalMarks: number;
  quizSize: number;
  quizBankId: number;
  lessonId: number;
  lessonName?: string; // Optional since backend might not always include it
}

export interface QuizDetailDto {
  quizId: number;
  quizTitle: string;
  timeLimitMinutes: number;
  totalMarks: number;
  quizSize: number;
  quizBankId: number;
  lessonId: number;
  lessonName?: string;
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
  questionType: string;
  questionBankOrder?: number; // Optional since it can be null
  options: MCQQuestionOptionDto[];
}

export interface MCQQuestionOptionDto {
  mcqOptionId: number;
  optionText: string;
  isCorrect: boolean;
}

// FIXED: Renamed to match backend exactly
export interface LearnerQuizQuestionDto {
  quizBankQuestionId: number;
  questionContent: string;
  questionType: string;
  options: LearnerMCQOptionDto[];
}

// FIXED: Renamed to match backend exactly
export interface LearnerMCQOptionDto {
  mcqOptionId: number;
  optionText: string;
  // IsCorrect is deliberately omitted for learner view
}

// DTOs for Quiz Attempts
export interface QuizAttemptDto {
  quizAttemptId: number;
  quizId: number;
  quizTitle: string;
  timeLimitMinutes: number; // ADDED: To get time limit on start
  startTime: string;
  completionTime?: string | null;
  score?: number | null;
  isCompleted: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeRemainingSeconds?: number; // ADDED: For resuming quizzes accurately
  selectedAnswers?: Record<number, number>; // ADDED: For resuming with previous answers
}

export interface QuizAttemptDetailDto {
  quizAttemptId: number;
  quizId: number;
  quizTitle: string;
  startTime: string;
  completionTime?: string | null;
  score?: number | null;
  isCompleted: boolean;
  totalQuestions: number;
  correctAnswers: number;
  answers: QuizAttemptAnswerDto[];
}

export interface QuizAttemptAnswerDto {
  quizAttemptAnswerId: number;
  quizAttemptId: number;
  quizBankQuestionId: number;
  questionContent: string;
  selectedOptionId?: number | null;
  selectedOptionText?: string | null;
  correctOptionId: number;
  correctOptionText: string;
  isCorrect: boolean;
}

// Request Payloads
export interface CreateQuizDto {
  quizTitle: string;
  timeLimitMinutes: number;
  quizSize: number;
  lessonId: number;
}

export interface CreateQuizBankDto {
  quizBankSize: number;
  questions?: CreateQuizBankQuestionDto[]; // Optional since questions can be added separately
}

export interface CreateQuizBankQuestionDto {
  questionContent: string;
  questionType?: string; // Optional, defaults to "mcq"
  questionBankOrder?: number; // Optional
  options: (CreateMCQOptionDto & { mcqOptionId?: number })[];
}

export interface CreateMCQOptionDto {
  optionText: string;
  isCorrect: boolean;
}

export interface UpdateQuizBankQuestionDto {
  questionContent?: string; // Optional for partial updates
  options?: UpdateMCQOptionDto[]; // Optional for partial updates
  questionBankOrder?: number; // Optional
}

export interface UpdateMCQOptionDto {
  mcqOptionId?: number; // Optional for new options
  optionText: string;
  isCorrect: boolean;
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

// Frontend-specific state types for UI management
export interface QuizCreationState {
  quizTitle: string;
  timeLimitMinutes: number;
  quizSize: number;
  quizBankSize: number;
  questions: (CreateQuizBankQuestionDto & { questionBankQuestionId?: number })[];
  currentQuestionIndex: number;
  lessonId: number;
}

export interface ActiveQuizState {
  quizId: number;
  quizTitle: string;
  timeLimitMinutes: number;
  attemptId: number;
  questions: LearnerQuizQuestionDto[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>; // questionId -> optionId
  startTime: Date;
  timeRemaining: number; // in seconds
  isCompleted: boolean;
}

export interface QuizBank {
    id: number; // Corresponds to quizId
    title: string;
    description: string;
    questions: QuizBankQuestionDto[]; // Array of questions
    timeLimitMinutes: number;
    totalMarks: number;
    lessonId: number;
}
