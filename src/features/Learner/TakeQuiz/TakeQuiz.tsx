// src/features/Learner/TakeQuiz/TakeQuiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  ActiveQuizState,
  LearnerQuizQuestionDto,
  QuizAttemptDto
} from '../../../types/quiz.types';

import {
  getQuestionsForLearner,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt
} from '../../../api/services/Course/quizService';

const TakeQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { quizId: quizIdParam } = useParams<{ quizId: string }>();
  const quizId = quizIdParam ? parseInt(quizIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizAttempt, setQuizAttempt] = useState<ActiveQuizState | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizAttemptDto | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize quiz attempt
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!quizId) {
        setError("No quiz ID specified");
        toast.error('No quiz specified');
        navigate(-1);
        return;
      }

      try {
        setIsLoading(true);
        // Start a quiz attempt
        const attemptResponse = await startQuizAttempt(quizId);
        
        // If attempt is already completed, show results
        if (attemptResponse.isCompleted) {
          toast.error('You have already completed this quiz');
          navigate(`/learner/quiz-results/${attemptResponse.quizAttemptId}`);
          return;
        }
        
        // Get questions for this quiz
        const questions = await getQuestionsForLearner(quizId);
        
        if (!questions || questions.length === 0) {
          setError("No questions found for this quiz");
          toast.error('No questions found for this quiz');
          return;
        }
        
        // Initialize quiz state
        const newQuizAttempt: ActiveQuizState = {
          quizId: quizId,
          quizTitle: attemptResponse.quizTitle || "Quiz",
          timeLimitMinutes: 15, // Default, should come from attempt
          attemptId: attemptResponse.quizAttemptId,
          questions: questions,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          startTime: new Date(),
          timeRemaining: 15 * 60, // Default 15 minutes in seconds
          isCompleted: false
        };
        
        setQuizAttempt(newQuizAttempt);
        
        // Start timer
        startTimer(15 * 60); // 15 minutes in seconds
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError("Failed to load quiz. Please try again.");
        toast.error('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuiz();

    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [quizId, navigate]);

  // Timer function
  const startTimer = useCallback((initialSeconds: number) => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const newInterval = setInterval(() => {
      setQuizAttempt(prev => {
        if (!prev) return null;

        const newTimeRemaining = prev.timeRemaining - 1;
        
        // Auto-submit if time runs out
        if (newTimeRemaining <= 0) {
          clearInterval(newInterval);
          handleCompleteQuiz();
          return { ...prev, timeRemaining: 0 };
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    setTimerInterval(newInterval);
  }, []);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle selecting an answer
  const handleSelectAnswer = async (questionId: number, optionId: number) => {
    if (!quizAttempt || quizAttempt.isCompleted) return;

    setQuizAttempt(prev => {
      if (!prev) return null;
      return {
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [questionId]: optionId
        }
      };
    });

    try {
      // Submit answer to backend
      await submitQuizAnswer(quizAttempt.attemptId, questionId, optionId);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  // Navigation functions
  const handlePrevQuestion = () => {
    setQuizAttempt(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
      };
    });
  };

  const handleNextQuestion = () => {
    setQuizAttempt(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentQuestionIndex: Math.min(prev.questions.length - 1, prev.currentQuestionIndex + 1)
      };
    });
  };

  // Jump to a specific question
  const handleJumpToQuestion = (index: number) => {
    setQuizAttempt(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentQuestionIndex: index
      };
    });
  };

  // Complete the quiz
  const handleCompleteQuiz = async () => {
    if (!quizAttempt || isSubmitting) return;

    // Check if all questions have been answered
    const unansweredCount = quizAttempt.questions.filter(q => 
      q && q.quizBankQuestionId && !quizAttempt.selectedAnswers[q.quizBankQuestionId]
    ).length;

    if (unansweredCount > 0 && !window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Complete the attempt
      const results = await completeQuizAttempt(quizAttempt.attemptId);
      
      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Show results
      setQuizResults(results);
      setShowResults(true);
      setQuizAttempt(prev => prev ? { ...prev, isCompleted: true } : null);
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exit
  const handleExit = () => {
    if (quizAttempt && !quizAttempt.isCompleted) {
      if (window.confirm('Your progress will be saved. You can resume this quiz later. Are you sure you want to exit?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Navigate to results page
  const handleViewDetailedResults = () => {
    if (quizResults) {
      navigate(`/learner/quiz-results/${quizResults.quizAttemptId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
        <p className="text-white text-xl">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex flex-col justify-center items-center">
        <p className="text-white text-xl mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!quizAttempt) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
        <p className="text-white text-xl">Failed to load quiz.</p>
      </div>
    );
  }

  const currentQuestion = quizAttempt.questions[quizAttempt.currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
        <p className="text-white text-xl">No questions available for this quiz.</p>
      </div>
    );
  }
  
  const selectedOptionId = currentQuestion.quizBankQuestionId ? 
    quizAttempt.selectedAnswers[currentQuestion.quizBankQuestionId] : undefined;
  
  const answeredCount = Object.keys(quizAttempt.selectedAnswers).length;
  const totalQuestions = quizAttempt.questions.length;

  // Quiz results screen
  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-3xl mx-auto bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 text-white">
          <h1 className="text-2xl font-bold text-center mb-6">Quiz Results</h1>
          
          <div className="flex justify-center mb-8">
            <div className="w-40 h-40 rounded-full bg-[#34137C] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">{quizResults.score || 0}</p>
                <p className="text-sm">out of</p>
                <p className="text-xl">{quizResults.totalQuestions}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#34137C] p-4 rounded-lg">
              <p className="text-sm text-[#D68BF9]">Correct Answers</p>
              <p className="text-xl">{quizResults.correctAnswers} / {quizResults.totalQuestions}</p>
            </div>
            <div className="bg-[#34137C] p-4 rounded-lg">
              <p className="text-sm text-[#D68BF9]">Score Percentage</p>
              <p className="text-xl">{Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100)}%</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={handleExit}
              className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors"
            >
              Back to Course
            </button>
            <button 
              onClick={handleViewDetailedResults}
              className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-lg transition-colors"
            >
              View Detailed Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-4 flex justify-between items-center">
          <button 
            onClick={handleExit}
            className="text-[#D68BF9] hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Exit Quiz
          </button>
          
          <h1 className="text-white font-semibold">{quizAttempt.quizTitle}</h1>
          
          <div className={`flex items-center gap-2 ${quizAttempt.timeRemaining < 60 ? 'text-red-400' : 'text-[#D68BF9]'}`}>
            <Clock size={16} />
            <span>{formatTimeRemaining(quizAttempt.timeRemaining)}</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm">Progress</span>
            <span className="text-white text-sm">{answeredCount} / {totalQuestions} answered</span>
          </div>
          <div className="w-full bg-[#34137C] rounded-full h-2.5">
            <div 
              className="bg-[#BF4BF6] h-2.5 rounded-full" 
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Question Navigation */}
      <div className="max-w-3xl mx-auto mb-6 overflow-x-auto">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-4">
          <div className="flex gap-2 min-w-max">
            {quizAttempt.questions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleJumpToQuestion(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${quizAttempt.currentQuestionIndex === index 
                    ? 'bg-[#BF4BF6] text-white' 
                    : question && question.quizBankQuestionId && quizAttempt.selectedAnswers[question.quizBankQuestionId]
                      ? 'bg-[#34137C] text-white'
                      : 'bg-[#34137C]/50 text-gray-300'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Current Question */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
          <h2 className="text-white text-lg mb-6">
            Question {quizAttempt.currentQuestionIndex + 1} of {totalQuestions}
          </h2>
          
          <p className="text-white mb-6">{currentQuestion.questionContent}</p>
          
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map(option => (
              <button
                key={option.mcqOptionId}
                onClick={() => {
                  if (currentQuestion.quizBankQuestionId) {
                    handleSelectAnswer(currentQuestion.quizBankQuestionId, option.mcqOptionId);
                  }
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedOptionId === option.mcqOptionId
                    ? 'bg-[#BF4BF6] text-white border-[#BF4BF6]'
                    : 'bg-[#34137C]/60 text-white border-[#BF4BF6]/30 hover:border-[#BF4BF6]'
                }`}
              >
                {option.optionText}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={quizAttempt.currentQuestionIndex === 0}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
              quizAttempt.currentQuestionIndex === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#34137C] text-[#D68BF9] hover:bg-[#34137C]/80'
            }`}
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          
          {quizAttempt.currentQuestionIndex < quizAttempt.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 bg-[#34137C] text-[#D68BF9] rounded-lg hover:bg-[#34137C]/80 transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCompleteQuiz}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Quiz'}
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;