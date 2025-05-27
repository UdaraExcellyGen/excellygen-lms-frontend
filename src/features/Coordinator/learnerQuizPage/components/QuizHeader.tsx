import React from 'react';

interface QuizHeaderProps {
    timeLeft: string;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ timeLeft }) => {
    return (
        <header className="quiz-header p-6 border-b border-indigo-200 bg-[#52007C] text-white flex justify-end items-center">
            <div className="time-left bg-red-100 text-red-800 py-2 px-3 rounded font-medium text-sm">
                Time left {timeLeft}
            </div>
        </header>
    );
};

export default QuizHeader;