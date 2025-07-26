// src/features/Learner/CourseContent/components/CourseGrid.tsx
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
}

const CourseGrid: React.FC<CourseGridProps> = ({
  activeTab,
  availableCourses,
  enrolledCourses,
  onEnroll,
  onUnenroll,
  onContinueLearning
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