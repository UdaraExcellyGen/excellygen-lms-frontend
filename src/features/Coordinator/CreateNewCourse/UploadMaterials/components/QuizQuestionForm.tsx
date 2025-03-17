
import React from 'react';
import { Question } from '../types/quiz';
import { X, Plus } from 'lucide-react';

interface QuizQuestionFormProps {
    questions: Question[];
    onQuestionTextChange: (index: number, value: string) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
    onAddOption: (questionIndex: number) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number) => void;
    onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
    onRemoveQuestion: (questionIndex: number) => void;
    onAddQuestion: () => void;
    onCancelQuizQuestions: () => void;
    onSaveQuiz: () => void;
}

const QuizQuestionForm: React.FC<QuizQuestionFormProps> = ({
    questions,
    onQuestionTextChange,
    onOptionChange,
    onAddOption,
    onRemoveOption,
    onCorrectAnswerChange,
    onRemoveQuestion,
    onAddQuestion,
    onCancelQuizQuestions,
    onSaveQuiz
}) => {
    return (
        <div className="mt-4  backdrop-blur-md rounded-xl border  shadow-lg p-6">
            <h2 className="text-lg font-['Unbounded'] text-white mb-6">Quiz Questions</h2>
            {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-[#1B0A3F]/80 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white font-['Nunito_Sans']">
                            Question {(questionIndex + 1).toString().padStart(2, '0')}
                        </h3>
                        <button
                            type="button"
                            className="text-red-400 hover:text-red-500 font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm font-['Nunito_Sans']"
                            onClick={() => onRemoveQuestion(questionIndex)}>
                            Remove Question
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2 font-['Nunito_Sans']">
                            Question Text
                        </label>
                        <textarea
                            placeholder="Enter your question"
                            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                            rows={3}
                            value={question.questionText}
                            onChange={(e) => onQuestionTextChange(questionIndex, e.target.value)}
                        />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4 font-['Nunito_Sans']">Options</h4>
                        {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center mb-2">
                                <input
                                    type="radio"
                                    name={`correctAnswer-${questionIndex}`}
                                    className="mr-2 focus:ring-[#D68BF9] h-4 w-4 text-[#BF4BF6] border-gray-600"
                                    onChange={() => onCorrectAnswerChange(questionIndex, optionIndex)}
                                    checked={question.correctAnswerIndex === optionIndex}
                                    disabled={!option.trim()}
                                />
                                <input
                                    type="text"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                                    value={option}
                                    onChange={(e) => onOptionChange(questionIndex, optionIndex, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="ml-2 text-red-400 hover:text-red-500 font-semibold p-1 rounded focus:outline-none focus:shadow-outline text-sm h-6 w-6 flex items-center justify-center"
                                    onClick={() => onRemoveOption(questionIndex, optionIndex)}
                                >
                                    <X size={14} color="white" className="group-hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-[#D68BF9] hover:text-[#BF4BF6] font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                            onClick={() => onAddOption(questionIndex)}>
                            Add Option
                        </button>
                    </div>
                </div>
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

export default QuizQuestionForm;