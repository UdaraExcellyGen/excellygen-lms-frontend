// src/features/Coordinator/QuizManagement/components/QuestionEditor.tsx
import React from 'react';
import { Save } from 'lucide-react';
import { QuizCreationState } from '../../../../../types/quiz.types';
import { QuestionNavigator } from './QuestionNavigator';
import { QuestionForm } from './QuestionForm';

interface QuestionEditorProps {
  quizState: QuizCreationState;
  isSaving: boolean;
  hasRequiredQuestions: boolean;
  onNavigateToQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: () => void;
  onQuestionContentChange: (content: string) => void;
  onOptionChange: (optionIndex: number, content: string) => void;
  onCorrectAnswerChange: (optionIndex: number) => void;
  onBackToDetails: () => void;
  onSaveQuiz: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  quizState,
  isSaving,
  hasRequiredQuestions,
  onNavigateToQuestion,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionContentChange,
  onOptionChange,
  onCorrectAnswerChange,
  onBackToDetails,
  onSaveQuiz
}) => {
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  return (
    <div>
      <QuestionNavigator
        questions={quizState.questions}
        currentIndex={quizState.currentQuestionIndex}
        bankSize={quizState.quizBankSize}
        onNavigate={onNavigateToQuestion}
        onAdd={onAddQuestion}
      />

      {currentQuestion && (
        <QuestionForm
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          onContentChange={onQuestionContentChange}
          onOptionChange={onOptionChange}
          onCorrectAnswerChange={onCorrectAnswerChange}
          onRemove={onRemoveQuestion}
          canRemove={quizState.questions.length > 1}
        />
      )}

      <div className="flex justify-between mt-4">
        <button onClick={onBackToDetails} className="px-5 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white transition-colors">Back to Details</button>
        <button onClick={onSaveQuiz} className={`px-5 py-2 ${hasRequiredQuestions ? 'c' : 'bg-gray-500 cursor-not-allowed'} px-5 py-2.5 bg-[#52007C] text-white rounded-lg hover:bg-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors flex items-center gap-2`} disabled={isSaving || !hasRequiredQuestions}>
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </div>
  );
};