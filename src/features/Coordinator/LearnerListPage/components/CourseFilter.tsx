// components/CourseFilter.tsx
import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Course } from '../types';

interface CourseFilterProps {
    selectedCourseTitle: string | null;
    courses: Course[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({ selectedCourseTitle, courses, onChange }) => {
    return (
        <div className="relative">
            <select
                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:border-indigo-500"
                id="course-filter"
                value={selectedCourseTitle || 'all'}
                onChange={onChange}
            >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                    <option key={course.title} value={course.title}>{course.title}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FiChevronDown className="fill-current h-4 w-4" />
            </div>
        </div>
    );
};

export default CourseFilter;
