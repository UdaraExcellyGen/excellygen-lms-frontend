// src/features/Coordinator/QuizManagement/components/QuizDetailsForm.tsx
import React from 'react';
import { QuizCreationState } from '../../../../../types/quiz.types';

interface QuizDetailsFormProps {
  quizState: Pick<QuizCreationState, 'quizTitle' | 'timeLimitMinutes' | 'quizSize' | 'quizBankSize'>;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
}

export const QuizDetailsForm: React.FC<QuizDetailsFormProps> = ({ quizState, errors, onInputChange, onContinue }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-[#1B0A3F] mb-2">Quiz Title</label>
      <input type="text" name="quizTitle" value={quizState.quizTitle} onChange={onInputChange} className={`w-full p-3 rounded-lg bg-white/90 text-[#1B0A3F] border ${errors.quizTitle ? 'border-red-500' : 'border-[#52007C]'}`} placeholder="Enter quiz title" />
      {errors.quizTitle && <p className="text-red-500 mt-1">{errors.quizTitle}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-[#1B0A3F] mb-2">Time Limit (minutes)</label>
        <input type="number" name="timeLimitMinutes" value={quizState.timeLimitMinutes} onChange={onInputChange} className={`w-full p-3 rounded-lg bg-white/90 text-[#1B0A3F] border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#52007C]'}`} min="1" max="180" />
        {errors.timeLimitMinutes && <p className="text-red-500 mt-1">{errors.timeLimitMinutes}</p>}
      </div>
      <div>
        <label className="block text-[#1B0A3F] mb-2">Quiz Size (questions shown)</label>
        <input type="number" name="quizSize" value={quizState.quizSize} onChange={onInputChange} className={`w-full p-3 rounded-lg bg-white/90 text-[#1B0A3F] border ${errors.quizSize ? 'border-red-500' : 'border-[#52007C]'}`} min="1" max="100" />
        {errors.quizSize && <p className="text-red-500 mt-1">{errors.quizSize}</p>}
      </div>
      <div>
        <label className="block text-[#1B0A3F] mb-2">Question Bank Size</label>
        <input type="number" name="quizBankSize" value={quizState.quizBankSize} onChange={onInputChange} className={`w-full p-3 rounded-lg bg-white/90 text-[#1B0A3F] border ${errors.quizBankSize ? 'border-red-500' : 'border-[#52007C]'}`} min={quizState.quizSize} />
        {errors.quizBankSize && <p className="text-red-500 mt-1">{errors.quizBankSize}</p>}
      </div>
    </div>
    <div className="bg-[#34137C]/80 rounded-lg p-4 border border-[#BF4BF6]/30 text-white">
      <h3 className="text-[#D68BF9] font-semibold mb-2">About Quiz Banks</h3>
      <p className="text-sm">The quiz bank lets you create a larger set of questions, from which a random subset will be chosen each time a learner takes the quiz.</p>
      <p className="text-sm mt-2"><strong>Note:</strong> You must create exactly the number of questions specified in the "Question Bank Size" field.</p>
    </div>
    <div className="flex justify-end mt-4">
      <button onClick={onContinue} className="px-5 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-colors">Continue to Questions</button>
    </div>
  </div>
);