// src/features/Coordinator/LearnerListPage/components/LearnerListItem.tsx
import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { Student } from '../types';
import { useNavigate } from 'react-router-dom';

interface LearnerListItemProps {
    student: Student;
}

const LearnerListItem: React.FC<LearnerListItemProps> = ({ student }) => {
    const navigate = useNavigate();

    const handleViewProfileClick = () => {
        if (student.userId) {
            navigate(`/coordinator/view-profile/${student.userId}`);
        } else {
            console.warn("Cannot navigate: User ID is missing for student:", student.name);
        }
    };

    return (
        <li className="px-4 py-3 hover:bg-gray-50/50 transition-colors duration-150">
            <button
                onClick={handleViewProfileClick}
                className="w-full flex items-center justify-between text-left"
                aria-label={`View profile of ${student.name}`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F6E6FF] flex items-center justify-center text-[#52007C]">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">Learner</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
        </li>
    );
};

export default LearnerListItem;