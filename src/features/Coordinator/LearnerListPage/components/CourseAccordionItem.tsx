// src/features/Coordinator/LearnerListPage/components/CourseAccordionItem.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Course } from '../types';
import LearnerListItem from './LearnerListItem';

interface CourseAccordionItemProps {
    course: Course;
    isExpanded: boolean;
    onToggle: () => void;
}

const CourseAccordionItem: React.FC<CourseAccordionItemProps> = ({ course, isExpanded, onToggle }) => {
    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between text-[#1B0A3F] hover:bg-gray-200/50 transition-colors"
                aria-expanded={isExpanded}
            >
                <h2 className="text-xl text-[#1B0A3F]/90 text-left">{course.title}</h2>
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium text-gray-600">
                        {course.students.length} Learner(s)
                    </span>
                    <ChevronDown
                        className={`w-6 h-6 text-[#BF4BF6] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {isExpanded && (
                <div className="px-2 pb-2">
                    <ul className="divide-y divide-gray-200/70">
                        {course.students.length > 0 ? (
                            course.students.map((student) => (
                                <LearnerListItem key={student.id} student={student} />
                            ))
                        ) : (
                            <li className="px-6 py-4 text-gray-500 italic text-center">
                                No students found for this course.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CourseAccordionItem;