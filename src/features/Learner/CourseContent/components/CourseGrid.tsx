// src/features/Learner/CourseContent/components/CourseGrid.tsx
// ENTERPRISE OPTIMIZED: Enhanced with processing states and better error handling
import React from 'react';
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
  processingEnrollments?: Set<number>; // ENTERPRISE: Added processing states
}

const CourseGrid: React.FC<CourseGridProps> = ({
  activeTab,
  availableCourses,
  enrolledCourses,
  onEnroll,
  onUnenroll,
  onContinueLearning,
  processingEnrollments = new Set() // ENTERPRISE: Default value
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {activeTab === 'courses' ? (
        availableCourses.length > 0 ? (
          availableCourses.map(course => (
            <AvailableCourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              isProcessing={processingEnrollments.has(course.id)} // ENTERPRISE: Pass processing state
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 border border-[#BF4BF6]/20 shadow-lg">
              <div className="text-[#52007C] text-lg font-semibold mb-2">
                No courses available for this category yet
              </div>
              <div className="text-[#52007C]/70 text-sm">
                Check back later or explore other categories
              </div>
            </div>
          </div>
        )
      ) : (
        enrolledCourses.length > 0 ? (
          enrolledCourses.map(course => (
            <EnrolledCourseCard
              key={course.id}
              course={course}
              onUnenroll={onUnenroll}
              onContinueLearning={onContinueLearning}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 border border-[#BF4BF6]/20 shadow-lg">
              <div className="text-[#52007C] text-lg font-semibold mb-2">
                You haven't enrolled in any courses for this category yet
              </div>
              <div className="text-[#52007C]/70 text-sm">
                Switch to "Available Courses" to start learning
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CourseGrid;