// components/LearnerListItem.tsx
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Student } from '../types';

interface LearnerListItemProps {
    student: Student;
}

const LearnerListItem: React.FC<LearnerListItemProps> = ({ student }) => {
    return (
        <li className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-700">{student.name}</p>
                <button className="text-indigo-500 hover:text-indigo-700 font-semibold transition-colors duration-150 focus:outline-none flex items-center rounded-xl">
                    View Profile <FiArrowRight className="ml-2" />
                </button>
            </div>
        </li>
    );
};

export default LearnerListItem;