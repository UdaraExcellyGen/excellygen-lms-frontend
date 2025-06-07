import React from 'react';
import { BookOpen, Award } from 'lucide-react';
import { Course } from '../types/types';

interface CoursesSectionProps {
  courses: Course[];
}

const CoursesSection: React.FC<CoursesSectionProps> = ({ courses }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Completed Courses</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course, index) => (
          <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800 text-sm">{course.title}</h4>
              {course.certificate && (
                <Award size={16} className="text-purple-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-purple-600 text-sm font-medium mb-2">{course.provider}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Duration: {course.duration}</span>
              <span>Completed: {new Date(course.completionDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoursesSection;