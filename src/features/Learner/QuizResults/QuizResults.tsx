// src/features/Learner/QuizResults/QuizResults.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { QuizAttemptDetailDto } from '../../../types/quiz.types';
import { getQuizAttemptDetails } from '../../../api/services/Course/quizService';

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId: attemptIdParam } = useParams<{ attemptId: string }>();
  const attemptId = attemptIdParam ? parseInt(attemptIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attemptDetails, setAttemptDetails] = useState<QuizAttemptDetailDto | null>(null);

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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
        <p className="text-white text-xl">Loading results...</p>
      </div>
    );
  }

  if (!attemptDetails) {
    return (
      <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
        <p className="text-white text-xl">Failed to load quiz results.</p>
      </div>
    );
  }

  const scorePercentage = Math.round((attemptDetails.correctAnswers / attemptDetails.totalQuestions) * 100);
  const isPassing = scorePercentage >= 70; // Define passing score as 70%

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoBack} 
              className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-[#1B0A3F]" />
            </button>
            <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
              Quiz Results: {attemptDetails.quizTitle}
            </h1>
          </div>
        </div>
        
        {/* Quiz Summary */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-white text-xl mb-2">Quiz Summary</h2>
              <p className="text-gray-300">Completed on: {new Date(attemptDetails.completionTime || '').toLocaleString()}</p>
            </div>
            
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isPassing ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <div>
                  <p className="text-3xl font-bold text-white">{scorePercentage}%</p>
                  <p className="text-sm text-gray-300">{attemptDetails.correctAnswers} / {attemptDetails.totalQuestions}</p>
                </div>
              </div>
              <p className={`mt-2 ${isPassing ? 'text-green-400' : 'text-red-400'}`}>
                {isPassing ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
          <h2 className="text-white text-xl mb-4">Question Review</h2>
          
          {attemptDetails.answers.map((answer, index) => (
            <div 
              key={answer.quizAttemptAnswerId} 
              className={`mb-6 p-4 rounded-lg ${
                answer.isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-1 ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {answer.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-white mb-3">
                    <span className="text-gray-400">Question {index + 1}:</span> {answer.questionContent}
                  </p>
                  
                  <div className="mb-2">
                    <p className="text-gray-400 text-sm">Your Answer:</p>
                    <p className={`${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {answer.selectedOptionText || 'No answer selected'}
                    </p>
                  </div>
                  
                  {!answer.isCorrect && (
                    <div>
                      <p className="text-gray-400 text-sm">Correct Answer:</p>
                      <p className="text-green-400">{answer.correctOptionText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;