import React from 'react';

interface QuestionTextProps {
    text: string;
}

const QuestionText: React.FC<QuestionTextProps> = ({ text }) => {
    return (
        <div className="question-text bg-white border border-indigo-200 rounded-lg p-6 mb-6 shadow-sm">
            <p className="text-gray-800 text-lg">{text}</p>
        </div>
    );
};

export default QuestionText;