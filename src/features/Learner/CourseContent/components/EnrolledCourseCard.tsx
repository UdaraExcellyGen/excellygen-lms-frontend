// src/features/Learner/CourseContent/components/EnrolledCourseCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LearnerCourseDto } from '../../../../types/course.types';
import { deleteEnrollment } from '../../../../api/services/Course/enrollmentService';

interface EnrolledCourseCardProps {
  course: LearnerCourseDto;
  onUnenrollSuccess?: () => void; // Optional callback
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ course, onUnenrollSuccess }) => {
  const navigate = useNavigate();
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const progressPercentage = course.progressPercentage || 0;
  
  const handleContinueLearning = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/learner/course-view/${course.id}`);
  };
  
  const handleUnenrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };
  
  const handleConfirmUnenroll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUnenrolling || !course.enrollmentId) return;
    
    setIsUnenrolling(true);
    try {
      await deleteEnrollment(course.enrollmentId);
      toast.success(`Unenrolled from "${course.title}" successfully!`);
      
      // Call the callback if provided
      if (typeof onUnenrollSuccess === 'function') {
        onUnenrollSuccess();
      }
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Unenrollment error:', error);
      toast.error('Failed to unenroll from course');
    } finally {
      setIsUnenrolling(false);
      setShowConfirmation(false);
    }
  };
  
  const handleCancelUnenroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(false);
  };
  
  const handleCardClick = () => {
    navigate(`/learner/course-view/${course.id}`);
  };
  
  return (
    <div 
      className="bg-[#1B0A3F]/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[#BF4BF6]/20 transition duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-40 overflow-hidden relative">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#34137C] flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-[#D68BF9]" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
            <span className="bg-[#34137C] px-2 py-1 rounded-full text-xs text-white">
                {course.category.title}
            </span>
            {/* THIS IS THE FIX: Conditionally render the "Inactive" badge */}
            {course.isInactive && (
                <span className="bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Inactive
                </span>
            )}
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1B0A3F]/80 px-3 py-1.5 flex items-center justify-between">
          <div className="text-white text-xs font-medium">Progress: {progressPercentage}%</div>
          <div className="w-20 h-1.5 bg-[#34137C] rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressPercentage === 100 ? 'bg-green-500' : 'bg-[#BF4BF6]'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{course.title}</h3>
        
        <div className="mb-3 flex flex-wrap gap-1">
          {course.technologies.slice(0, 3).map(tech => (
            <span key={tech.id} className="bg-[#34137C] text-xs text-white px-2 py-1 rounded-full">
              {tech.name}
            </span>
          ))}
          {course.technologies.length > 3 && (
            <span className="bg-[#34137C] text-xs text-white px-2 py-1 rounded-full">
              +{course.technologies.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-gray-300 text-xs mb-4">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{course.estimatedTime} hours</span>
          </div>
          {progressPercentage === 100 ? (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Completed</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span>Lessons: {course.completedLessons}/{course.totalLessons}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleContinueLearning}
            className="flex-1 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white py-2 rounded-lg transition-colors"
          >
            {progressPercentage === 0 ? 'Start Learning' : 
             progressPercentage === 100 ? 'View Course' : 'Continue Learning'}
          </button>
          
          {!showConfirmation ? (
            <button
              onClick={handleUnenrollClick}
              className="px-3 py-2 bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleConfirmUnenroll}
                disabled={isUnenrolling}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUnenrolling ? '...' : 'Yes'}
              </button>
              <button
                onClick={handleCancelUnenroll}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;