// src/features/Coordinator/QuizManagement/components/QuestionForm.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { CreateQuizBankQuestionDto } from '../../../../../types/quiz.types';

interface QuestionFormProps {
  question: CreateQuizBankQuestionDto;
  questionNumber: number;
  onContentChange: (content: string) => void;
  onOptionChange: (optionIndex: number, text: string) => void;
  onCorrectAnswerChange: (optionIndex: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  questionNumber,
  onContentChange,
  onOptionChange,
  onCorrectAnswerChange,
  onRemove,
  canRemove
}) => (
  <div className="border border-[#52007C] rounded-lg p-6 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-[#1B0A3F] font-semibold">Question {questionNumber}</h3>
      <button onClick={onRemove} className="text-red-400 hover:text-red-500" disabled={!canRemove} title="Remove this question"><Trash2 size={16} /></button>
    </div>
    <div className="mb-4">
      <label className="block text-[#1B0A3F] mb-2">Question Content</label>
      <textarea value={question.questionContent} onChange={(e) => onContentChange(e.target.value)} className="w-full p-3 rounded-lg text-[#1B0A3F] border border-[#52007C]" rows={3} placeholder="Enter your question here" />
    </div>
    <div className="space-y-3">
      <label className="block text-[#1B0A3F] mb-2">Answer Options (select the correct one)</label>
      {question.options.map((option, optionIndex) => (
        <div key={optionIndex} className="flex items-center gap-2">
          <button type="button" onClick={() => onCorrectAnswerChange(optionIndex)} className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center border ${option.isCorrect ? 'bg-[#52007C] border-[#52007C] text-white' : 'border-[#BF4BF6]/50 bg-transparent'}`}>{option.isCorrect && '✓'}</button>
          <input type="text" value={option.optionText} onChange={(e) => onOptionChange(optionIndex, e.target.value)} className="flex-1 p-2 rounded-lg text-[#1B0A3F] border border-[#52007C]" placeholder={`Option ${optionIndex + 1}`} />
        </div>
      ))}
    </div>
  </div>
);