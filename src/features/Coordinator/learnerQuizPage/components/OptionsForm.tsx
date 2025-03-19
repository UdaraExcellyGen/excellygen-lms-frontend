import React, { useCallback } from 'react';
import OptionItem from './OptionItem';

interface OptionsFormProps {
    options: string[];
    onAnswerChange: (answer: string | null) => void;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string;
}

const OptionsForm: React.FC<OptionsFormProps> = ({ options, onAnswerChange, selectedAnswer, isAnswerChecked, correctAnswer }) => {
    const handleOptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onAnswerChange(value);
    }, [onAnswerChange]);

    const handleClearChoice = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onAnswerChange(null);
    }, [onAnswerChange]);

    return (
        <form className="options-form">
            {options.map((option, index) => (
                <OptionItem
                    key={index}
                    id={`option-${String.fromCharCode(97 + index)}`}
                    name="answer"
                    value={option}
                    label={`${String.fromCharCode(97 + index)}. ${option}`}
                    onChange={handleOptionChange}
                    checked={selectedAnswer === option}
                    isCorrectAnswer={isAnswerChecked && option === correctAnswer}
                    isIncorrectAnswer={isAnswerChecked && option === selectedAnswer && selectedAnswer !== correctAnswer}
                />
            ))}
            {!isAnswerChecked && (
                <a href="#" className="clear-choice text-persian-indigo no-underline text-sm mt-3 block hover:text-indigo-700" onClick={handleClearChoice}>
                    Clear my choice
                </a>
            )}
        </form>
    );
};

export default OptionsForm;