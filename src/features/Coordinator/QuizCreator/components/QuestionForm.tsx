import React from 'react';
import { X, Plus, Trash2, CheckCircle, ChevronUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { Question } from '../types/types';

interface QuestionFormProps {
    question: Question;
    questionIndex: number;
    expanded: boolean;
    isQuestionValid: (question: Question) => boolean;
    onToggleExpansion: (index: number) => void;
    onQuestionTextChange: (index: number, value: string) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
    onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
    onAddOption: (questionIndex: number) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number) => void;
    onRemoveQuestion: (questionIndex: number) => void;
    questionsLength: number;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
    question,
    questionIndex,
    expanded,
    isQuestionValid,
    onToggleExpansion,
    onQuestionTextChange,
    onOptionChange,
    onCorrectAnswerChange,
    onAddOption,
    onRemoveOption,
    onRemoveQuestion,
    questionsLength
}) => {
    return (
        <div
            className={`bg-[#1B0A3F]/60 backdrop-blur-sm rounded-lg border ${
                expanded
                    ? 'border-[#D68BF9]'
                    : 'border-[#BF4BF6]/30'
            } overflow-hidden transition-all duration-200 hover:border-[#BF4BF6]/60`}
        >
            {/* Question Header */}
            <div
                className={`flex justify-between items-center p-4 cursor-pointer ${
                    expanded ? 'bg-[#BF4BF6]/10' : ''
                }`}
                onClick={() => onToggleExpansion(questionIndex)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center text-white text-xs">
                        {questionIndex + 1}
                    </div>
                    <h3 className="text-white font-medium truncate max-w-[150px] sm:max-w-sm md:max-w-md font-nunito">
                        {question.questionText || `Question ${questionIndex + 1}`}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {isQuestionValid(question) ? (
                        <span className="text-green-400 text-xs flex items-center gap-1 font-nunito">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Complete
                        </span>
                    ) : (
                        <span className="text-yellow-400 text-xs flex items-center gap-1 font-nunito">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            Incomplete
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUpComponent />
                    ) : (
                        <ChevronDownComponent />
                    )}
                </div>
            </div>

            {/* Question Content */}
            {expanded && (
                <div className="p-4 border-t border-[#BF4BF6]/30">
                    {/* Question Text */}
                    <div className="mb-4">
                        <label className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
                            Question Text <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={question.questionText}
                            onChange={e => onQuestionTextChange(questionIndex, e.target.value)}
                            placeholder="Enter your question here"
                            rows={3}
                            className="w-full bg-[#34137C]/60 text-white rounded-md border border-[#BF4BF6]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors font-nunito"
                        />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                        <label className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
                            Answer Options <span className="text-red-400">*</span>
                        </label>
                        <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onCorrectAnswerChange(questionIndex, optionIndex)}
                                        className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center border ${
                                            question.correctAnswerIndex === optionIndex
                                                ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white'
                                                : 'border-[#BF4BF6]/50 bg-transparent'
                                        }`}
                                        disabled={!option.trim()}
                                    >
                                        {question.correctAnswerIndex === optionIndex && (
                                            <CheckCircle className="w-3 h-3" />
                                        )}
                                    </button>

                                    <input
                                        type="text"
                                        value={option}
                                        onChange={e => onOptionChange(questionIndex, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        className="flex-1 bg-[#34137C]/60 text-white rounded-md border border-[#BF4BF6]/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors text-sm font-nunito"
                                    />

                                    {question.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveOption(questionIndex, optionIndex)}
                                            className="text-[#D68BF9] hover:text-red-400 p-1 rounded-md transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => onAddOption(questionIndex)}
                                className="text-[#D68BF9] text-sm hover:text-white flex items-center gap-1 font-nunito"
                            >
                                <Plus className="w-3 h-3" />
                                Add Option
                            </button>

                            {questionsLength > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveQuestion(questionIndex)}
                                    className="text-red-400 text-sm hover:text-red-300 flex items-center gap-1 font-nunito"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove Question
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ChevronUpComponent = () => <ChevronUp className="w-4 h-4 text-[#D68BF9]" />;
const ChevronDownComponent = () => <ChevronDown className="w-4 h-4 text-[#D68BF9]" />;


export default QuestionForm;