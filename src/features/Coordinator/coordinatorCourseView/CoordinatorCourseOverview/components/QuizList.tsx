// components/QuizList.tsx
import React from 'react';
import { QuizDto } from '../../../../../types/quiz.types';
import { BookCheck, Edit } from 'lucide-react';

interface QuizListProps {
    quizzes?: QuizDto[];
    handleEditQuiz: () => void;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, handleEditQuiz }) => {
    return (
        <ul className="space-y-3">
            {quizzes?.map((quiz) => (
                <li
                    key={`quiz-${quiz.quizId}`}
                    className="flex items-center justify-between bg-[#1B0A3F]/70 rounded-md p-3 shadow-sm hover:bg-[#1B0A3F]/90 transition-colors duration-200"
                >
                    <div className="flex items-center min-w-0 flex-grow">
                        <BookCheck className="w-5 h-5 mr-3 text-[#D68BF9] flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                                {quiz.quizTitle}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                Size: {quiz.quizSize} questions, Time: {quiz.timeLimitMinutes} mins
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleEditQuiz}
                        className="p-1 rounded-full text-gray-400 hover:text-[#D68BF9] transition-colors duration-200 ml-2 flex-shrink-0"
                        aria-label={`Edit quiz ${quiz.quizTitle}`}
                    >
                        <Edit size={16} />
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default QuizList;