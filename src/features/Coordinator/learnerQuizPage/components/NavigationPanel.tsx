import React from 'react';
import QuestionNumberButton from './QuestionNumberButton';

interface NavigationPanelProps {
    numQuestions: number;
    currentQuestionIndex: number;
    onQuestionButtonClick: (questionIndex: number) => void;
    answeredQuestionsStatus: { [key: number]: 'answered' | 'correct' | 'incorrect' | 'unanswered' };
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ numQuestions, currentQuestionIndex, onQuestionButtonClick, answeredQuestionsStatus }) => {
    const questionNumbers = Array.from({ length: numQuestions }, (_, i) => i + 1);

    return (
        <aside className="navigation-panel flex-1 bg-white border border-indigo-200 rounded-lg p-6 max-w-sm shadow-sm">
            <div className="navigation-header font-semibold mb-4 text-indigo-700 text-lg">Quiz navigation</div>
            <div className="question-numbers grid grid-cols-5 sm:grid-cols-7 gap-3 mb-4">
                {questionNumbers.map((number) => {
                    const questionIndex = number - 1;
                    const answerStatus = answeredQuestionsStatus[questionIndex] || 'unanswered';
                    return (
                        <QuestionNumberButton
                            key={number}
                            number={number}
                            isActive={number === currentQuestionIndex + 1}
                            answerStatus={answerStatus}
                            onClick={() => onQuestionButtonClick(questionIndex)}
                        />
                    );
                })}
            </div>
        </aside>
    );
};

export default NavigationPanel;