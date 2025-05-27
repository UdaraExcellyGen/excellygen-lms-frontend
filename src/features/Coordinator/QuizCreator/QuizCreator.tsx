import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import BackButton from './components/BackButton';
import QuizTabs from './components/QuizTabs';
import QuizDetailsForm from './components/QuizDetailsForm';
import QuestionList from './components/QuestionList';
import NavigationButtons from './components/NavigationButtons';
import Notification from './components/Notification';

import { Question, QuizDetails, QuizBank } from './types/types';
import { initialQuestion, initialQuizDetails } from './data/initialData'; // Import initial data


const QuizCreator: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { subtopicId, quizDetails: editableQuizDetails, fromUploadMaterials } = location.state || {};

    const editableQuizBankForOverview = editableQuizDetails ? {
        quizDetails: {
            title: editableQuizDetails.title || '',
            bankSize: String(editableQuizDetails.bankSize) || '20',
            quizSize: String(editableQuizDetails.quizSize) || '10',
            duration: String(editableQuizDetails.duration) || '15'
        },
        questions: editableQuizDetails.questions || [],
        name: editableQuizDetails.title || 'Unnamed Quiz',
        bankSize: editableQuizDetails.bankSize || 0,
        quizSize: editableQuizDetails.quizSize || 0,
        duration: editableQuizDetails.duration || 0,
    } : undefined;

    const [quizDetails, setQuizDetails] = useState<QuizDetails>(
        editableQuizBankForOverview?.quizDetails || initialQuizDetails
    );
    const [questions, setQuestions] = useState<Question[]>(
        editableQuizBankForOverview?.questions || [initialQuestion]
    );
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
    const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({ 0: true });
    const [currentTab, setCurrentTab] = useState<'details' | 'questions'>('questions');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');


    const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    useEffect(() => {
        if (showNotification) {
            setTimeout(() => {
                setShowNotification(false);
            }, 3000);
        }
    }, [showNotification]);


    const validateQuizDetails = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!quizDetails.title.trim()) {
            newErrors.title = "Quiz title is required";
        }

        const bankSize = parseInt(quizDetails.bankSize, 10);
        const quizSize = parseInt(quizDetails.quizSize, 10);
        const duration = parseInt(quizDetails.duration, 10);

        if (isNaN(bankSize) || bankSize <= 0) {
            newErrors.bankSize = "Bank size must be a positive number";
        }

        if (isNaN(quizSize) || quizSize <= 0) {
            newErrors.quizSize = "Quiz size must be a positive number";
        }

        if (isNaN(duration) || duration <= 0) {
            newErrors.duration = "Duration must be a positive number";
        }

        if (bankSize < quizSize) {
            newErrors.quizSize = "Quiz size cannot exceed bank size";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleQuizDetailsChange = (field: keyof QuizDetails, value: string) => {
        setQuizDetails(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const isQuestionValid = (question: Question): boolean => {
        if (!question.questionText.trim()) return false;
        const filledOptions = question.options.filter(opt => opt.trim());
        return filledOptions.length >= 2 && question.correctAnswerIndex !== null;
    };

    const handleQuestionTextChange = (index: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            questionText: value
        };
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        const updatedOptions = [...updatedQuestions[questionIndex].options];
        updatedOptions[optionIndex] = value;

        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options: updatedOptions
        };

        setQuestions(updatedQuestions);
    };

    const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            correctAnswerIndex: optionIndex
        };
        setQuestions(updatedQuestions);
    };

    const handleAddOption = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options: [...updatedQuestions[questionIndex].options, '']
        };
        setQuestions(updatedQuestions);
    };

    const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        const updatedOptions = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);

        let updatedCorrectAnswerIndex = updatedQuestions[questionIndex].correctAnswerIndex;
        if (updatedCorrectAnswerIndex === optionIndex) {
            updatedCorrectAnswerIndex = null;
        } else if (updatedCorrectAnswerIndex !== null && updatedCorrectAnswerIndex > optionIndex) {
            updatedCorrectAnswerIndex--;
        }

        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options: updatedOptions,
            correctAnswerIndex: updatedCorrectAnswerIndex
        };

        setQuestions(updatedQuestions);
    };

    const handleAddQuestion = () => {
        const bankSize = parseInt(quizDetails.bankSize, 10);

        if (!isNaN(bankSize) && questions.length >= bankSize) {
            showMessage(`You've reached the maximum of ${bankSize} questions in this bank.`, 'error');
            return;
        }

        if (questions.length > 0) {
            const lastQuestion = questions[questions.length - 1];
            if (!isQuestionValid(lastQuestion)) {
                showMessage('Please complete the current question before adding a new one.', 'error');
                return;
            }
        }

        const newQuestionIndex = questions.length;
        setQuestions([...questions, { ...initialQuestion }]);

        const newExpandedState: Record<number, boolean> = {};
        questions.forEach((_, index) => {
            newExpandedState[index] = false;
        });
        newExpandedState[newQuestionIndex] = true;
        setExpandedQuestions(newExpandedState);
        setActiveQuestionIndex(newQuestionIndex);
    };

    const handleRemoveQuestion = (questionIndex: number) => {
        if (questions.length <= 1) {
            showMessage('You must have at least one question in the quiz.', 'error');
            return;
        }

        const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
        setQuestions(updatedQuestions);

        const newExpandedState = { ...expandedQuestions };
        delete newExpandedState[questionIndex];

        for (let i = questionIndex + 1; i < questions.length; i++) {
            if (newExpandedState[i]) {
                newExpandedState[i - 1] = true;
                delete newExpandedState[i];
            }
        }

        setExpandedQuestions(newExpandedState);

        if (activeQuestionIndex === questionIndex) {
            setActiveQuestionIndex(Math.max(0, questionIndex - 1));
        } else if (activeQuestionIndex > questionIndex) {
            setActiveQuestionIndex(activeQuestionIndex - 1);
        }
    };

    const toggleQuestionExpansion = (index: number) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
        setActiveQuestionIndex(index);
    };

    const handleCancel = () => {
        if (fromUploadMaterials) {
            navigate('/coordinator/upload-materials');
        } else {
            navigate(-1);
        }
    };

    const handleSaveQuiz = () => {
        if (!validateQuizDetails()) {
            showMessage('Please fix the errors in quiz details.', 'error');
            setCurrentTab('details');
            return;
        }

        const invalidQuestionIndex = questions.findIndex(q => !isQuestionValid(q));
        if (invalidQuestionIndex !== -1) {
            showMessage(`Question ${invalidQuestionIndex + 1} is incomplete. Please fill all fields.`, 'error');
            setCurrentTab('questions');
            setActiveQuestionIndex(invalidQuestionIndex);
            setExpandedQuestions({ ...expandedQuestions, [invalidQuestionIndex]: true });
            return;
        }

        const bankSize = parseInt(quizDetails.bankSize, 10);
        if (!isNaN(bankSize) && questions.length < bankSize) {
            showMessage(`You need to add ${bankSize - questions.length} more questions to match the bank size.`, 'error');
            return;
        }

        const quizBankData: QuizBank = {
            quizDetails,
            questions,
            name: quizDetails.title || 'Unnamed Quiz',
            bankSize: parseInt(quizDetails.bankSize) || 0,
            quizSize: parseInt(quizDetails.quizSize) || 0,
            duration: parseInt(quizDetails.duration) || 0,
        };

        sessionStorage.setItem('updatedQuizData', JSON.stringify({
            subtopicId,
            quizBankData
        }));

        showMessage('Quiz saved successfully!', 'success');

        setTimeout(() => {
            if (fromUploadMaterials) {
                navigate('/coordinator/upload-materials');
            } else {
                navigate(-1);
            }
        }, 1500);
    };

    const handleBackToDetails = () => {
        setCurrentTab('details');
    };

    const handleContinueToQuestions = () => {
        if (validateQuizDetails()) {
            setCurrentTab('questions');
        } else {
            showMessage('Please fix the errors in quiz details first.', 'error');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 px-4 py-2 border-b border-[#BF4BF6]/30">
                    <div className="flex items-center gap-2">
                        <BackButton onClick={handleCancel} />
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
                        {editableQuizDetails ? 'Edit Quiz' : 'Create Quiz'}
                    </h1>

                    <QuizTabs
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                        questionsLength={questions.length}
                    />
                </div>

                {/* Main Content */}
                <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300">
                    {/* Quiz Details Tab */}
                    {currentTab === 'details' && (
                        <QuizDetailsForm
                            quizDetails={quizDetails}
                            errors={errors}
                            handleQuizDetailsChange={handleQuizDetailsChange}
                            onCancel={handleCancel}
                            onContinueToQuestions={handleContinueToQuestions}
                        />
                    )}

                    {/* Questions Tab */}
                    {currentTab === 'questions' && (
                        <QuestionList
                            questions={questions}
                            expandedQuestions={expandedQuestions}
                            activeQuestionIndex={activeQuestionIndex}
                            isQuestionValid={isQuestionValid}
                            onAddQuestion={handleAddQuestion}
                            onToggleQuestionExpansion={toggleQuestionExpansion}
                            onQuestionTextChange={handleQuestionTextChange}
                            onOptionChange={handleOptionChange}
                            onCorrectAnswerChange={handleCorrectAnswerChange}
                            onAddOption={handleAddOption}
                            onRemoveOption={handleRemoveOption}
                            onRemoveQuestion={handleRemoveQuestion}
                        />
                    )}
                </div>

                <NavigationButtons
                    currentTab={currentTab}
                    onCancel={handleCancel}
                    onBackToDetails={handleBackToDetails}
                    onContinueToQuestions={handleContinueToQuestions}
                    onSaveQuiz={handleSaveQuiz}
                    setCurrentTab={setCurrentTab}
                />

                <Notification
                    message={notificationMessage}
                    type={notificationType}
                    show={showNotification}
                    onClose={() => setShowNotification(false)}
                />
            </div>
        </div>
    );
};

export default QuizCreator;