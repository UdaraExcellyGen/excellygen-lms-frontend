// components/QuizCreator/QuizOverviewForm.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { QuizBank, QuizDetails, Question } from '../types/quiz';
import QuizQuestionItem from './QuizQuestionItem';

interface QuizOverviewFormProps {
    editableQuizBankForOverview: QuizBank;
    editableQuizDetailsState: QuizDetails;
    overviewQuestions: Question[];
    onOverviewInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveOverviewQuizDetails: () => void;
    onCloseQuizOverview: () => void;
    onQuestionTextChange: (index: number, value: string, isOverviewQuestion?: boolean) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string, isOverviewQuestion?: boolean) => void;
    onAddOption: (questionIndex: number, isOverviewQuestion?: boolean) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number, isOverviewQuestion?: boolean) => void;
    onCorrectAnswerChange: (questionIndex: number, optionIndex: number, isOverviewQuestion?: boolean) => void;
    onRemoveQuestion: (questionIndex: number, isOverviewQuestion?: boolean) => void;
    onAddQuestion: (isOverviewQuestion?: boolean) => void;
}

const QuizOverviewForm: React.FC<QuizOverviewFormProps> = ({
    editableQuizBankForOverview,
    editableQuizDetailsState,
    overviewQuestions,
    onOverviewInputChange,
    onSaveOverviewQuizDetails,
    onCloseQuizOverview,
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
                        <QuizQuestionItem
                            question={question}
                            questionIndex={questionIndex}
                            onQuestionTextChange={onQuestionTextChange}
                            onOptionChange={onOptionChange}
                            onAddOption={onAddOption}
                            onRemoveOption={onRemoveOption}
                            onCorrectAnswerChange={onCorrectAnswerChange}
                            onRemoveQuestion={onRemoveQuestion}
                            isOverviewQuestion={true}
                        />
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