// src/features/Learner/CourseContent/components/AvailableCourseCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { LearnerCourseDto } from '../../../../types/course.types';
import { createEnrollment } from '../../../../api/services/Course/enrollmentService';

interface AvailableCourseCardProps {
  course: LearnerCourseDto;
  onEnrollmentSuccess?: () => void; // Make this callback optional
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  course, 
  onEnrollmentSuccess 
}) => {
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click (navigation) when enrolling
    
    if (isEnrolling) return; // Prevent multiple clicks
    
    setIsEnrolling(true);
    try {
      await createEnrollment(course.id);
      toast.success(`Enrolled in "${course.title}" successfully!`);
      
      // Call the callback if provided
      if (typeof onEnrollmentSuccess === 'function') {
        onEnrollmentSuccess();
      }
      
      // Refresh the page after a short delay to show the updated enrollment status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
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
        <div className="absolute top-2 right-2 bg-[#34137C] px-2 py-1 rounded-full text-xs text-white">
          {course.category.title}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{course.title}</h3>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <User className="w-3.5 h-3.5 mr-1.5" />
          <span>By {course.creator.name}</span>
        </div>
        
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
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span>Active learners: {course.activeLearnersCount || 0}</span>
          </div>
        </div>
        
        <button
          onClick={handleEnrollClick}
          disabled={isEnrolling}
          className="w-full bg-[#BF4BF6] hover:bg-[#D68BF9] text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

export default AvailableCourseCard;