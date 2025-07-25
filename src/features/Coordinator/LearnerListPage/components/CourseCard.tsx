// src/features/Coordinator/LearnerListPage/components/CourseCard.tsx
import React from 'react';
import { Course } from '../types';
import LearnerListItem from './LearnerListItem';

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">{course.title}</h2>
            <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20">
                <ul className="divide-y divide-gray-200">
                    {course.students.length > 0 ? (
                        course.students.map((student) => (
                            <LearnerListItem key={student.id} student={student} />
                        ))
                    ) : (
                        <li className="px-6 py-4 text-gray-500 italic text-center">
                            No students found for this course matching your search.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CourseCard;