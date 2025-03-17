// components/QuizCreator/QuizQuestionsForm.tsx
import React from 'react';
import { Question } from '../types/quiz';
import QuizQuestionItem from './QuizQuestionItem';

interface QuizQuestionsFormProps {
    questions: Question[];
    onQuestionTextChange: (index: number, value: string) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
    onAddOption: (questionIndex: number) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number) => void;
    onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
    onAddQuestion: () => void;
    onRemoveQuestion: (questionIndex: number) => void;
    onSaveQuiz: () => void;
    onCancelQuizQuestions: () => void;
}

const QuizQuestionsForm: React.FC<QuizQuestionsFormProps> = ({
    questions,
    onQuestionTextChange,
    onOptionChange,
    onAddOption,
    onRemoveOption,
    onCorrectAnswerChange,
    onAddQuestion,
    onRemoveQuestion,
    onSaveQuiz,
    onCancelQuizQuestions,
}) => {
    return (
        <div className="mt-4  backdrop-blur-md rounded-xl border  shadow-lg p-6">
            <h2 className="text-lg font-['Unbounded'] text-white mb-6">Quiz Questions</h2>
            {questions.map((question, questionIndex) => (
                <QuizQuestionItem
                    key={questionIndex}
                    question={question}
                    questionIndex={questionIndex}
                    onQuestionTextChange={onQuestionTextChange}
                    onOptionChange={onOptionChange}
                    onAddOption={onAddOption}
                    onRemoveOption={onRemoveOption}
                    onCorrectAnswerChange={onCorrectAnswerChange}
                    onRemoveQuestion={onRemoveQuestion}
                />
            ))}
            <div className="flex justify-end gap-4 mt-8">
                <button
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                    onClick={onCancelQuizQuestions}
                >
                    Cancel
                </button>
                <button
                    className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                    onClick={onAddQuestion}
                >
                    Add Question
                </button>
                <button
                    className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                    onClick={onSaveQuiz}
                >
                    Save Quiz Bank
                </button>
            </div>
        </div>
    );
};

export default QuizQuestionsForm;