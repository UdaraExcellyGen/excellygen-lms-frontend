// components/SubtopicItem.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { EditSubtopicData } from '../types';

interface SubtopicItemProps {
    subtopic: string;
    displaySubtopicName: string;
    expandedSubtopics: Record<string, boolean>;
    toggleSubtopic: (subtopicId: string) => void;
    isEditMode: boolean;
    editSubtopics: Record<string, EditSubtopicData>;
    handleEditSubtopicChange: (oldSubtopic: string, newName: string) => void;
    handleEditSubtopicPointsChange: (oldSubtopic: string, newPoints: number) => void;
    subtopicPoints: Record<string, number>;
    children: React.ReactNode;
}

const SubtopicItem: React.FC<SubtopicItemProps> = ({
    subtopic,
    displaySubtopicName,
    expandedSubtopics,
    toggleSubtopic,
    isEditMode,
    editSubtopics,
    handleEditSubtopicChange,
    handleEditSubtopicPointsChange,
    subtopicPoints,
    children
}) => {
    return (
        <div className="mb-2 sm:mb-4">
            <button
                onClick={() => toggleSubtopic(subtopic)}
                className="w-full px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-between text-white hover:bg-[#BF4BF6]/5 transition-colors rounded-md font-nunito"
            >
                <div className="flex items-center justify-between w-full">
                    {isEditMode ? (
                        <input
                            type="text"
                            value={editSubtopics[subtopic]?.name || subtopic}
                            className="w-full p-1 sm:p-2 text-white bg-transparent border-none focus:ring-0 font-semibold font-unbounded text-xs sm:text-sm"
                            placeholder="Subtopic Title"
                            onChange={(e) => handleEditSubtopicChange(subtopic, e.target.value)}
                        />
                    ) : (
                        <h4 className="font-semibold font-unbounded text-xs sm:text-sm md:text-base truncate pr-2">{displaySubtopicName}</h4>
                    )}
                    <div className="flex items-center">
                        {isEditMode ? (
                            <input
                                type="number"
                                value={editSubtopics[subtopic]?.points !== undefined ? String(editSubtopics[subtopic].points) : '0'}
                                className="w-12 sm:w-16 p-1 sm:p-2 text-white bg-transparent border border-[#BF4BF6]/50 rounded-md focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent text-xs sm:text-sm"
                                placeholder="Points"
                                onChange={(e) => {
                                    const pointsValue = parseInt(e.target.value, 10);
                                    handleEditSubtopicPointsChange(subtopic, isNaN(pointsValue) ? 0 : pointsValue);
                                }}
                            />
                        ) : (
                            <span className="text-xs sm:text-sm text-[#D68BF9] font-nunito mr-2 whitespace-nowrap">Points: {subtopicPoints[displaySubtopicName] || 0}</span>
                        )}
                        <ChevronDown
                            className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform ${expandedSubtopics[subtopic] ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
            </button>
            {expandedSubtopics[subtopic] !== false && (
                <div className="space-y-2 mt-2 overflow-x-auto">
                    {children}
                </div>
            )}
        </div>
    );
};

export default SubtopicItem;