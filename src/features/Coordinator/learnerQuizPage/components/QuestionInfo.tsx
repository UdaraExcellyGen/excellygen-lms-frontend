import React from 'react';

interface QuestionInfoProps {
    questionNumber: number;
}

const QuestionInfo: React.FC<QuestionInfoProps> = ({ questionNumber }) => {
    return (
        <div className="question-info mb-6">
            <div className="question-number font-semibold text-xl mb-2 text-indigo-700">Question {questionNumber}</div>
        </div>
    );
};

export default QuestionInfo;