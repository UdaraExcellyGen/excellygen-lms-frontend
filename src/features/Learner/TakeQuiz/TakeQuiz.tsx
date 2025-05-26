// src/features/Learner/TakeQuiz/TakeQuiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertTriangle, BookOpen, Trophy } from 'lucide-react';
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
  const location = useLocation();
  const { quizId: quizIdParam } = useParams<{ quizId: string }>();
  const quizId = quizIdParam ? parseInt(quizIdParam, 10) : 0;

  const courseId = location.state?.courseId;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizAttempt, setQuizAttempt] = useState<ActiveQuizState | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizAttemptDto | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
        const attemptResponse = await startQuizAttempt(quizId);
        
        if (attemptResponse.isCompleted) {
          toast.error('You have already completed this quiz');
          navigate(`/learner/quiz-results/${attemptResponse.quizAttemptId}`, {
            state: { courseId }
          });
          return;
        }
        
        const questions = await getQuestionsForLearner(quizId);
        
        if (!questions || questions.length === 0) {
          setError("No questions found for this quiz");
          toast.error('No questions found for this quiz');
          return;
        }
        
        const newQuizAttempt: ActiveQuizState = {
          quizId: quizId,
          quizTitle: attemptResponse.quizTitle || "Quiz",
          timeLimitMinutes: 15,
          attemptId: attemptResponse.quizAttemptId,
          questions: questions,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          startTime: new Date(),
          timeRemaining: 15 * 60,
          isCompleted: false
        };
        
        setQuizAttempt(newQuizAttempt);
        startTimer(15 * 60);
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError("Failed to load quiz. Please try again.");
        toast.error('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuiz();

    // Improved cleanup
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    };
  }, [quizId, navigate, courseId]);

  const startTimer = useCallback((initialSeconds: number) => {
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    const newInterval = setInterval(() => {
      setQuizAttempt(prev => {
        if (!prev) return null;

        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          clearInterval(newInterval);
          // We need to clear the timer state to avoid memory leaks
          setTimerInterval(null);
          handleCompleteQuiz();
          return { ...prev, timeRemaining: 0 };
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    setTimerInterval(newInterval);
  }, []);

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = async (questionId: number, optionId: number) => {
    if (!quizAttempt || quizAttempt.isCompleted) return;

    setSelectedOption(optionId);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
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
      setSelectedOption(null);
    }, 200);

    try {
      await submitQuizAnswer(quizAttempt.attemptId, questionId, optionId);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    }
  };

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

  const handleJumpToQuestion = (index: number) => {
    setQuizAttempt(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentQuestionIndex: index
      };
    });
  };

  const handleCompleteQuiz = async () => {
    if (!quizAttempt || isSubmitting) return;

    const unansweredCount = quizAttempt.questions.filter(q => 
      q && q.quizBankQuestionId && !quizAttempt.selectedAnswers[q.quizBankQuestionId]
    ).length;

    if (unansweredCount > 0 && !window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clear the timer interval before navigating away
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      const results = await completeQuizAttempt(quizAttempt.attemptId);
      navigate(`/learner/quiz-results/${quizAttempt.attemptId}`, {
        state: { courseId }
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    if (quizAttempt && !quizAttempt.isCompleted) {
      if (window.confirm('Your progress will be saved. You can resume this quiz later. Are you sure you want to exit?')) {
        if (courseId) {
          navigate(`/learner/course-view/${courseId}`);
        } else {
          navigate(-1);
        }
      }
    } else {
      if (courseId) {
        navigate(`/learner/course-view/${courseId}`);
      } else {
        navigate(-1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-white text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Quiz...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Quiz Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quizAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-white text-xl">Failed to load quiz.</div>
      </div>
    );
  }

  const currentQuestion = quizAttempt.questions[quizAttempt.currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-white text-xl">No questions available for this quiz.</div>
      </div>
    );
  }
  
  const selectedOptionId = currentQuestion.quizBankQuestionId ? 
    quizAttempt.selectedAnswers[currentQuestion.quizBankQuestionId] : undefined;
  
  const answeredCount = Object.keys(quizAttempt.selectedAnswers).length;
  const totalQuestions = quizAttempt.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleExit}
            className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </button>
          
          <h1 className="text-white text-xl font-bold">{quizAttempt.quizTitle}</h1>
          
          <div className={`flex items-center px-4 py-2 rounded-lg ${
            quizAttempt.timeRemaining < 60 
              ? 'bg-red-500/30 text-red-300' 
              : quizAttempt.timeRemaining < 300
              ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-[#1B0A3F]/60 text-[#D68BF9]'
          }`}>
            <Clock size={16} className="mr-2" />
            <span className="font-mono font-bold">{formatTimeRemaining(quizAttempt.timeRemaining)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-white font-semibold">Quiz Progress</h2>
              <p className="text-[#D68BF9] text-sm">Question {quizAttempt.currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <span className="text-white">{Math.round(progressPercent)}%</span>
          </div>
          
          <div className="w-full bg-[#34137C] rounded-full h-4">
            <div 
              className="h-4 rounded-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Questions</h3>
          <div className="flex flex-wrap gap-3">
            {quizAttempt.questions.map((question, index) => {
              const isAnswered = question && question.quizBankQuestionId && quizAttempt.selectedAnswers[question.quizBankQuestionId];
              const isCurrent = quizAttempt.currentQuestionIndex === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white' 
                      : isAnswered
                        ? 'bg-[#34137C] text-[#D68BF9] border border-[#BF4BF6]/50'
                        : 'bg-[#34137C]/50 text-white/70 hover:bg-[#34137C]'
                  }`}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && (
                    <CheckCircle className="w-3 h-3 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Question */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="text-[#D68BF9] w-5 h-5 mr-2" />
            <h2 className="text-white text-lg font-semibold">
              Question {quizAttempt.currentQuestionIndex + 1}
            </h2>
          </div>
          <div className="bg-[#34137C]/30 rounded-lg p-4 mb-6">
            <p className="text-white text-lg">{currentQuestion.questionContent}</p>
          </div>
          
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, index) => {
              const isSelected = selectedOptionId === option.mcqOptionId;
              const isAnimating = selectedOption === option.mcqOptionId;
              const optionLabels = ['A', 'B', 'C', 'D'];
              
              return (
                <button
                  key={option.mcqOptionId}
                  onClick={() => {
                    if (currentQuestion.quizBankQuestionId) {
                      handleSelectAnswer(currentQuestion.quizBankQuestionId, option.mcqOptionId);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[#BF4BF6]/20 border-[#BF4BF6]'
                      : 'bg-[#34137C]/30 border-[#34137C]/30 hover:border-[#BF4BF6]/50'
                  } ${
                    isAnimating ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium mr-3 ${
                      isSelected
                        ? 'bg-[#BF4BF6] text-white'
                        : 'bg-[#34137C] text-white/90'
                    }`}>
                      {optionLabels[index]}
                    </div>
                    <span className={`flex-1 ${
                      isSelected ? 'text-white' : 'text-white/90'
                    }`}>
                      {option.optionText}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-[#BF4BF6]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevQuestion}
            disabled={quizAttempt.currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg flex items-center ${
              quizAttempt.currentQuestionIndex === 0
                ? 'bg-[#34137C]/30 text-white/50 cursor-not-allowed'
                : 'bg-[#34137C] text-[#D68BF9] hover:bg-[#34137C]/80'
            }`}
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </button>
          
          {quizAttempt.currentQuestionIndex < quizAttempt.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-[#34137C] text-[#D68BF9] rounded-lg hover:bg-[#34137C]/80 flex items-center"
            >
              Next
              <ArrowRight size={16} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleCompleteQuiz}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white rounded-lg hover:from-[#A845E8] hover:to-[#BF4BF6] disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Trophy size={16} className="mr-2" />
                  Complete Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;