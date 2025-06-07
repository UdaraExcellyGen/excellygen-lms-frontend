// components/Header.tsx
import React from 'react';
import CourseFilter from './CourseFilter';
import { Course } from '../types';
import { FiArrowLeft } from 'react-icons/fi';

interface HeaderProps {
    selectedCourseTitle: string | null;
    courses: Course[];
    onCourseFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleNavigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCourseTitle, courses, onCourseFilterChange,handleNavigate, }) => {
    return (
        <header className="bg-white shadow-md py-6 rounded-2xl mt-4">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-indigo mb-4 md:mb-0 flex items-center"><span className="mr-2"></span>
                <button
                        onClick={() => handleNavigate('/coordinator/dashboard')}
                        className="mr-2 p-1 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150"
                        aria-label="Go back to dashboard" // For accessibility
                    >
                        <FiArrowLeft className="h-6 w-6 text-indigo" />
                    </button>
                
                Enrolled Learners by Course</h1>
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