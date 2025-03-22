import React, { useState, useCallback } from 'react';
import QuizHeader from './components/QuizHeader';
import QuestionInfo from './components/QuestionInfo';
import QuestionText from './components/QuestionText';
import OptionsForm from './components/OptionsForm';
import NavigationPanel from './components/NavigationPanel';
import QuizFooter from './components/QuizFooter';
import ScorePopup from './components/ScorePopup';
import { quizData } from './data/quizData';
import { Question } from './types/quiz';

const LearnerQuizPage: React.FC = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string | null }>({});
    const [answeredQuestionsStatus, setAnsweredQuestionsStatus] = useState<{ [key: number]: 'answered' | 'correct' | 'incorrect' | 'unanswered' }>({});
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const numQuestions = quizData.length;

    const currentQuestion = quizData[currentQuestionIndex];

    const handleAnswerChange = useCallback((answer: string | null) => {
        setSelectedAnswer(answer);
        setIsAnswerChecked(false);
    }, []);

    const handleCheckAnswer = useCallback(() => {
        if (selectedAnswer === null) {
            alert("Please select an answer before checking.");
            return;
        }

        setIsAnswerChecked(true);

        setAnsweredQuestions(prevAnsweredQuestions => ({
            ...prevAnsweredQuestions,
            [currentQuestionIndex]: selectedAnswer,
        }));

        if (selectedAnswer === currentQuestion.correctAnswer) {
            setAnsweredQuestionsStatus(prevStatus => ({
                ...prevStatus,
                [currentQuestionIndex]: 'correct',
            }));
        } else {
            setAnsweredQuestionsStatus(prevStatus => ({
                ...prevStatus,
                [currentQuestionIndex]: 'incorrect',
            }));
        }
    }, [currentQuestionIndex, selectedAnswer, currentQuestion.correctAnswer]);


    const handleNextPage = useCallback(() => {
        if (!isAnswerChecked) {
            handleCheckAnswer();
            return;
        }

        if (currentQuestionIndex < numQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(answeredQuestions[currentQuestionIndex + 1] || null);
            setIsAnswerChecked(false);
        } else {
            setIsQuizFinished(true);
        }
    }, [currentQuestionIndex, numQuestions, isAnswerChecked, answeredQuestions, handleCheckAnswer]);


    const handleBackPage = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(answeredQuestions[currentQuestionIndex - 1] || null);
            setIsAnswerChecked(false);
        }
    }, [currentQuestionIndex, answeredQuestions]);

    const handleQuestionButtonClick = useCallback((questionIndex: number) => {
        setCurrentQuestionIndex(questionIndex);
        setSelectedAnswer(answeredQuestions[questionIndex] || null);
        setIsAnswerChecked(false);
    }, [answeredQuestions]);

    const isNextDisabled = selectedAnswer === null && !isAnswerChecked;
    const score = Object.values(answeredQuestionsStatus).filter(status => status === 'correct').length;

    const handleCloseScorePopup = useCallback(() => {
        setIsQuizFinished(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnsweredQuestions({});
        setAnsweredQuestionsStatus({});
        setIsAnswerChecked(false);
    }, []);

    return (
        <div className="quiz-container h-screen bg-pale-purple rounded-lg shadow-md overflow-hidden flex flex-col w-full max-w-full ">
            <QuizHeader timeLeft="0:26:03" />

            <main className="quiz-body flex p-6 gap-8">
                <section className="question-area flex-grow">
                    <QuestionInfo
                        questionNumber={currentQuestionIndex + 1}
                    />
                    <QuestionText text={currentQuestion.question} />
                    <OptionsForm
                        options={currentQuestion.options}
                        onAnswerChange={handleAnswerChange}
                        selectedAnswer={selectedAnswer}
                        isAnswerChecked={isAnswerChecked}
                        correctAnswer={currentQuestion.correctAnswer}
                    />
                </section>

                <NavigationPanel
                    numQuestions={numQuestions}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionButtonClick={handleQuestionButtonClick}
                    answeredQuestionsStatus={answeredQuestionsStatus}
                />
            </main>


            <QuizFooter
                onNextPage={handleNextPage}
                disableNext={isNextDisabled}
                currentQuestionIndex={currentQuestionIndex}
                isAnswerChecked={isAnswerChecked}
                onCheckAnswer={handleCheckAnswer}
            />

            {isQuizFinished && (
                <ScorePopup
                    score={score}
                    numQuestions={numQuestions}
                    onClose={handleCloseScorePopup}
                    quizData={quizData}
                    answeredQuestions={answeredQuestions}
                    answeredQuestionsStatus={answeredQuestionsStatus}
                />
            )}
        </div>
    );
};

export default LearnerQuizPage;