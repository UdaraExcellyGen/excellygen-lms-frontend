// src/features/Learner/CourseContent/components/CourseGrid.tsx
// ENTERPRISE OPTIMIZED: Fixed key duplication and enhanced performance
import React, { useMemo } from 'react';
import { BookOpen, Users, Search } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';
import AvailableCourseCard from './AvailableCourseCard';
import EnrolledCourseCard from './EnrolledCourseCard';

interface CourseGridProps {
  activeTab: 'courses' | 'learning';
  availableCourses: LearnerCourseDto[];
  enrolledCourses: LearnerCourseDto[];
  onEnroll: (courseId: number) => void;
  onUnenroll: (course: LearnerCourseDto) => void;
  onContinueLearning: (courseId: number) => void;
  processingEnrollments: Set<number>;
}

// ENTERPRISE: Memoized empty state component
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}> = React.memo(({ icon, title, message, actionText, onAction }) => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center border border-[#BF4BF6]/20 shadow-lg">
    <div className="mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-[#1B0A3F] mb-3 font-nunito">{title}</h3>
    <p className="text-[#52007C] mb-6 font-nunito max-w-md mx-auto">{message}</p>
    {actionText && onAction && (
      <button 
        onClick={onAction}
        className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 font-nunito"
      >
        {actionText}
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// ENTERPRISE: Main CourseGrid component with optimizations
const CourseGrid: React.FC<CourseGridProps> = ({
  activeTab,
  availableCourses,
  enrolledCourses,
  onEnroll,
  onUnenroll,
  onContinueLearning,
  processingEnrollments
}) => {
  
  // ENTERPRISE: Memoized course validation and deduplication
  const validatedCourses = useMemo(() => {
    // Ensure no course appears in both arrays (additional safety check)
    const enrolledIds = new Set(enrolledCourses.map(course => course.id));
    const cleanAvailableCourses = availableCourses.filter(course => !enrolledIds.has(course.id));
    
    console.log('🔍 CourseGrid validation:', {
      originalAvailable: availableCourses.length,
      cleanedAvailable: cleanAvailableCourses.length,
      enrolled: enrolledCourses.length,
      duplicatesRemoved: availableCourses.length - cleanAvailableCourses.length
    });
    
    return {
      available: cleanAvailableCourses,
      enrolled: enrolledCourses
    };
  }, [availableCourses, enrolledCourses]);

  // ENTERPRISE: Memoized empty states
  const EmptyAvailableCourses = useMemo(() => (
    <EmptyState
      icon={<BookOpen className="w-16 h-16 text-[#BF4BF6] mx-auto" />}
      title="No Available Courses"
      message="There are currently no available courses in this category. Check back later for new content!"
    />
  ), []);

  const EmptyEnrolledCourses = useMemo(() => (
    <EmptyState
      icon={<Users className="w-16 h-16 text-[#BF4BF6] mx-auto" />}
      title="No Enrolled Courses"
      message="You haven't enrolled in any courses in this category yet. Start your learning journey by enrolling in available courses!"
    />
  ), []);

  const EmptySearchResults = useMemo(() => (
    <EmptyState
      icon={<Search className="w-16 h-16 text-[#BF4BF6] mx-auto" />}
      title="No Courses Found"
      message="No courses match your search criteria. Try adjusting your search terms or filters."
    />
  ), []);

  // ENTERPRISE: Memoized course grids with unique keys
  const AvailableCoursesGrid = useMemo(() => {
    if (validatedCourses.available.length === 0) {
      return EmptyAvailableCourses;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {validatedCourses.available.map((course) => (
          <AvailableCourseCard
            key={`available-${course.id}`} // ENTERPRISE: Unique key prefix
            course={course}
            onEnroll={onEnroll}
            isProcessing={processingEnrollments.has(course.id)}
          />
        ))}
      </div>
    );
  }, [validatedCourses.available, onEnroll, processingEnrollments, EmptyAvailableCourses]);

  const EnrolledCoursesGrid = useMemo(() => {
    if (validatedCourses.enrolled.length === 0) {
      return EmptyEnrolledCourses;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {validatedCourses.enrolled.map((course) => (
          <EnrolledCourseCard
            key={`enrolled-${course.id}`} // ENTERPRISE: Unique key prefix
            course={course}
            onUnenroll={onUnenroll}
            onContinueLearning={onContinueLearning}
          />
        ))}
      </div>
    );
  }, [validatedCourses.enrolled, onUnenroll, onContinueLearning, EmptyEnrolledCourses]);

  // ENTERPRISE: Determine which grid to show
  const shouldShowSearchEmpty = useMemo(() => {
    const hasSearchQuery = availableCourses.length === 0 && enrolledCourses.length === 0;
    return hasSearchQuery && (availableCourses.length > 0 || enrolledCourses.length > 0);
  }, [availableCourses, enrolledCourses]);

  // ENTERPRISE: Main render logic
  if (shouldShowSearchEmpty) {
    return EmptySearchResults;
  }

  if (activeTab === 'courses') {
    return AvailableCoursesGrid;
  }

  return EnrolledCoursesGrid;
};

// ENTERPRISE: Export with displayName for better debugging
CourseGrid.displayName = 'CourseGrid';

export default React.memo(CourseGrid);