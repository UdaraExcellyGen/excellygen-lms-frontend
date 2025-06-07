
// LearnerListPage/components/LearnerListItem.tsx
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Student } from '../types';
import { useNavigate } from 'react-router-dom'; 

interface LearnerListItemProps {
    student: Student;
}

const LearnerListItem: React.FC<LearnerListItemProps> = ({ student }) => {
    const navigate = useNavigate();

    
        const handleViewProfileClick = () => {
        if (student.userId) {
            navigate(`/learner/${student.userId}`); 
        } else {
            console.warn("Cannot navigate: User ID is missing for student:", student.name);
        }
    };

    return (
        <li className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-700">{student.name}</p>
                <button 
                    onClick={handleViewProfileClick} 
                    className="text-indigo-500 hover:text-indigo-700 font-semibold transition-colors duration-150 focus:outline-none flex items-center rounded-xl"
                    aria-label={`View profile of ${student.name}`} 
                >
                    View Profile <FiArrowRight className="ml-2" />
                </button>
            </div>
        </li>
    );
};

export default LearnerListItem;