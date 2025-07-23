// src/features/Learner/CourseContent/components/CourseGrid.tsx
import React, { useState } from 'react';
import { LearnerCourseDto } from '../../../../types/course.types';
import AvailableCourseCard from './AvailableCourseCard';
import EnrolledCourseCard from './EnrolledCourseCard';
import { AlertTriangle, X } from 'lucide-react';

interface CourseGridProps {
  activeTab: 'courses' | 'learning';
  availableCourses: LearnerCourseDto[];
  enrolledCourses: LearnerCourseDto[];
  loading: boolean;
  onEnroll: (courseId: number) => void;
  onUnenroll: (course: LearnerCourseDto) => void;
  onContinueLearning: (courseId: number) => void;
  onTabChange?: (tab: 'courses' | 'learning') => void;
  categoryStatus?: 'active' | 'inactive';
}

const CourseGrid: React.FC<CourseGridProps> = ({
  activeTab,
  availableCourses,
  enrolledCourses,
  loading,
  onEnroll,
  onUnenroll,
  onContinueLearning,
  onTabChange,
  categoryStatus = 'active',
}) => {
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState<LearnerCourseDto | null>(null);
  const isInactiveCategory = categoryStatus === 'inactive';

  const handleEnroll = async (courseId: number) => {
    await onEnroll(courseId);
    if (onTabChange) {
      onTabChange('learning');
    }
  };

  const handleUnenrollClick = (course: LearnerCourseDto) => {
    setShowUnenrollConfirm(course);
  };

  const confirmUnenroll = () => {
    if (showUnenrollConfirm) {
      onUnenroll(showUnenrollConfirm);
      setShowUnenrollConfirm(null);
    }
  };

  const cancelUnenroll = () => {
    setShowUnenrollConfirm(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'courses' ? (
          availableCourses.length > 0 ? (
            availableCourses.map((course) => (
              <AvailableCourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                loading={loading}
                isInactiveCategory={isInactiveCategory}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito py-10">
              No courses available for this path yet.
            </div>
          )
        ) : (
          enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <EnrolledCourseCard
                key={course.id}
                course={course}
                onContinueLearning={onContinueLearning}
                onUnenrollClick={handleUnenrollClick}
                loading={loading}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-[#D68BF9] text-lg font-nunito py-10">
              You haven't enrolled in any courses for this path yet.
            </div>
          )
        )}
      </div>

      {showUnenrollConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Unenrollment</h3>
                </div>
                <button onClick={cancelUnenroll} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">Are you sure you want to unenroll from this course?</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{showUnenrollConfirm.title}</h4>
                  <p className="text-xs text-gray-500">Your current progress will be lost.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={cancelUnenroll} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={confirmUnenroll} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? 'Unenrolling...' : 'Yes, Unenroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseGrid;