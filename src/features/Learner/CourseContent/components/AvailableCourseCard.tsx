// src/features/Learner/CourseContent/components/AvailableCourseCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen, Users, ArrowRight } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';

interface AvailableCourseCardProps {
  course: LearnerCourseDto;
  onEnroll: (courseId: number) => void;
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  course, 
  onEnroll 
}) => {
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // 🔥 CRITICAL FIX: Show real creator name from backend - no fallbacks!
  const getCreatorName = () => {
    // Debug what we actually have
    console.log(`🔍 Creator data for "${course.title}":`, {
      creator: course.creator,
      name: course.creator?.name,
      id: course.creator?.id
    });
    
    // Return actual name from backend, or "Unknown" only if truly empty
    return course.creator?.name || 'Unknown Creator';
  };
  
  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnrolling) return;
    
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const handleViewCourseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/learner/course-preview/${course.id}`);
  };
  
  const handleCardClick = () => {
    navigate(`/learner/course-preview/${course.id}`);
  };
  
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
        <div className="absolute top-3 right-3 bg-[#BF4BF6]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold">
          {course.category?.title || 'General'}
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
          {course.technologies && course.technologies.length > 3 && (
            <span className="bg-[#F6E6FF] text-[#52007C] px-3 py-1 rounded-full text-xs font-medium font-nunito">
              +{course.technologies.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-[#52007C] text-sm mb-3">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
            <span className="font-medium font-nunito">{course.estimatedTime} hours</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
            <span className="font-medium font-nunito">Lessons: {course.totalLessons || course.lessons?.length || 0}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-[#52007C] text-sm mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
            <span className="font-medium font-nunito">Enrolled: {course.activeLearnersCount || 0}</span>
          </div>
          {course.status && (
            <div className="flex items-center">
              <span className="text-green-600 font-semibold text-xs bg-green-100 px-2 py-1 rounded-full font-nunito">Published</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* View Course Button */}
          <button
            onClick={handleViewCourseClick}
            className="w-full bg-[#F6E6FF] hover:bg-[#E6D0FF] text-[#52007C] py-2.5 rounded-full text-sm flex items-center gap-2 transition-all duration-300 justify-center border border-[#BF4BF6]/20 hover:border-[#BF4BF6]/40 font-nunito font-semibold"
          >
            <span>View Course</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Enroll Button */}
          <button
            onClick={handleEnrollClick}
            disabled={isEnrolling}
            className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg hover:shadow-xl font-nunito text-sm flex items-center gap-2 justify-center"
          >
            {isEnrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enrolling...
              </>
            ) : (
              <>
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableCourseCard;