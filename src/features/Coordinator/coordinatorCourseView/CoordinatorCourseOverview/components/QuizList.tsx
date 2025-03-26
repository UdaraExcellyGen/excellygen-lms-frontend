// components/QuizList.tsx
import React from 'react';
import { QuizDetails } from '../types';
import { BookCheck, Edit } from 'lucide-react';

interface QuizListProps {
    quizzes?: QuizDetails[];
    handleEditQuiz: (subtopic: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, handleEditQuiz }) => {
    return (
        <>
            {quizzes?.map((quiz, index) => (
                <div
                    key={`quiz-${index}`}
                    className="bg-[#1B0A3F]/60 rounded-lg p-2 sm:p-4 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300 quiz-overview-item"
                >
                    <div className="flex items-center min-w-0">
                        <BookCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D68BF9] flex-shrink-0" />
                        <div className="text-left min-w-0">
                            <p className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito text-xs sm:text-sm truncate quiz-overview-title">
                                {quiz.title}
                            </p>
                            <p className="text-xs sm:text-sm text-[#D68BF9] font-nunito truncate quiz-overview-details">
                                Bank: {quiz.bankSize}, Size: {quiz.quizSize}, Time: {quiz.duration}m
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleEditQuiz(quiz.subtopic)}
                        className="hover:text-[#D68BF9] transition-colors flex-shrink-0 ml-2 quiz-overview-edit-button"
                        aria-label={`Edit quiz ${quiz.title}`}
                    >
                        <Edit className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 hover:text-[#D68BF9]" />
                    </button>
                </div>
            ))}
        </>
    );
};

export default QuizList;