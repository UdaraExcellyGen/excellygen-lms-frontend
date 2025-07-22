// components/QuizList.tsx
import React from 'react';
import { QuizDto } from '../../../../../types/quiz.types';
import { BookCheck, Edit, Eye, Trash2 } from 'lucide-react'; // Added Eye icon for clarity

interface QuizListProps {
    quizzes?: QuizDto[];
    handleEditQuiz: () => void;
    handleRemoveQuiz: () => void;
    isPublished: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, handleEditQuiz, isPublished,handleRemoveQuiz }) => {
    return (
        <ul className="space-y-3">
            {quizzes?.map((quiz) => (
                <li
                    key={`quiz-${quiz.quizId}`}
                    className="flex items-center justify-between rounded-md p-3 shadow-sm bg-[#52007C]/20 shover:bg-[#52007C]/10 transition-colors duration-200"
                >
                    <div className="flex items-center min-w-0 flex-grow">
                        <BookCheck className="w-5 h-5 mr-3 text-[#1B0A3F]/80 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[#1B0A3F]/80 text-sm font-medium truncate">
                                {quiz.quizTitle}
                            </p>
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                                Size: {quiz.quizSize} questions, Time: {quiz.timeLimitMinutes} mins
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-2">

                    {/* UPDATED: Button is no longer disabled. It will navigate to a view or edit page. */}
                    <button
                        onClick={handleEditQuiz}
                        className="p-1 rounded-full text-gray-600 hover:text-gray-500 transition-colors duration-200 ml-2 flex-shrink-0"
                        aria-label={isPublished ? `View quiz ${quiz.quizTitle}` : `Edit quiz ${quiz.quizTitle}`}
                    >
                        {/* Show a different icon based on the mode for better UX */}
                        {isPublished ? <Eye size={16} /> : <Edit size={16} />}
                    </button>
                    {!isPublished && (
                            <button
                                onClick={handleRemoveQuiz}
                                className="p-1 rounded-full text-red-500 hover:text-red-400 transition-colors duration-200"
                                aria-label={`Delete quiz ${quiz.quizTitle}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default QuizList;