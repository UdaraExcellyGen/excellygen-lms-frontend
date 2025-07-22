// src/features/Coordinator/QuizManagement/components/QuestionNavigator.tsx
import React from 'react';
import { Plus } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: any[];
  currentIndex: number;
  bankSize: number;
  onNavigate: (index: number) => void;
  onAdd: () => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({ questions, currentIndex, bankSize, onNavigate, onAdd }) => {
  const hasRequiredQuestions = questions.length === bankSize;

  return (
    <div className="flex mb-4 flex-wrap gap-2 items-center">
      {questions.map((_, index) => (
        <button key={index} onClick={() => onNavigate(index)} className={`w-10 h-10 rounded-full flex items-center justify-center ${currentIndex === index ? 'bg-[#D68BF9] text-white/90' : 'bg-[#34137C] text-white/90'}`}>{index + 1}</button>
      ))}
      {!hasRequiredQuestions && (
        <button onClick={onAdd} className="w-10 h-10 rounded-full bg-[#34137C] text-white/90 flex items-center justify-center" title="Add new question"><Plus size={16} /></button>
      )}
    </div>
  );
};