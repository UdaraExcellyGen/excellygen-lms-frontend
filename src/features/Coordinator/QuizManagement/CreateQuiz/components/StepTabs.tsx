// src/features/Coordinator/QuizManagement/components/StepTabs.tsx
import React from 'react';

interface StepTabsProps {
  currentStep: 'details' | 'questions';
  onStepChange: (step: 'details' | 'questions') => void;
  questionCount: number;
  quizBankSize: number;
}

export const StepTabs: React.FC<StepTabsProps> = ({ currentStep, onStepChange, questionCount, quizBankSize }) => (
  <div className="flex mb-4">
    <button
      className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${currentStep === 'details' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`}
      onClick={() => onStepChange('details')}
    >
      Quiz Details
    </button>
    <button
      className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${currentStep === 'questions' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`}
      onClick={() => onStepChange('questions')}
    >
      Questions ({questionCount}/{quizBankSize})
    </button>
  </div>
);