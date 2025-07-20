// src/features/Coordinator/LearnerListPage/components/CourseList.tsx
import React from 'react';
import { Course } from '../types';
import { Users } from 'lucide-react';
import CourseAccordionItem from './CourseAccordionItem';

interface CourseListProps {
    courses: Course[];
}
interface CourseListProps {
    courses: Course[];
    expandedCourses: Record<string, boolean>;
    toggleCourseExpansion: (courseTitle: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses , expandedCourses, toggleCourseExpansion}) => {
    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users size={48} className="text-[#BF4BF6] mb-4" />
                <p className="text-white text-lg mb-2">No learners found.</p>
                <p className="text-gray-400">No learners match your current search or filter criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {courses.map((course, index) => (
                <CourseAccordionItem
                    key={course.title}
                    course={course}
                    isExpanded={!!expandedCourses[course.title]}
                    onToggle={() => toggleCourseExpansion(course.title)}
                />
            ))}
        </div>
    );
};

export default CourseList;