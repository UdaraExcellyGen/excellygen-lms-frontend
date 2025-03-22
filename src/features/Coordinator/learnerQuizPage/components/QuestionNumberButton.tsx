import React from 'react';

interface QuestionNumberButtonProps {
    number: number;
    isActive?: boolean;
    answerStatus: 'answered' | 'correct' | 'incorrect' | 'unanswered';
    onClick: (number: number) => void;
}

const QuestionNumberButton: React.FC<QuestionNumberButtonProps> = ({ number, isActive, answerStatus, onClick }) => {
    let buttonClassName = `question-number-button border border-indigo-200 bg-white py-2 px-3 rounded-md text-center cursor-pointer font-medium text-sm hover:bg-indigo-100 transition-colors duration-200 ${isActive ? 'bg-indigo-200' : ''}`;

    if (answerStatus === 'correct') {
        buttonClassName += ' bg-green-200 border-green-300 text-green-700 hover:bg-green-100';
    } else if (answerStatus === 'incorrect') {
        buttonClassName += ' bg-red-200 border-red-300 text-red-700 hover:bg-red-100';
    } else if (answerStatus === 'answered') {
        buttonClassName += ' bg-yellow-200 border-yellow-300 text-yellow-700 hover:bg-yellow-100';
    }

    return (
        <button
            className={buttonClassName}
            onClick={() => onClick(number)}
        >
            {number}
        </button>
    );
};

export default QuestionNumberButton;