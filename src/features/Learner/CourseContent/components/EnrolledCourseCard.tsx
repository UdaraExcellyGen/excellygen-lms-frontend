// src/features/Learner/CourseContent/components/EnrolledCourseCard.tsx
// ENTERPRISE OPTIMIZED: Enhanced with better performance, memoization, and UX
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, LogOut, User, ArrowRight } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';

interface EnrolledCourseCardProps {
  course: LearnerCourseDto;
  onUnenroll: (course: LearnerCourseDto) => void;
  onContinueLearning: (courseId: number) => void;
}

// ENTERPRISE: Memoized technology tags component
const TechnologyTags: React.FC<{ 
  technologies: Array<{ id: string; name: string }> | undefined;
  maxVisible?: number;
}> = React.memo(({ technologies, maxVisible = 3 }) => {
  const tags = useMemo(() => {
    if (!technologies || technologies.length === 0) return null;
    
    const visibleTags = technologies.slice(0, maxVisible);
    const remainingCount = technologies.length - maxVisible;
    
    return {
      visible: visibleTags,
      hasMore: remainingCount > 0,
      remainingCount
    };
  }, [technologies, maxVisible]);

  if (!tags) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tags.visible.map(tech => (
        tech && (
          <span 
            key={tech.id} 
            className="bg-[#F6E6FF] text-[#52007C] px-3 py-1 rounded-full text-xs font-medium font-nunito transition-colors hover:bg-[#E6D0FF]"
          >
            {tech.name}
          </span>
        )
      ))}
      {tags.hasMore && (
        <span className="bg-[#F6E6FF] text-[#52007C] px-3 py-1 rounded-full text-xs font-medium font-nunito">
          +{tags.remainingCount} more
        </span>
      )}
    </div>
  );
});

TechnologyTags.displayName = 'TechnologyTags';

