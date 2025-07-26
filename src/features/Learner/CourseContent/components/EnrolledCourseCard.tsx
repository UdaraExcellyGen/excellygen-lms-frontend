// src/features/Learner/CourseContent/components/EnrolledCourseCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, LogOut, User, ArrowRight } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';

interface EnrolledCourseCardProps {
  course: LearnerCourseDto;
  onUnenroll: (course: LearnerCourseDto) => void;
  onContinueLearning: (courseId: number) => void;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ 
  course, 
  onUnenroll, 
  onContinueLearning 
}) => {
  const navigate = useNavigate();
  
  const progressPercentage = course.progressPercentage || 0;
  
  // Function to get creator name - preserve real data from backend
  const getCreatorName = () => {
    // Always use the actual creator name if it exists, only fallback if truly empty/null
    if (course.creator?.name && course.creator.name.trim() !== '') {
      return course.creator.name;
    }
    return 'ExcellyGen Team'; // Only fallback if no real name available
  };
  
  const handleContinueLearning = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinueLearning(course.id);
  };
  
  const handleUnenrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnenroll(course);
  };
  
  const handleCardClick = () => {
    navigate(`/learner/course-view/${course.id}`);
  };

  // UPDATED: Progress-based button logic
  const getButtonText = () => {
    if (progressPercentage === 0) return 'Start Learning';
    if (progressPercentage === 100) return 'View Course';
    return 'Continue Learning';
  };

  // UPDATED: Only show unenroll if progress is 0%
  const canUnenroll = progressPercentage === 0;
  
  return (
    <div 
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 overflow-hidden relative">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#34137C] flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-[#D68BF9]" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <span className="bg-[#BF4BF6]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold">
            {course.category?.title || 'General'}
          </span>
          {/* Conditionally render the "Inactive" badge */}
          {course.isInactive && (
            <span className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              Inactive
            </span>
          )}
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
          <div className="text-white text-sm font-semibold font-nunito">Progress: {progressPercentage}%</div>
          <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${progressPercentage === 100 ? 'bg-green-400' : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[#1B0A3F] font-bold text-lg mb-2 line-clamp-2 font-nunito">{course.title}</h3>
        <div className="flex items-center text-sm text-[#52007C] mb-3">
          <User className="w-4 h-4 mr-2" />
          <span className="font-medium font-nunito">By {getCreatorName()}</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {course.technologies?.slice(0, 3).map(tech => (
            tech && <span key={tech.id} className="bg-[#F6E6FF] text-[#52007C] px-3 py-1 rounded-full text-xs font-medium font-nunito">
              {tech.name}
            </span>
          ))}
          {(course.technologies?.length || 0) > 3 && (
            <span className="bg-[#F6E6FF] text-[#52007C] px-3 py-1 rounded-full text-xs font-medium font-nunito">
              +{(course.technologies?.length || 0) - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-[#52007C] text-sm mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
            <span className="font-medium font-nunito">{course.estimatedTime || 0} hours</span>
          </div>
          {progressPercentage === 100 ? (
            <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              <span className="font-semibold text-xs font-nunito">Completed</span>
            </div>
          ) : (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
              <span className="font-medium font-nunito">Lessons: {course.completedLessons || 0}/{course.totalLessons || course.lessons?.length || 0}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* Continue Learning Button */}
          <button
            onClick={handleContinueLearning}
            className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg hover:shadow-xl font-nunito text-sm flex items-center gap-2 justify-center"
          >
            <span>{getButtonText()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Unenroll Button - Only show if progress is 0% */}
          {canUnenroll && (
            <button
              onClick={handleUnenrollClick}
              className="w-full bg-[#F6E6FF] hover:bg-red-100 text-[#52007C] hover:text-red-600 py-2.5 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-[#BF4BF6]/20 hover:border-red-300 font-nunito font-semibold text-sm flex items-center gap-2 justify-center"
              title="Unenroll from course"
            >
              <LogOut className="w-4 h-4" />
              <span>Unenroll</span>
            </button>
          )}
        </div>

        {/* Progress-based info message */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div className="mt-2 text-xs text-[#52007C] text-center opacity-75 font-nunito">
            Course progress prevents unenrollment
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourseCard;