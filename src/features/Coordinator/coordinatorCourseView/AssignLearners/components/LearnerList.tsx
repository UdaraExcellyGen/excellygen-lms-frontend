// features/Mainfolder/AssignLearners/components/LearnerList.tsx
import React from 'react';
import { Learner } from '../types/learner';
import LearnerItem from './LearnerItem';

interface LearnerListProps { // Renamed from original answer to fix the reported type error.
    filteredLearners: Learner[];
    searchTerm: string;
    learners: Learner[];
    selectedLearnerIds: number[];
    handleLearnerSelection: (learnerId: number) => void;
}

const LearnerList: React.FC<LearnerListProps> = ({ filteredLearners, searchTerm, learners, selectedLearnerIds, handleLearnerSelection }) => {
    return (
        <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredLearners.map(learner => (
                <LearnerItem
                    key={learner.id}
                    learner={learner}
                    isSelected={selectedLearnerIds.includes(learner.id)}
                    onLearnerSelect={handleLearnerSelection}
                />
            ))}
            {filteredLearners.length === 0 && searchTerm !== '' && (
                <li className="text-timberwolf py-2 px-4">No learners found matching "{searchTerm}".</li>
            )}
            {learners.length > 0 && filteredLearners.length === 0 && searchTerm === '' && (
                 <li className="text-timberwolf py-2 px-4">Start typing to search learners.</li>
            )}
             {learners.length === 0 && (
                 <li className="text-timberwolf py-2 px-4">No learners available.</li>
            )}
        </ul>
    );
};

export default LearnerList;