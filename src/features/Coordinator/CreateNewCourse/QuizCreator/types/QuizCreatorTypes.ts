// features/createNewCourse/QuizCreator/QuizCreatorTypes.ts
import { QuizBank as QuizBankType } from '../types/quiz';
import { Question as QuestionType } from '../types/quiz';
import { QuizDetails as QuizDetailsType } from '../types/quiz';


export type Question = QuestionType;
export type QuizDetails = QuizDetailsType;
export type QuizBank = QuizBankType;

export interface QuizCreatorProps {
    subtopicId: string;
    onSaveQuiz: (subtopicId: string, quizBankData: QuizBank) => void;
    onCancelQuizCreator: () => void;
    editableQuizBankForOverview?: QuizBank | undefined;
    onCloseQuizOverview: () => void;
    onSaveOverviewQuizDetails: (subtopicId: string, updatedQuizBank: QuizBank) => void;
}