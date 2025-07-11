import React from 'react';
import { ProfileCourse } from '../types/types';

interface CoursesSectionProps {
  courses: ProfileCourse[];
}

const CoursesSection: React.FC<CoursesSectionProps> = ({ courses }) => {
  return (
    <section className="mb-4">
      <div className="bg-blue-900 text-white p-2 mb-3">
        <h3 className="text-base font-bold">Completed Courses</h3>
      </div>
      <div className="bg-white">
        {courses.map((course, index) => (
          <div key={index} className="border-l-4 border-blue-900 p-4 mb-3 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm mb-1">{course.title}</h4>
                <p className="text-blue-900 text-xs font-medium mb-2">{course.provider}</p>
                <div className="text-xs text-gray-600">
                  <p className="mb-1"><span className="font-bold">Duration:</span> {course.duration}</p>
                  <p><span className="font-bold">Completed:</span> {new Date(course.completionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoursesSection;
