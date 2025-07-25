// src/features/Coordinator/LearnerListPage/components/CourseFilter.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Course } from '../types';

interface CourseFilterProps {
    selectedCourseTitle: string | null;
    courses: Course[];
    onSelectCourse: (courseTitle: string) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({ selectedCourseTitle, courses, onSelectCourse }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(filterSearchTerm.toLowerCase())
    );

    const handleSelect = (courseTitle: string) => {
        onSelectCourse(courseTitle);
        setIsOpen(false);
        setFilterSearchTerm('');
    };

    const getDisplayTitle = () => {
        if (selectedCourseTitle === 'all' || !selectedCourseTitle) {
            return "All Courses";
        }
        return selectedCourseTitle;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6] flex justify-between items-center text-left"
            >
                <span className="truncate">{getDisplayTitle()}</span>
                <ChevronDown className={`w-5 h-5 text-[#BF4BF6] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-full p-2 pl-9 text-sm rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#BF4BF6]"
                                value={filterSearchTerm}
                                onChange={(e) => setFilterSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul>
                        <li
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedCourseTitle === 'all' ? 'font-bold bg-gray-100' : ''}`}
                            onClick={() => handleSelect('all')}
                        >
                            All Courses
                        </li>
                        {filteredCourses.map((course) => (
                            <li
                                key={course.id} // Use unique ID for the key
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 truncate ${selectedCourseTitle === course.title ? 'font-bold bg-gray-100' : ''}`}
                                onClick={() => handleSelect(course.title)}
                                title={course.title}
                            >
                                {course.title}
                            </li>
                        ))}
                        {filteredCourses.length === 0 && (
                            <li className="px-4 py-2 text-gray-500 text-sm italic">
                                No courses found.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CourseFilter;