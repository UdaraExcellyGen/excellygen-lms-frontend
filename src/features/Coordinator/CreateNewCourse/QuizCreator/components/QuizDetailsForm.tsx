// components/QuizCreator/QuizDetailsForm.tsx
import React from 'react';
import { QuizDetails } from '../types/QuizCreatorTypes';

interface QuizDetailsFormProps {
    quizDetails: QuizDetails;
    onQuizDetailsChange: (field: keyof QuizDetails, value: string) => void;
    onCreateQuizQuestionsClick: () => void;
    onCancelQuizCreator: () => void;
    bankSizeError: string;
    quizSizeError: string;
    durationError: string;
}

const QuizDetailsForm: React.FC<QuizDetailsFormProps> = ({
    quizDetails,
    onQuizDetailsChange,
    onCreateQuizQuestionsClick,
    onCancelQuizCreator,
    bankSizeError,
    quizSizeError,
    durationError
}) => {
    return (
        <div className="mt-4 bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6">
            <h2 className="text-lg font-['Unbounded'] text-white mb-6">Quiz Details</h2>
            <div className="mb-6">
                <label htmlFor="questionTitle" className="block text-sm font-medium text-white mb-2 font-['Nunito_Sans']">
                    Quiz Title
                </label>
                <input
                    type="text"
                    id="questionTitle"
                    placeholder="Enter quiz title"
                    className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                    value={quizDetails.title}
                    onChange={(e) => onQuizDetailsChange('title', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-10 mb-6">
                <div>
                    <label htmlFor="quizBankQuestions" className="block text-sm font-medium text-white mb-2 font-['Nunito_Sans']">
                        Number of Questions in Quiz Bank <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="quizBankQuestions"
                        placeholder="Size of Quiz Bank"
                        className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                        value={quizDetails.bankSize}
                        onChange={(e) => onQuizDetailsChange('bankSize', e.target.value)}
                    />
                    {bankSizeError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{bankSizeError}</p>}
                </div>
                <div>
                    <label htmlFor="quizQuestions" className="block text-sm font-medium text-white mb-2 font-['Nunito_Sans']">
                        Number of Questions in Quiz <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="quizQuestions"
                        placeholder="Size of Quiz"
                        className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                        value={quizDetails.quizSize}
                        onChange={(e) => onQuizDetailsChange('quizSize', e.target.value)}
                    />
                    {quizSizeError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{quizSizeError}</p>}
                </div>
            </div>
            <div className="mb-6">
                <label htmlFor="timeDuration" className="block text-sm font-medium text-white mb-2 font-['Nunito_Sans']">
                    Time Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="timeDuration"
                    placeholder="Time Duration"
                    className="mt-1 block w-1/2 rounded-md border-gray-600 shadow-sm focus:border-[#D68BF9] focus:ring-[#D68BF9] sm:text-sm p-2 font-['Nunito_Sans'] bg-[#2D1B59] text-white"
                    value={quizDetails.duration}
                    onChange={(e) => onQuizDetailsChange('duration', e.target.value)}
                    required
                />
                {durationError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{durationError}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={onCancelQuizCreator}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm font-['Nunito_Sans']">
                    Cancel
                </button>
                <button
                    className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline font-['Nunito_Sans']"
                    onClick={onCreateQuizQuestionsClick}
                >
                    Create Quiz
                </button>
            </div>
        </div>
    );
};

export default QuizDetailsForm;