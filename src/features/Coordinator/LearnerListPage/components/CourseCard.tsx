// components/CourseCard.tsx
import React from 'react';
import { Course } from '../types';
import LearnerListItem from './LearnerListItem';

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">{course.title}</h2>
            <ul className="divide-y divide-gray-200 shadow overflow-hidden sm:rounded-2xl bg-white">
                {course.students.length > 0 ? (
                    course.students.map((student) => (
                        <LearnerListItem key={student.id} student={student} />
                    ))
                ) : (
                    <li className="px-6 py-4 text-gray-500 italic text-center">
                        No students enrolled in this course yet.
                    </li>
                )}
            </ul>
        </div>
    );
};

export default CourseCard;