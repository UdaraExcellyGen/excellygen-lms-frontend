// components/CourseList.tsx
import React from 'react';
import CourseCard from './CourseCard';
import { Course } from '../types';

interface CourseListProps {
    courses: Course[];
    selectedCourseTitle: string | null;
    searchTerm: string;
}

const CourseList: React.FC<CourseListProps> = ({ courses, selectedCourseTitle, searchTerm }) => {
    if (courses.length === 0) {
        return (
            <div className="text-center py-12 text-gray-600 italic rounded-sxl">
                {selectedCourseTitle && selectedCourseTitle !== 'all' && searchTerm === '' ? `No students found for course "${selectedCourseTitle}"` :
                    searchTerm !== '' ? `No courses or learners found matching "${searchTerm}"` : "No courses with enrolled students found."}
            </div>
        );
    }

    return (
        <>
            {courses.map((course, index) => (
                <CourseCard key={index} course={course} />
            ))}
        </>
    );
};

export default CourseList;