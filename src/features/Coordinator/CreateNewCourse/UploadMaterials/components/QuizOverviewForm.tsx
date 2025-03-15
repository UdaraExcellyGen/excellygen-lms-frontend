
import React from 'react';
import { QuizDetails, Question } from '../types/quiz';
import { ArrowLeft, X, Plus } from 'lucide-react';

interface QuizOverviewFormProps {
    editableQuizDetailsState: QuizDetails | null;
    overviewQuestions: Question[];
    onCloseQuizOverview: () => void;
    onSaveOverviewQuizDetails: () => void;
    onOverviewInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onQuestionTextChange: (index: number, value: string, isOverviewQuestion?: boolean) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string, isOverviewQuestion?: boolean) => void;
    onAddOption: (questionIndex: number, isOverviewQuestion?: boolean) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number, isOverviewQuestion?: boolean) => void;
    onCorrectAnswerChange: (questionIndex: number, optionIndex: number, isOverviewQuestion?: boolean) => void;
    onRemoveQuestion: (questionIndex: number, isOverviewQuestion?: boolean) => void;
    onAddQuestion: (isOverviewQuestion?: boolean) => void;
}

const QuizOverviewForm: React.FC<QuizOverviewFormProps> = ({
    editableQuizDetailsState,
    overviewQuestions,
    onCloseQuizOverview,
    onSaveOverviewQuizDetails,
    onOverviewInputChange,
    onQuestionTextChange,
    onOptionChange,
    onAddOption,
    onRemoveOption,
    onCorrectAnswerChange,
    onRemoveQuestion,
    onAddQuestion
}) => {
    return (
        <div className="mt-4 bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onCloseQuizOverview}
                    className="hover:bg-[#34137C] p-2 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <h1 className="text-xl font-['Unbounded'] text-white">Edit Quiz Overview</h1>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-['Unbounded'] text-white mb-4">Quiz Details</h2>
                <div className="mb-4">
                    <p className="font-semibold font-['Nunito_Sans'] text-white">Title:
                        <input
                            type="text"
                            name="title"
                            value={editableQuizDetailsState?.title || ''}
                            onChange={onOverviewInputChange}
                            className="ml-2 font-normal border rounded p-1 text-gray-700 font-['Nunito_Sans'] bg-[#F6E6FF] text-black"
                        />
                    </p>
                </div>
                <div className="mb-4">
                    <p className="font-semibold font-['Nunito_Sans'] text-white">Bank Size:
                        <input
                            type="text"
                            name="bankSize"
                            value={editableQuizDetailsState?.bankSize?.toString() || ''}
                            onChange={onOverviewInputChange}
                            className="ml-2 font-normal border rounded p-1 text-gray-700 font-['Nunito_Sans'] bg-[#F6E6FF] text-black"
                        />
                    </p>
                </div>
                <div className="mb-4">
                    <p className="font-semibold font-['Nunito_Sans'] text-white">Quiz Size:
                        <input
                            type="text"
                            name="quizSize"
                            value={editableQuizDetailsState?.quizSize?.toString() || ''}
                            onChange={onOverviewInputChange}
                            className="ml-2 font-normal border rounded p-1 text-gray-700 font-['Nunito_Sans'] bg-[#F6E6FF] text-black"
                        />
                    </p>
                </div>
                <div className="mb-6">
                    <p className="font-semibold font-['Nunito_Sans'] text-white">Duration:
                        <input
                            type="text"
                            name="duration"
                            value={editableQuizDetailsState?.duration?.toString() || ''}
                            onChange={onOverviewInputChange}
                            className="ml-2 font-normal border rounded p-1 text-gray-700 font-['Nunito_Sans'] bg-[#F6E6FF] text-black"
                        />
                    </p>
                </div>

                <h2 className="text-lg font-['Unbounded'] text-white mb-4">Quiz Questions</h2>

                {overviewQuestions.map((question, questionIndex) => (
                    <div key={questionIndex}>
                        <div className="mb-6 p-4 rounded-lg bg-[#1B0A3F]/80">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-white font-['Nunito_Sans']">
                                    Question {(questionIndex + 1).toString().padStart(2, '0')}
                                </h3>
                                <button
                                    type="button"
                                    className="text-red-400 hover:text-red-500 font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm font-['Nunito_Sans']"
                                    onClick={() => onRemoveQuestion(questionIndex, true)}
                                >
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
                                    onChange={(e) => onQuestionTextChange(questionIndex, e.target.value, true)}
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
                                            onChange={() => onCorrectAnswerChange(questionIndex, optionIndex, true)}
                                            checked={question.correctAnswerIndex === optionIndex}
                                            disabled={!option.trim()}
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Option ${optionIndex + 1}`}
                                            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                                            value={option}
                                            onChange={(e) => onOptionChange(questionIndex, optionIndex, e.target.value, true)}
                                        />
                                        <button
                                            type="button"
                                            className="ml-2 text-red-400 hover:text-red-500 font-semibold p-1 rounded focus:outline-none focus:shadow-outline text-sm h-6 w-6 flex items-center justify-center"
                                            onClick={() => onRemoveOption(questionIndex, optionIndex, true)}
                                        >
                                            <X
                                                size={14}
                                                color="white" className="group-hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="text-[#D68BF9] hover:text-[#BF4BF6] font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                                    onClick={() => onAddOption(questionIndex, true)}>
                                    Add Option
                                </button>
                            </div>
                        </div>
                        {questionIndex === overviewQuestions.length - 1 && (
                            <button
                                className="ml-4 px-3 py-1 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm"
                                onClick={() => onAddQuestion(true)}
                            >
                                Add Question
                            </button>
                        )}
                    </div>
                ))}

                <div className="flex justify-start mt-6">
                    <button
                        onClick={onSaveOverviewQuizDetails}
                        className="px-6 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors"
                    >
                        Save Quiz
                    </button>
                    <button
                        onClick={onCloseQuizOverview}
                        className="px-6 py-2 text-[#BF4BF6] font-['Nunito_Sans'] hover:bg-[#F6E6FF] hover:text-[#1B0A3F] rounded-lg transition-colors ml-4"
                    >
                        Back to Upload Materials
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizOverviewForm;