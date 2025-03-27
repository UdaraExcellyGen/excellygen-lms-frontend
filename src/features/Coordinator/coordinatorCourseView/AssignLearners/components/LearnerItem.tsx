// features/Mainfolder/AssignLearners/components/LearnerItem.tsx
import React from 'react';
import { Learner } from '../types/learner';

interface LearnerItemProps {
    learner: Learner;
    isSelected: boolean;
    onLearnerSelect: (learnerId: number) => void;
}

const LearnerItem: React.FC<LearnerItemProps> = ({ learner, isSelected, onLearnerSelect }) => {
    return (
        <li key={learner.id} className="relative rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-pale-purple-100">
            <label
                htmlFor={`learner-${learner.id}`}
                className={`block p-4 rounded-xl cursor-pointer hover:bg-pale-purple-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-french-violet ${isSelected ? 'bg-pale-purple-100 border border-french-violet' : ''}`}
            >
                <input
                    type="checkbox"
                    id={`learner-${learner.id}`}
                    className="sr-only peer" // Screen reader only, hidden visually
                    checked={isSelected}
                    onChange={() => onLearnerSelect(learner.id)}
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-timberwolf-200 flex items-center justify-center overflow-hidden">
                            {learner.profilePicUrl ? (
                                <img
                                    src={learner.profilePicUrl}
                                    alt={`${learner.name}'s Profile Picture`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-base font-semibold text-gunmetal font-primary">{learner.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="text-gunmetal font-medium peer-checked:text-french-violet transition-colors duration-200">{learner.name}</span>
                    </div>
                    <div className="peer-checked:block hidden transition-opacity duration-200">
                        <svg className="h-6 w-6 text-french-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
            </label>
        </li>
    );
};

export default LearnerItem;