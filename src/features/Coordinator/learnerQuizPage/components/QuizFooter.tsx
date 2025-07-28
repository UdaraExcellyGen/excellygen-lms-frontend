import React from 'react';

interface QuizFooterProps {
    onNextPage: () => void;
    disableNext: boolean;
    currentQuestionIndex: number;
    isAnswerChecked: boolean;
    onCheckAnswer: () => void;
}

const QuizFooter: React.FC<QuizFooterProps> = ({ onNextPage,  disableNext, isAnswerChecked, onCheckAnswer }) => {
    return (
        <footer className="quiz-footer p-6 border-t border-indigo-200 bg-[#52007C] flex justify-end items-center">
            {!isAnswerChecked ? (
                <button
                    className="next-page-button bg-indigo-200 hover:bg-indigo-300 text-white border-none py-3 px-5 rounded-md cursor-pointer font-medium  transition-colors duration-200"
                    onClick={onCheckAnswer}
                    disabled={disableNext}
                >
                    Check Answer
                </button>
            ) : (
                <button
                    className="next-page-button bg-indigo-200 hover:bg-indigo-300 text-white border-none py-3 px-5 rounded-md cursor-pointer font-medium transition-colors duration-200"
                    onClick={onNextPage}
                >
                    Next
                </button>
            )}
        </footer>
    );
};

export default QuizFooter;