import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { QuizAttemptDetailDto } from '../../../types/quiz.types';
import { getQuizAttemptDetails } from '../../../api/services/Course/quizService';

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId: attemptIdParam } = useParams<{ attemptId: string }>();
  const attemptId = attemptIdParam ? parseInt(attemptIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attemptDetails, setAttemptDetails] = useState<QuizAttemptDetailDto | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [localCourseId, setLocalCourseId] = useState<number | null>(location.state?.courseId || null);

  const courseId = location.state?.courseId;

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!attemptId) {
        toast.error('No quiz attempt specified');
        navigate(-1);
        return;
      }

      try {
        setIsLoading(true);
        const details = await getQuizAttemptDetails(attemptId);
        setAttemptDetails(details);
        
        // Animate score counting
        const scorePercentage = Math.round((details.correctAnswers / details.totalQuestions) * 100);
        animateScore(scorePercentage);
      } catch (error) {
        console.error('Error fetching quiz attempt details:', error);
        toast.error('Failed to load quiz results. Please try again.');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId, navigate]);

  // Add this effect to extract courseId from the attempt details if missing from location.state
  useEffect(() => {
    // If courseId isn't provided in location.state but attemptDetails has been loaded
    // and contains courseId, update our local courseId state
    if (!courseId && attemptDetails?.courseId) {
      setLocalCourseId(attemptDetails.courseId);
    }
  }, [courseId, attemptDetails]);

  const animateScore = (targetScore: number) => {
    let current = 0;
    const increment = targetScore / 60; // 60 steps for smoother animation
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(timer);
      }
      setAnimatedScore(Math.round(current));
    }, 25);
  };

  const handleBackToCourse = () => {
    const targetCourseId = courseId || attemptDetails?.courseId;
    
    if (targetCourseId) {
      navigate(`/learner/course-view/${targetCourseId}`);
    } else {
      // Try to get courseId from the attempt details
      if (attemptDetails?.lessonId) {
        // If we have a lessonId but no courseId, we can try to navigate to the dashboard
        navigate('/learner/dashboard');
        toast.info('Redirected to dashboard');
      } else {
        navigate('/learner/course-categories');
        toast.info('Redirected to course categories');
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
          Loading Quiz Results...
        </div>
      </div>
    );
  }

  if (!attemptDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6 max-w-md w-full text-center">
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

  const scorePercentage = Math.round((attemptDetails.correctAnswers / attemptDetails.totalQuestions) * 100);
  const isPassing = scorePercentage >= 70;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-4">
          <button
            onClick={handleBackToCourse}
            className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm bg-[#34137C]/50 px-4 py-2 rounded-xl hover:bg-[#34137C]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          
          <h1 className="text-white text-2xl font-bold">Quiz Results</h1>
          
          <div className="flex items-center text-white/70 text-sm bg-[#34137C]/50 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
            {attemptDetails.quizTitle}
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">{attemptDetails.quizTitle}</h2>
            {isPassing ? (
              <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/50">
                <Award className="text-amber-400 w-5 h-5" />
                <span className="text-amber-300 font-medium">Passed!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/50">
                <XCircle className="text-red-400 w-5 h-5" />
                <span className="text-red-400 font-medium">Try Again</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Score Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Score Display - Keeping the nice visualization as requested */}
          <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6 text-center">Performance Summary</h2>
            
            <div className="relative mb-6">
              <div className="w-56 h-56 mx-auto relative">
                {/* Outer glow effect */}
                <div className={`absolute inset-0 rounded-full blur-md opacity-30 ${
                  isPassing ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                
                {/* Score Background Circle */}
                <div className={`absolute inset-0 rounded-full ${
                  isPassing ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                } flex items-center justify-center`}>
                  <div className="absolute inset-2 rounded-full bg-[#34137C]/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-1">{animatedScore}%</div>
                      <div className="text-white/90 text-base">
                        {attemptDetails.correctAnswers} / {attemptDetails.totalQuestions}
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full ${
                        isPassing 
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50' 
                          : 'bg-red-500/30 text-red-200 border border-red-500/50'
                      }`}>
                        {isPassing ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Animated progress ring */}
                <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke={isPassing ? "url(#gradient-pass)" : "url(#gradient-fail)"}
                    strokeWidth="5"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - animatedScore / 100)}`}
                    className="transition-all duration-1000 ease-out drop-shadow-lg"
                  />
                  <defs>
                    <linearGradient id="gradient-pass" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFC107" />
                      <stop offset="100%" stopColor="#FF9800" />
                    </linearGradient>
                    <linearGradient id="gradient-fail" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF5252" />
                      <stop offset="100%" stopColor="#FF1744" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className={`p-4 rounded-xl ${
                isPassing ? 'bg-gradient-to-r from-purple-800/30 to-purple-900/30' : 'bg-gradient-to-r from-purple-800/30 to-purple-900/30'
              } border border-white/10`}>
                <p className="text-[#D68BF9] text-sm mb-1">Correct</p>
                <p className="text-3xl font-bold text-white">{attemptDetails.correctAnswers}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-800/30 to-purple-900/30 border border-white/10">
                <p className="text-[#D68BF9] text-sm mb-1">Total</p>
                <p className="text-3xl font-bold text-white">{attemptDetails.totalQuestions}</p>
              </div>
            </div>
          </div>

          {/* Stats and CTA */}
          <div className="space-y-6">
            <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Quiz Statistics</h3>
              
              <div className="bg-[#34137C]/30 p-4 rounded-lg mb-4">
                <p className="text-[#D68BF9] text-sm mb-2">Performance Insight</p>
                <p className="text-white/80 text-sm">
                  {isPassing 
                    ? "You've demonstrated excellent understanding of the material. Continue your learning journey with the next lesson."
                    : "Learning is a process. Review the material and try again when you're ready for better results."
                  }
                </p>
              </div>
              
              <div className="bg-[#34137C]/30 p-4 rounded-lg flex items-center">
            <Clock className="w-5 h-5 text-[#D68BF9] mr-3" />
            <div>
              <p className="text-[#D68BF9] text-sm font-medium">Completed</p>
              <p className="text-white text-lg">
                {(() => {
                  // Get the date from the backend
                  const utcDate = new Date(attemptDetails.completionTime || '');
                  
                  // Convert to Sri Lanka time by adding the offset (UTC+5:30)
                  const sriLankaTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                  
                  // Format as M/D/YYYY h:mm:ss AM/PM
                  const month = sriLankaTime.getMonth() + 1;
                  const day = sriLankaTime.getDate();
                  const year = sriLankaTime.getFullYear();
                  
                  let hours = sriLankaTime.getHours();
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  
                  const minutes = sriLankaTime.getMinutes().toString().padStart(2, '0');
                  const seconds = sriLankaTime.getSeconds().toString().padStart(2, '0');
                  
                  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
                })()}
              </p>
            </div>
          </div>
            </div>

            <button 
              onClick={handleBackToCourse}
              className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-4 rounded-lg transition-colors font-medium"
            >
              Continue Learning
            </button>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <BookOpen className="text-[#D68BF9] w-5 h-5 mr-2" />
            <h2 className="text-white text-lg font-semibold">
              Detailed Review
              <span className="text-[#D68BF9] text-sm font-normal ml-2">
                ({attemptDetails.answers.length} Questions)
              </span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {attemptDetails.answers.map((answer, index) => (
              <div 
                key={answer.quizAttemptAnswerId} 
                className={`bg-[#34137C]/30 rounded-lg p-4 border ${
                  answer.isCorrect 
                    ? 'border-[#BF4BF6]/30' 
                    : 'border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    answer.isCorrect ? 'bg-[#BF4BF6]' : 'bg-red-500'
                  }`}>
                    {answer.isCorrect ? (
                      <CheckCircle className="text-white w-5 h-5" />
                    ) : (
                      <XCircle className="text-white w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-3">
                      <span className="bg-[#34137C] px-2 py-1 rounded text-white text-xs font-medium">
                        Question {index + 1}
                      </span>
                    </div>
                    <p className="text-white mb-4">{answer.questionContent}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#34137C]/70 p-4 rounded-lg border border-[#34137C]">
                        <p className="text-[#D68BF9] text-sm font-bold mb-2">Your Answer:</p>
                        <p className={`font-medium ${
                          answer.isCorrect ? 'text-green-400' : 'text-red-300'
                        }`}>
                          {answer.selectedOptionText || 'No answer selected'}
                        </p>
                      </div>
                      
                      {!answer.isCorrect && (
                        <div className="bg-[#34137C]/70 p-4 rounded-lg border border-[#34137C]">
                          <p className="text-[#D68BF9] text-sm font-bold mb-2">Correct Answer:</p>
                          <p className="text-green-400 font-medium">{answer.correctOptionText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6 text-center">
          <h3 className="text-white font-semibold mb-4">Ready to Continue?</h3>
          <p className="text-white/80 mb-6">
            {isPassing 
              ? "Great job! Continue your learning journey with the next lesson."
              : "Use this feedback to strengthen your understanding and try again when you're ready."
            }
          </p>
          <button 
            onClick={handleBackToCourse}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-8 py-3 rounded-lg transition-colors font-medium"
          >
            Back to Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;