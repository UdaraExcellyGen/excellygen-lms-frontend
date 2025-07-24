// src/features/Learner/CourseContent/components/CourseGrid.tsx
import React from 'react';
import { LearnerCourseDto } from '../../../../types/course.types'; // Use LearnerCourseDto directly
import AvailableCourseCard from './AvailableCourseCard';
import EnrolledCourseCard from './EnrolledCourseCard';

interface CourseGridProps {
  activeTab: 'courses' | 'learning';
  availableCourses: LearnerCourseDto[]; // Expects LearnerCourseDto[]
  enrolledCourses: LearnerCourseDto[]; // Expects LearnerCourseDto[]
  loading: boolean;
  onEnroll: (courseId: number) => void; // Expects number ID
  onUnenroll: (course: LearnerCourseDto) => void; // Expects LearnerCourseDto
  onContinueLearning: (courseId: number) => void; // Expects number ID
}

const CourseGrid: React.FC<CourseGridProps> = ({
  activeTab,
  availableCourses,
  enrolledCourses,
  loading,
  onEnroll,
  onUnenroll,
  onContinueLearning
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeTab === 'courses' ? (
        availableCourses.length > 0 ? (
          availableCourses.map(course => (
            <AvailableCourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              loading={loading}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito py-10">
            No courses available for this path yet.
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
          <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito py-10">
            You haven't enrolled in any courses for this path yet.
          </div>
        )
      )}
    </div>
  );
};

export default CourseGrid;