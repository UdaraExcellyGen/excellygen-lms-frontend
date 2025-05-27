// components/Header.tsx
import React from 'react';
import CourseFilter from './CourseFilter';
import { Course } from '../types';

interface HeaderProps {
    selectedCourseTitle: string | null;
    courses: Course[];
    onCourseFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCourseTitle, courses, onCourseFilterChange }) => {
    return (
        <header className="bg-white shadow-md py-6 rounded-2xl mt-4">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-indigo mb-4 md:mb-0 flex items-center"><span className="mr-2"></span>Enrolled Learners by Course</h1>
                <div className="flex items-center space-x-4">
                    <CourseFilter
                        selectedCourseTitle={selectedCourseTitle}
                        courses={courses}
                        onChange={onCourseFilterChange}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;