// ENTERPRISE: Memoized course thumbnail with fallback
const CourseThumbnail: React.FC<{
  thumbnailUrl: string | null;
  title: string;
  categoryTitle?: string;
  isInactive?: boolean;
  progressPercentage: number;
}> = React.memo(({ thumbnailUrl, title, categoryTitle, isInactive, progressPercentage }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="h-48 overflow-hidden relative">
      {thumbnailUrl && !imageError ? (
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#34137C] to-[#52007C] flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-[#D68BF9] transition-transform duration-300 group-hover:scale-110" />
        </div>
      )}
      
      {/* ENTERPRISE: Enhanced badge display */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        <span className="bg-[#BF4BF6]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold shadow-lg">
          {categoryTitle || 'General'}
        </span>
        {isInactive && (
          <span className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Inactive
          </span>
        )}
      </div>
      
      {/* ENTERPRISE: Enhanced progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white text-sm font-semibold font-nunito">
            Progress: {progressPercentage}%
          </div>
          {progressPercentage === 100 && (
            <div className="flex items-center text-green-400 text-xs font-semibold">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </div>
          )}
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              progressPercentage === 100 
                ? 'bg-gradient-to-r from-green-400 to-green-500' 
                : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
});

CourseThumbnail.displayName = 'CourseThumbnail';

// ENTERPRISE: Memoized course stats component
const CourseStats: React.FC<{
  estimatedTime: number;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}> = React.memo(({ estimatedTime, completedLessons, totalLessons, progressPercentage }) => {
  return (
    <div className="flex justify-between items-center text-[#52007C] text-sm mb-4">
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
        <span className="font-medium font-nunito">{estimatedTime} hours</span>
      </div>
      {progressPercentage === 100 ? (
        <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircle className="w-4 h-4 mr-1.5" />
          <span className="font-semibold text-xs font-nunito">Completed</span>
        </div>
      ) : (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
          <span className="font-medium font-nunito">
            Lessons: {completedLessons}/{totalLessons}
          </span>
        </div>
      )}
    </div>
  );
});

CourseStats.displayName = 'CourseStats';

// ENTERPRISE: Main EnrolledCourseCard component with optimizations
const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ 
  course, 
  onUnenroll, 
  onContinueLearning 
}) => {
  const navigate = useNavigate();
  
  // ENTERPRISE: Memoized course data for better performance
  const courseData = useMemo(() => {
    const progressPercentage = course.progressPercentage || 0;
    const totalLessons = course.totalLessons || course.lessons?.length || 0;
    const completedLessons = course.completedLessons || 0;
    
    return {
      id: course.id,
      title: course.title,
      categoryTitle: course.category?.title,
      estimatedTime: course.estimatedTime || 0,
      totalLessons,
      completedLessons,
      progressPercentage,
      thumbnailUrl: course.thumbnailUrl,
      technologies: course.technologies,
      isInactive: course.isInactive,
      canUnenroll: progressPercentage === 0 // Only allow unenroll if no progress
    };
  }, [course]);
  
  // ENTERPRISE: Enhanced creator name handling with fallbacks
  const creatorName = useMemo(() => {
    if (course.creator?.name && course.creator.name.trim() !== '') {
      return course.creator.name;
    }
    return 'ExcellyGen Team';
  }, [course.creator]);
  
  // ENTERPRISE: Smart button text based on progress
  const buttonConfig = useMemo(() => {
    const { progressPercentage } = courseData;
    
    if (progressPercentage === 0) {
      return { text: 'Start Learning', variant: 'start' };
    } else if (progressPercentage === 100) {
      return { text: 'View Course', variant: 'completed' };
    } else {
      return { text: 'Continue Learning', variant: 'continue' };
    }
  }, [courseData.progressPercentage]);
  
  // ENTERPRISE: Memoized event handlers for better performance
  const handleContinueLearning = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onContinueLearning(courseData.id);
  }, [courseData.id, onContinueLearning]);
  
  const handleUnenrollClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUnenroll(course);
  }, [course, onUnenroll]);
  
  const handleCardClick = useCallback(() => {
    navigate(`/learner/course-view/${courseData.id}`);
  }, [courseData.id, navigate]);

  return (
    <div 
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col cursor-pointer group"
      onClick={handleCardClick}
    >
      <CourseThumbnail 
        thumbnailUrl={courseData.thumbnailUrl}
        title={courseData.title}
        categoryTitle={courseData.categoryTitle}
        isInactive={courseData.isInactive}
        progressPercentage={courseData.progressPercentage}
      />
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[#1B0A3F] font-bold text-lg mb-2 line-clamp-2 font-nunito group-hover:text-[#52007C] transition-colors">
          {courseData.title}
        </h3>
        <div className="flex items-center text-sm text-[#52007C] mb-3">
          <User className="w-4 h-4 mr-2" />
          <span className="font-medium font-nunito">By {creatorName}</span>
        </div>

        {/* ENTERPRISE: Enhanced technology tags */}
        <TechnologyTags technologies={courseData.technologies} maxVisible={3} />
        
        {/* ENTERPRISE: Enhanced course stats */}
        <CourseStats 
          estimatedTime={courseData.estimatedTime}
          completedLessons={courseData.completedLessons}
          totalLessons={courseData.totalLessons}
          progressPercentage={courseData.progressPercentage}
        />
        
        {/* ENTERPRISE: Enhanced action buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* Primary Action Button */}
          <button
            onClick={handleContinueLearning}
            className={`w-full py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg hover:shadow-xl font-nunito text-sm flex items-center gap-2 justify-center ${
              buttonConfig.variant === 'completed'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white'
            }`}
          >
            <span>{buttonConfig.text}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* ENTERPRISE: Conditional Unenroll Button */}
          {courseData.canUnenroll && (
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

        {/* ENTERPRISE: Progress-based info message */}
        {courseData.progressPercentage > 0 && courseData.progressPercentage < 100 && (
          <div className="mt-2 text-xs text-[#52007C] text-center opacity-75 font-nunito">
            Course progress prevents unenrollment
          </div>
        )}
      </div>
    </div>
  );
};

// ENTERPRISE: Export with displayName for better debugging
EnrolledCourseCard.displayName = 'EnrolledCourseCard';

export default React.memo(EnrolledCourseCard);