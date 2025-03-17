
import React from 'react';
import { QuizBank } from '../types/quiz';
import { BookCheck, Edit, X } from 'lucide-react';

interface QuizOverviewDisplayProps {
    quizBank: QuizBank;
    onEditQuiz: () => void;
    onRemoveQuiz: () => void;
}

const QuizOverviewDisplay: React.FC<QuizOverviewDisplayProps> = ({ quizBank, onEditQuiz, onRemoveQuiz }) => {
    return (
        <div className="mt-2 mb-2">
            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Created Quiz:</p>
            <div className="rounded-lg p-3 flex-col items-start justify-between group bg-[#1B0A3F]/30" >
                <div className="flex items-center gap-2 w-full justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <BookCheck size={16} color="white" />
                        <div>
                            <span className="text-sm font-['Nunito_Sans'] text-white">{quizBank.name}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEditQuiz}
                            className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center">
                            <Edit size={14} color="white" className="group-hover:text-[#BF4BF6]" />
                        </button>
                        <button
                            onClick={onRemoveQuiz}
                            className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center">
                            <X size={14} color="white" className="group-hover:text-red-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizOverviewDisplay;