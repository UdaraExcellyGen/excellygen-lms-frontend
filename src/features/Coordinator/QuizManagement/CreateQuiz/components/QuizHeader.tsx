// src/features/Coordinator/QuizManagement/components/QuizHeader.tsx
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface QuizHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({ onBack, onSave, isSaving, canSave }) => (
  <div className="bg-white/90 rounded-xl p-4 mb-6 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
      >
        <ArrowLeft size={20} className="text-[#1B0A3F]" />
      </button>
      <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">Create Quiz</h1>
    </div>
    <div className="flex gap-2">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-[#52007C] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2"
        disabled={isSaving || !canSave}
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Quiz'}
      </button>
    </div>
  </div>
);