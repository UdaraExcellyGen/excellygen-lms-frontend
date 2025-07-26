// src/features/Learner/QuizResults/QuizResults.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { QuizAttemptDetailDto } from '../../../types/quiz.types';
import { getQuizAttemptDetails } from '../../../api/services/Course/quizService';
import { useBadgeChecker } from '../../../hooks/useBadgeChecker';

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId: attemptIdParam } = useParams<{ attemptId: string }>();
  const attemptId = attemptIdParam ? parseInt(attemptIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attemptDetails, setAttemptDetails] = useState<QuizAttemptDetailDto | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  const courseIdFromLocation = location.state?.courseId;

  const [quizCompletionTrigger, setQuizCompletionTrigger] = useState(0);
  useBadgeChecker(quizCompletionTrigger);

  // Score animation function
  const animateScore = (targetScore: number) => {
    let current = 0;
    const increment = targetScore > 0 ? targetScore / 60 : 0; 
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(timer);
      }
      setAnimatedScore(Math.round(current));
    }, 25);
  };

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!attemptId) {
        toast.error('No quiz attempt specified', { id: `quiz-error-${attemptId}` });
        navigate(-1);
        return;
      }
      try {
        setIsLoading(true);
        const details = await getQuizAttemptDetails(attemptId);
        setAttemptDetails(details);
        
        if (details) {
          const scorePercentage = details.totalQuestions > 0 
            ? Math.round((details.correctAnswers / details.totalQuestions) * 100)
            : 0;
          
          // Start the animation
          animateScore(scorePercentage);
          setQuizCompletionTrigger(count => count + 1);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching quiz attempt details:', error);
          toast.error('Failed to load quiz results. Please try again.', { 
            id: `quiz-load-error-${attemptId}` 
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId, navigate]);

  const handleBackToCourse = () => {
    const targetCourseId = courseIdFromLocation || attemptDetails?.courseId;
    
    if (targetCourseId && attemptDetails) {
      // Pass state back to the course view for seamless UI updates
      navigate(`/learner/course-view/${targetCourseId}`, {
        replace: true,
        state: { 
          quizCompleted: true, 
          quizId: attemptDetails.quizId, 
          attemptId: attemptDetails.quizAttemptId 
        }
      });
    } else {
      // Fallback navigation if courseId is not available
      navigate('/learner/dashboard');
      toast('Redirected to your dashboard');
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
          Loading Quiz Results...
        </div>
      </div>
    );
  }

  if (!attemptDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Unable to Load Results</h2>
          <p className="text-white/80 mb-6">We couldn't retrieve your quiz results at this time.</p>
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

  const scorePercentage = attemptDetails.totalQuestions > 0 ? Math.round((attemptDetails.correctAnswers / attemptDetails.totalQuestions) * 100) : 0;
  const isPassing = scorePercentage >= 50;

  const timeTakenFormatted = (() => {
    if (attemptDetails.startTime && attemptDetails.completionTime) {
      const startDate = new Date(attemptDetails.startTime);
      const endDate = new Date(attemptDetails.completionTime);
      const diffInSeconds = Math.round((endDate.getTime() - startDate.getTime()) / 1000);
      if (diffInSeconds < 0) return '00:00';
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return 'N/A';
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={handleBackToCourse}
          className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </button>

        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-md rounded-2xl p-4">
          <h1 className="text-[#1B0A3F] text-2xl font-bold">Quiz Results</h1>
          <div className="flex items-center text-[#1B0A3F] text-sm border border-[#34137C]/50 px-4 py-2 rounded-xl">
            {attemptDetails.quizTitle}
          </div>
        </div>
        
        {/* Score Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-[#1B0A3F] font-semibold mb-6 text-center text-xl">Performance Summary</h2>
            <div className="w-56 h-56 mx-auto relative flex items-center justify-center">
              <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="44"
                  stroke={isPassing ? "url(#gradient-pass)" : "url(#gradient-fail)"}
                  strokeWidth="8" fill="transparent" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - animatedScore / 100)}`}
                  className="transition-stroke-dashoffset duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient-pass">
                    <stop offset="0%" stopColor="#00a33cff" />
                    <stop offset="100%" stopColor="#028e7dff" />
                  </linearGradient>
                  <linearGradient id="gradient-fail">
                    <stop offset="0%" stopColor="#951d1dff" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center z-10">
                <div className={`text-5xl font-bold ${isPassing ? 'text-green-400' : 'text-red-400'} drop-shadow-md`}>
                  {animatedScore}%
                </div>
                <div className="text-green-400 text-base mt-1">
                  {attemptDetails.correctAnswers} / {attemptDetails.totalQuestions}
                </div>
                <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium ${isPassing ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-300'}`}>
                  {isPassing ? <Award className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isPassing ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-[#1B0A3F] font-semibold mb-4">Quiz Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[#52007C] p-4 rounded-lg flex items-center">
                  <Clock className="w-5 h-5 text-[#D68BF9] mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-[#D68BF9] text-sm font-medium">Time Taken</p>
                    <p className="text-[#D68BF9] text-lg font-mono">{timeTakenFormatted}</p>
                  </div>
                </div>
                <div className="border border-[#52007C] p-4 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#D68BF9] mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-[#D68BF9] text-sm font-medium">Completed On</p>
                    <p className="text-[#D68BF9] text-lg">
                      {new Date(attemptDetails.completionTime || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-[#1B0A3F] font-semibold mb-2">Summary</h3>
              <p className="text-[#1B0A3F] text-sm">
                {isPassing 
                  ? "Excellent work! You have a solid grasp of the material. Keep up the great momentum!"
                  : "Learning is a process. Review the answers below to strengthen your understanding and try again."
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <BookOpen className="text-[#D68BF9] w-5 h-5 mr-2" />
            <h2 className="text-[#1B0A3F] text-lg font-semibold">Detailed Review</h2>
          </div>
          <div className="space-y-4">
            {attemptDetails.answers.map((answer, index) => (
              <div 
                key={answer.quizAttemptAnswerId} 
                className={`rounded-lg p-4 border-l-4 ${
                  answer.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {answer.isCorrect ? (
                      <CheckCircle className="text-green-400 w-5 h-5" />
                    ) : (
                      <XCircle className="text-red-400 w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1B0A3F] mb-4">
                      <span className="font-bold mr-2 text-[#1B0A3F]">Q{index + 1}:</span> 
                      {answer.questionContent}
                    </p>
                    {answer.isCorrect ? (
                      <div className="p-4 rounded-lg border border-green-500">
                        <p className="text-[#D68BF9] text-sm font-bold mb-2">Correct Answer:</p>
                        <p className="font-medium text-green-400">
                          {answer.correctOptionText}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-red-500 grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg">
                          <p className="text-red-400 text-sm font-bold mb-2">Your Answer:</p>
                          <p className="font-medium text-red-400">
                            {answer.selectedOptionText || 'No answer selected'}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg">
                          <p className="text-green-400 text-sm font-bold mb-2">Correct Answer:</p>
                          <p className="text-green-400 font-medium">{answer.correctOptionText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;