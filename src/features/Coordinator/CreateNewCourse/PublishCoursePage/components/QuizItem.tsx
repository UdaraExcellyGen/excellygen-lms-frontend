// features/Coordinator/CreateNewCourse/PublishCoursePage/components/QuizItem.tsx
import React from 'react';
import { BookCheck, Edit3, Trash, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizItemProps {
  lessonId: number;
  quiz: any; // Will use proper quiz type
  handleViewQuiz: (lessonId: number) => void;
  isEditMode?: boolean;
  onEditQuiz?: (lessonId: number) => void;
  onRemoveQuiz?: (lessonId: number) => void;
  courseId?: number;
  isLearnerView?: boolean;
}

const QuizItem: React.FC<QuizItemProps> = ({ 
  lessonId, 
  quiz, 
  handleViewQuiz, 
  isEditMode = false,
  onEditQuiz,
  onRemoveQuiz,
  courseId,
  isLearnerView = false
}) => {
  const navigate = useNavigate();
  
  // Extract the quiz properties safely with fallbacks
  const quizTitle = quiz.title || quiz.quizTitle || "Quiz";
  const questionCount = quiz.questions?.length || quiz.totalQuestions || quiz.quizSize || 0;
  const timeLimit = quiz.timeLimitMinutes || quiz.duration || 0;
  const quizId = quiz.quizId || quiz.id;

  const handleTakeQuiz = () => {
    if (isLearnerView && quizId) {
      navigate(`/learner/take-quiz/${quizId}`, { 
        state: { courseId } 
      });
    }
  };

  return (
    <div className="bg-[#1B0A3F]/60 rounded-lg p-3 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300 mt-2 border-l-2 border-purple-500">
      <div className="flex items-center gap-2 overflow-hidden">
        <BookCheck className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
        <span className="text-sm text-white group-hover:text-[#D68BF9] transition-colors font-nunito truncate">
          Quiz: {quizTitle} ({questionCount} questions, {timeLimit} min)
        </span>
      </div>
      <div className="flex gap-2">
        {isLearnerView ? (
          <button
            onClick={handleTakeQuiz}
            className="text-gray-400 hover:text-[#D68BF9] transition-colors flex-shrink-0 text-sm px-3 py-1 border border-[#D68BF9]/30 rounded-md flex items-center gap-1"
          >
            <ExternalLink size={14} className="mr-1" />
            Take Quiz
          </button>
        ) : isEditMode ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditQuiz && onEditQuiz(lessonId);
              }}
              className="text-[#D68BF9] hover:text-white transition-colors flex-shrink-0 text-sm px-3 py-1 border border-[#D68BF9]/30 rounded-md"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveQuiz && onRemoveQuiz(lessonId);
              }}
              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 text-sm px-3 py-1 border border-red-500/30 rounded-md"
            >
              <Trash className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleViewQuiz(lessonId)}
            className="text-gray-400 hover:text-[#D68BF9] transition-colors flex-shrink-0 text-sm px-3 py-1 border border-[#D68BF9]/30 rounded-md"
          >
            View Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizItem;