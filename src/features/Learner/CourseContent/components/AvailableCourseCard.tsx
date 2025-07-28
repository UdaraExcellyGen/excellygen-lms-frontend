// src/features/Learner/CourseContent/components/AvailableCourseCard.tsx
// ENTERPRISE OPTIMIZED: Enhanced with processing states, better UX, and performance optimizations
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen, Users, ArrowRight, Loader2, Star } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';

interface AvailableCourseCardProps {
  course: LearnerCourseDto;
  onEnroll: (courseId: number) => void;
  isProcessing?: boolean; // ENTERPRISE: Added processing state
}

// ENTERPRISE: Memoized technology tags component for better performance
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

// ENTERPRISE: Memoized course stats component
const CourseStats: React.FC<{
  estimatedTime: number;
  totalLessons: number;
  activeLearnersCount: number;
  status?: string;
}> = React.memo(({ estimatedTime, totalLessons, activeLearnersCount, status }) => {
  return (
    <>
      <div className="flex justify-between items-center text-[#52007C] text-sm mb-3">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
          <span className="font-medium font-nunito">{estimatedTime} hours</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
          <span className="font-medium font-nunito">
            Lessons: {totalLessons}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-[#52007C] text-sm mb-4">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
          <span className="font-medium font-nunito">
            Enrolled: {activeLearnersCount}
          </span>
        </div>
        {status && (
          <div className="flex items-center">
            <span className="text-green-600 font-semibold text-xs bg-green-100 px-2 py-1 rounded-full font-nunito">
              Published
            </span>
          </div>
        )}
      </div>
    </>
  );
});

CourseStats.displayName = 'CourseStats';

// ENTERPRISE: Memoized thumbnail component with fallback
const CourseThumbnail: React.FC<{
  thumbnailUrl: string | null;
  title: string;
  categoryTitle?: string;
}> = React.memo(({ thumbnailUrl, title, categoryTitle }) => {
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
      <div className="absolute top-3 right-3 bg-[#BF4BF6]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold shadow-lg">
        {categoryTitle || 'General'}
      </div>
    </div>
  );
});

CourseThumbnail.displayName = 'CourseThumbnail';

// ENTERPRISE: Main AvailableCourseCard component with optimizations
const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  course, 
  onEnroll,
  isProcessing = false // ENTERPRISE: Default value
}) => {
  const navigate = useNavigate();
  const [isLocalEnrolling, setIsLocalEnrolling] = useState(false);
  
  // ENTERPRISE: Enhanced creator name handling with fallbacks
  const creatorName = useMemo(() => {
    if (course.creator?.name && course.creator.name.trim() !== '') {
      return course.creator.name;
    }
    return 'ExcellyGen Team';
  }, [course.creator]);
  
  // ENTERPRISE: Memoized course data for better performance
  const courseData = useMemo(() => ({
    id: course.id,
    title: course.title,
    categoryTitle: course.category?.title,
    estimatedTime: course.estimatedTime || 0,
    totalLessons: course.totalLessons || course.lessons?.length || 0,
    activeLearnersCount: course.activeLearnersCount || 0,
    status: course.status,
    thumbnailUrl: course.thumbnailUrl,
    technologies: course.technologies
  }), [course]);
  
  // ENTERPRISE: Enhanced enrollment handling with local state management
  const handleEnrollClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocalEnrolling || isProcessing) return;
    
    setIsLocalEnrolling(true);
    try {
      await onEnroll(courseData.id);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsLocalEnrolling(false);
    }
  }, [courseData.id, onEnroll, isLocalEnrolling, isProcessing]);
  
  const handleViewCourseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/learner/course-preview/${courseData.id}`);
  }, [courseData.id, navigate]);
  
  const handleCardClick = useCallback(() => {
    navigate(`/learner/course-preview/${courseData.id}`);
  }, [courseData.id, navigate]);
  
  // ENTERPRISE: Combined processing state
  const isEnrollmentInProgress = isLocalEnrolling || isProcessing;

  // ENTERPRISE: Memoize button content to prevent unnecessary re-renders
  const enrollButtonContent = useMemo(() => {
    if (isEnrollmentInProgress) {
      return (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Enrolling...
        </>
      );
    }
    return (
      <>
        <span>Enroll Now</span>
        <ArrowRight className="w-4 h-4" />
      </>
    );
  }, [isEnrollmentInProgress]);

  return (
    <div 
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col cursor-pointer group"
      onClick={handleCardClick}
    >
      <CourseThumbnail 
        thumbnailUrl={courseData.thumbnailUrl}
        title={courseData.title}
        categoryTitle={courseData.categoryTitle}
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
          totalLessons={courseData.totalLessons}
          activeLearnersCount={courseData.activeLearnersCount}
          status={courseData.status}
        />
        
        {/* ENTERPRISE: Enhanced action buttons with processing states */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* View Course Button */}
          <button
            onClick={handleViewCourseClick}
            disabled={isEnrollmentInProgress}
            className="w-full bg-[#F6E6FF] hover:bg-[#E6D0FF] text-[#52007C] py-2.5 rounded-full text-sm flex items-center gap-2 transition-all duration-300 justify-center border border-[#BF4BF6]/20 hover:border-[#BF4BF6]/40 font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View Course</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* ENTERPRISE: Enhanced Enroll Button with processing states */}
          <button
            onClick={handleEnrollClick}
            disabled={isEnrollmentInProgress}
            className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg hover:shadow-xl font-nunito text-sm flex items-center gap-2 justify-center"
          >
            {enrollButtonContent}
          </button>
        </div>
      </div>
    </div>
  );
};

// ENTERPRISE: Export with displayName for better debugging
AvailableCourseCard.displayName = 'AvailableCourseCard';

export default React.memo(AvailableCourseCard);