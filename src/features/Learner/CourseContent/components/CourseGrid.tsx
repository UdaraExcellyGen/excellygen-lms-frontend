import React from 'react';
import { Course } from '../types/Course';
import AvailableCourseCard from './AvailableCourseCard';
import EnrolledCourseCard from './EnrolledCourseCard';

interface CourseGridProps {
  activeTab: 'courses' | 'learning';
  availableCourses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  onEnroll: (courseId: string) => void;
  onUnenroll: (course: Course) => void;
  onContinueLearning: (courseId: string) => void;
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
          <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito">
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
          <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito">
            You haven't enrolled in any courses for this path yet.
          </div>
        )
      )}
    </div>
  );
};

export default CourseGrid;