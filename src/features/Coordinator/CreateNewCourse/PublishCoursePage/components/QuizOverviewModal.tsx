// features/Coordinator/CreateNewCourse/PublishCoursePage/components/QuizOverviewModal.tsx
import React from 'react';
import { X } from 'lucide-react';

// Define QuizBank type to match what's used in PublishCoursePage
export interface QuizBank {
    id: number;
    title: string;
    description: string;
    questions: any[];
    timeLimitMinutes: number;
    totalMarks?: number;
    lessonId: number;
    quizTitle?: string; // Added for compatibility with different API responses
    quizSize?: number; // Added for compatibility
}

interface QuizOverviewModalProps {
    quizBank: QuizBank;
    onClose: () => void;
    onSave: (updatedQuizBank: QuizBank) => void;
    isFullScreen?: boolean;
    subtopicId: string;
}

const QuizOverviewModal: React.FC<QuizOverviewModalProps> = ({ 
    quizBank, 
    onClose, 
    onSave, 
    isFullScreen = true,
    subtopicId 
}) => {
    // Normalize quiz data for consistent display
    const normalizedQuizBank = {
        ...quizBank,
        title: quizBank.title || quizBank.quizTitle || "Quiz Overview",
        questions: quizBank.questions || []
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className={`bg-white rounded-2xl p-8 shadow-lg ${isFullScreen ? 'w-[90%] h-[90%]' : 'max-w-4xl'} overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-['Unbounded'] text-[#1B0A3F]">{normalizedQuizBank.title}</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 text-[#1B0A3F]">Quiz Details:</h2>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800 font-nunito">
                            Title: <span className="font-normal">{normalizedQuizBank.title}</span>
                        </p>
                        {normalizedQuizBank.description && (
                            <p className="font-semibold text-gray-800 font-nunito">
                                Description: <span className="font-normal">{normalizedQuizBank.description}</span>
                            </p>
                        )}
                        <p className="font-semibold text-gray-800 font-nunito">
                            Time Limit: <span className="font-normal">{normalizedQuizBank.timeLimitMinutes} minutes</span>
                        </p>
                        <p className="font-semibold text-gray-800 font-nunito">
                            Total Questions: <span className="font-normal">{normalizedQuizBank.questions.length || normalizedQuizBank.quizSize || 0}</span>
                        </p>
                        {normalizedQuizBank.totalMarks && (
                            <p className="font-semibold text-gray-800 font-nunito">
                                Total Marks: <span className="font-normal">{normalizedQuizBank.totalMarks}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 text-[#1B0A3F]">Questions:</h2>
                    {normalizedQuizBank.questions && normalizedQuizBank.questions.length > 0 ? (
                        <ol className="list-decimal pl-5 space-y-6">
                            {normalizedQuizBank.questions.map((question, index) => {
                                // Handle different question formats
                                const questionContent = question.questionContent || question.content || question.questionText || '';
                                const options = question.options || [];
                                
                                return (
                                    <li key={index} className="text-gray-800">
                                        <p className="font-semibold mb-2">{questionContent}</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {options.map((option: any, optIndex: number) => {
                                                const optionText = option.optionText || option.text || '';
                                                const isCorrect = option.isCorrect || (question.correctAnswerIndex === optIndex);
                                                
                                                return (
                                                    <li key={optIndex} className={isCorrect ? "text-green-600 font-semibold" : "text-gray-700"}>
                                                        {optionText} {isCorrect && "(Correct)"}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="text-gray-500 italic">No questions available to display.</p>
                    )}
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#F6E6FF] hover:text-[#1B0A3F] rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onSave(normalizedQuizBank)}
                        className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizOverviewModal;