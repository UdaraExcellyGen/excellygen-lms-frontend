// features/createNewCourse/QuizCreator/QuizCreator.tsx
import React, { useState, useEffect } from 'react';
import { QuizCreatorProps, Question, QuizDetails, QuizBank } from './types/QuizCreatorTypes'; // Import types from a separate file
import QuizDetailsForm from './components/QuizDetailsForm';
import QuizQuestionsForm from './components/QuizQuestionsForm';
import QuizOverviewForm from './components/QuizOverviewForm';
import PopupMessage from './components/PopupMessage';

const initialQuestion: Question = {
    questionText: '',
    options: ['', ''],
    correctAnswerIndex: null as number | null,
};

const initialQuizDetails: QuizDetails = {
    title: '',
    bankSize: '',
    quizSize: '',
    duration: ''
};


const QuizCreator: React.FC<QuizCreatorProps> = ({
    subtopicId,
    onSaveQuiz,
    onCancelQuizCreator,
    editableQuizBankForOverview,
    onCloseQuizOverview,
    onSaveOverviewQuizDetails
}) => {

    const [quizDetails, setQuizDetails] = useState<QuizDetails>(editableQuizBankForOverview?.quizDetails || initialQuizDetails);
    const [questions, setQuestions] = useState<Question[]>(editableQuizBankForOverview?.questions || [initialQuestion]);
    const [showQuizQuestionsForm, setShowQuizQuestionsForm] = useState<boolean>(false);
    const [editableQuizDetailsState, setEditableQuizDetailsState] = useState<QuizDetails | undefined>(editableQuizBankForOverview?.quizDetails);
    const [overviewQuestions, setOverviewQuestions] = useState<Question[]>(editableQuizBankForOverview?.questions || [initialQuestion]);

    const [bankSizeError, setBankSizeError] = useState<string>('');
    const [quizSizeError, setQuizSizeError] = useState<string>('');
    const [durationError, setDurationError] = useState<string>('');

    const [popupMessage, setPopupMessage] = useState<string>('');
    const [showPopup, setShowPopup] = useState<boolean>(false);


    useEffect(() => {
        if (editableQuizBankForOverview) {
            setOverviewQuestions(editableQuizBankForOverview.questions);
        } else {
            setOverviewQuestions([initialQuestion]);
        }
        setEditableQuizDetailsState(editableQuizBankForOverview?.quizDetails);
    }, [editableQuizBankForOverview]);


    const handleQuizDetailsChange = (field: keyof QuizDetails, value: string) => {
        if (field === 'quizSize') {
            const bankSize = parseInt(quizDetails.bankSize, 10);
            const quizSize = parseInt(value, 10);

            if (!isNaN(bankSize) && !isNaN(quizSize) && quizSize > bankSize) {
                setQuizSizeError("Number of questions in quiz cannot be greater than the quiz bank size.");
                return;
            } else {
                setQuizSizeError('');
            }
        }
        setQuizDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleQuestionTextChange = (index: number, value: string, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? [...overviewQuestions] : [...questions];
        questionsToUpdate[index] = {
            ...questionsToUpdate[index],
            questionText: value
        };
        if (isOverviewQuestion) {
            setOverviewQuestions(questionsToUpdate);
        } else {
            setQuestions(questionsToUpdate);
        }
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? [...overviewQuestions] : [...questions];
        const newOptions = [...questionsToUpdate[questionIndex].options];
        newOptions[optionIndex] = value;
        questionsToUpdate[questionIndex] = {
            ...questionsToUpdate[questionIndex],
            options: newOptions
        };
        if (isOverviewQuestion) {
            setOverviewQuestions(questionsToUpdate);
        } else {
            setQuestions(questionsToUpdate);
        }
    };

    const handleAddOption = (questionIndex: number, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? [...overviewQuestions] : [...questions];
        questionsToUpdate[questionIndex] = {
            ...questionsToUpdate[questionIndex],
            options: [...questionsToUpdate[questionIndex].options, ''],
        };
        if (isOverviewQuestion) {
            setOverviewQuestions(questionsToUpdate);
        } else {
            setQuestions(questionsToUpdate);
        }
    };

    const handleRemoveOption = (questionIndex: number, optionIndex: number, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? [...overviewQuestions] : [...questions];
        const updatedOptions = questionsToUpdate[questionIndex].options.filter((_, index) => index !== optionIndex);
        let updatedCorrectAnswerIndex = questionsToUpdate[questionIndex].correctAnswerIndex;
        if (updatedCorrectAnswerIndex === optionIndex) {
            updatedCorrectAnswerIndex = null;
        } else if (updatedCorrectAnswerIndex !== null && updatedCorrectAnswerIndex > optionIndex) {
            updatedCorrectAnswerIndex -= 1;
        }

        questionsToUpdate[questionIndex] = {
            ...questionsToUpdate[questionIndex],
            options: updatedOptions,
            correctAnswerIndex: updatedCorrectAnswerIndex,
        };
        if (isOverviewQuestion) {
            setOverviewQuestions(questionsToUpdate);
        } else {
            setQuestions(setQuestionsToUpdate);
        }
    };

    const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? [...overviewQuestions] : [...questions];
        questionsToUpdate[questionIndex] = {
            ...questionsToUpdate[questionIndex],
            correctAnswerIndex: optionIndex
        };
        if (isOverviewQuestion) {
            setOverviewQuestions(questionsToUpdate);
        } else {
            setQuestions(questionsToUpdate);
        }
    };

    const isQuestionValid = (question: Question): boolean => {
        if (!question.questionText.trim()) return false;
        if (question.options.length < 2) return false;
        if (question.options.some(option => !option.trim())) return false;
        if (question.correctAnswerIndex === null) return false;
        return true;
    };

    const handleAddQuestion = (isOverviewQuestion = false): void => {
        const currentQuestions = isOverviewQuestion ? overviewQuestions : questions;
        const bankSizeLimit = parseInt(editableQuizDetailsState?.bankSize || quizDetails.bankSize, 10);

        if (!isNaN(bankSizeLimit) && currentQuestions.length >= bankSizeLimit) {
            setPopupMessage(`You have reached the quiz bank limit of ${bankSizeLimit} questions.`);
            setShowPopup(true);
            return;
        }
        if (currentQuestions.length > 0) {
            const lastQuestion = currentQuestions[currentQuestions.length - 1];
            if (!isQuestionValid(lastQuestion)) {
                setPopupMessage("Please complete the current question before adding a new one.");
                setShowPopup(true);
                return;
            }
        }
        const newQuestionSet = [...currentQuestions, { ...initialQuestion }];
        if (isOverviewQuestion) {
            setOverviewQuestions(newQuestionSet);
        } else {
            setQuestions(newQuestionSet);
        }
    };


    const handleRemoveQuestion = (questionIndex: number, isOverviewQuestion = false): void => {
        const questionsToUpdate = isOverviewQuestion ? overviewQuestions : questions;
        const newQuestions = questionsToUpdate.filter((_, index) => index !== questionIndex);
        if (isOverviewQuestion) {
            setOverviewQuestions(newQuestions);
        } else {
            setQuestions(newQuestions);
        }
    };

    const handleSaveQuiz = (): void => {

        if (!quizDetails.duration) {
            setPopupMessage("Please enter the time duration for the quiz.");
            setShowPopup(true);
            return;
        }
        if (questions.length > 0) {
            const lastQuestion = questions[questions.length - 1];
            if (!isQuestionValid(lastQuestion)) {
                setPopupMessage("Please complete the last question before saving the quiz.");
                setShowPopup(true);
                return;
            }
        }

        const quizSize = parseInt(quizDetails.quizSize, 10);
        const bankSize = parseInt(quizDetails.bankSize, 10);

        if (isNaN(bankSize) || isNaN(quizSize)) {
            setPopupMessage("Quiz Bank Size and Quiz Size must be valid numbers.");
            setShowPopup(true);
            return;
        }
        if (quizSize > bankSize) {
            setPopupMessage("Number of questions in quiz cannot be greater than the quiz bank size.");
            setShowPopup(true);
            return;
        }

        const quizBankSize = parseInt(quizDetails.bankSize, 10);
        if (isNaN(quizBankSize) || questions.length !== quizBankSize) {
            setPopupMessage(`You must add exactly ${quizBankSize} questions to the quiz bank as specified in the Quiz Bank Size.`);
            setShowPopup(true);
            return;
        }


        const quizBankData: QuizBank = {
            quizDetails,
            questions: questions,
            name: quizDetails.title || 'Unnamed Quiz',
            bankSize: parseInt(quizDetails.bankSize) || 0,
            quizSize: parseInt(quizDetails.quizSize) || 0,
            duration: parseInt(quizDetails.duration) || 0,
        };

        onSaveQuiz(subtopicId, quizBankData);
        setShowQuizQuestionsForm(false);
    };


    const handleCreateQuizQuestionsClick = () => {
        setBankSizeError('');
        setQuizSizeError('');
        setDurationError('');

        let hasError = false;

        if (!quizDetails.bankSize) {
            setBankSizeError("Quiz Bank Size is required.");
            hasError = true;
        }
        if (!quizDetails.quizSize) {
            setQuizSizeError("Quiz Size is required.");
            hasError = true;
        }
        if (!quizDetails.duration) {
            setDurationError("Time Duration is required.");
            hasError = true;
        }

        const bankSize = parseInt(quizDetails.bankSize, 10);
        const quizSize = parseInt(quizDetails.quizSize, 10);

        if (!isNaN(bankSize) && !isNaN(quizSize) && quizSize > bankSize) {
            setQuizSizeError("Number of questions in quiz cannot be greater than the quiz bank size.");
            hasError = true;
        }


        if (hasError) {
            return;
        }

        setShowQuizQuestionsForm(true);

    };

    const handleCancelQuizQuestions = () => {
        setShowQuizQuestionsForm(false);
    };


    const handleOverviewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editableQuizDetailsState) return;
        let value = e.target.value;
        const fieldName = e.target.name as keyof QuizDetails;

        if (fieldName === 'quizSize' || fieldName === 'bankSize' || fieldName === 'duration') {
            if (isNaN(parseInt(value, 10)) && value !== "") {
                setPopupMessage("Please enter a valid number for Quiz Size, Bank Size, and Duration.");
                setShowPopup(true);
                return;
            }
            if (value === "") {
                value = "";
            }
        }


        if (fieldName === 'quizSize') {
            const bankSize = parseInt(editableQuizDetailsState?.bankSize || "0", 10);
            const quizSize = parseInt(value, 10);

            if (!isNaN(bankSize) && !isNaN(quizSize) && quizSize > bankSize) {
                setPopupMessage("Number of questions in quiz cannot be greater than the quiz bank size.");
                setShowPopup(true);
                return;
            }
        }


        setEditableQuizDetailsState({
            ...editableQuizDetailsState,
            [fieldName]: value,
        } as QuizDetails); // Type assertion here
    };


    const handleSaveOverviewQuizDetails = () => {

        if (!editableQuizDetailsState?.duration) {
            setPopupMessage("Please enter the time duration for the quiz.");
            setShowPopup(true);
            return;
        }
        if (overviewQuestions.length > 0) {
            const lastQuestion = overviewQuestions[overviewQuestions.length - 1];
            if (!isQuestionValid(lastQuestion)) {
                setPopupMessage("Please complete the last question before saving the quiz.");
                setShowPopup(true);
                return;
            }
        }

        const quizSize = parseInt(editableQuizDetailsState?.quizSize || "0", 10);
        const bankSize = parseInt(editableQuizDetailsState?.bankSize || "0", 10);


        if (isNaN(bankSize) || isNaN(quizSize)) {
            setPopupMessage("Quiz Bank Size and Quiz Size must be valid numbers.");
            setShowPopup(true);
            return;
        }
        if (quizSize > bankSize) {
            setPopupMessage("Number of questions in quiz cannot be greater than the quiz bank size.");
            setShowPopup(true);
            return;
        }

        const quizBankSize = parseInt(editableQuizDetailsState?.bankSize || "0", 10);
        if (isNaN(quizBankSize) || overviewQuestions.length !== quizBankSize) {
            setPopupMessage(`You must add exactly ${quizBankSize} questions to the quiz bank as specified in the Quiz Bank Size.`);
            setShowPopup(true);
            return;
        }


        const updatedQuizBank: QuizBank = {
            ...editableQuizBankForOverview!,
            quizDetails: editableQuizDetailsState!,
            questions: overviewQuestions,
            bankSize: bankSize,
            quizSize: quizSize,
            duration: parseInt(editableQuizDetailsState!.duration || "0", 10),
            name: editableQuizDetailsState!.title || 'Unnamed Quiz',
        };

        onSaveOverviewQuizDetails(subtopicId, updatedQuizBank);
        onCloseQuizOverview();
        setEditableQuizDetailsState(undefined);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupMessage('');
    };


    return (
        <>
            <PopupMessage showPopup={showPopup} popupMessage={popupMessage} onClosePopup={handleClosePopup} />

            {!showQuizQuestionsForm && !editableQuizBankForOverview?.quizDetails && (
                <QuizDetailsForm
                    quizDetails={quizDetails}
                    onQuizDetailsChange={handleQuizDetailsChange}
                    onCreateQuizQuestionsClick={handleCreateQuizQuestionsClick}
                    onCancelQuizCreator={onCancelQuizCreator}
                    bankSizeError={bankSizeError}
                    quizSizeError={quizSizeError}
                    durationError={durationError}
                />
            )}

            {showQuizQuestionsForm && !editableQuizBankForOverview?.quizDetails && (
                <QuizQuestionsForm
                    questions={questions}
                    onQuestionTextChange={(index, value) => handleQuestionTextChange(index, value)}
                    onOptionChange={(questionIndex, optionIndex, value) => handleOptionChange(questionIndex, optionIndex, value)}
                    onAddOption={handleAddOption}
                    onRemoveOption={handleRemoveOption}
                    onCorrectAnswerChange={handleCorrectAnswerChange}
                    onAddQuestion={handleAddQuestion}
                    onRemoveQuestion={handleRemoveQuestion}
                    onSaveQuiz={handleSaveQuiz}
                    onCancelQuizQuestions={handleCancelQuizQuestions}
                />
            )}

            {editableQuizBankForOverview?.quizDetails && (
                <QuizOverviewForm
                    editableQuizBankForOverview={editableQuizBankForOverview}
                    editableQuizDetailsState={editableQuizDetailsState || initialQuizDetails} // Provide fallback
                    overviewQuestions={overviewQuestions}
                    onOverviewInputChange={handleOverviewInputChange}
                    onSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                    onCloseQuizOverview={onCloseQuizOverview}
                    onQuestionTextChange={handleQuestionTextChange}
                    onOptionChange={handleOptionChange}
                    onAddOption={handleAddOption}
                    onRemoveOption={handleRemoveOption}
                    onCorrectAnswerChange={handleCorrectAnswerChange}
                    onRemoveQuestion={handleRemoveQuestion}
                    onAddQuestion={handleAddQuestion}
                />
            )}
        </>
    );
};

export default QuizCreator;