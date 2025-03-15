
import React from 'react';
import { Subtopic } from '../types/course';
import { ChevronDown, X } from 'lucide-react';

interface SubtopicItemHeaderProps {
    subtopic: Subtopic;
    subtopicIndex: number;
    expandedSubtopics: Record<string, boolean>;
    hidePointSection: boolean;
    toggleSubtopic: () => void;
    handleSubtopicTitleChange: (e: React.ChangeEvent<HTMLInputElement>, subtopicIndex: number) => void;
    handleSubtopicPointsChange: (e: React.ChangeEvent<HTMLInputElement>, subtopicIndex: number) => void;
    handleRemoveSubtopic: () => void;
}

const SubtopicItemHeader: React.FC<SubtopicItemHeaderProps> = ({
    subtopic,
    subtopicIndex,
    expandedSubtopics,
    hidePointSection,
    toggleSubtopic,
    handleSubtopicTitleChange,
    handleSubtopicPointsChange,
    handleRemoveSubtopic
}) => {
    return (
        <div className="bg-[#1B0A3F]/60 rounded-lg p-4">
            <div className="flex justify-between items-center">
                <button
                    onClick={toggleSubtopic}
                    className="flex items-center gap-2 text-white hover:text-[#D68BF9] transition-colors w-full text-left"
                >
                    <input
                        type="text"
                        placeholder="New Sub Topic"
                        className="bg-transparent border-none outline-none font-['Unbounded'] text-white w-full"
                        value={subtopic.title}
                        onChange={(e) => handleSubtopicTitleChange(e, subtopicIndex)}
                    />
                    <ChevronDown
                        className={`w-4 h-4 transform transition-transform ${expandedSubtopics[subtopic.id] ? 'rotate-180' : ''}`}
                    />
                </button>
                <button
                    onClick={handleRemoveSubtopic}
                    className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center"
                >
                    <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
            </div>

            {!hidePointSection && (
                <div className="flex items-center gap-4 justify-end mt-2">
                    <label htmlFor={`subtopicPoints-${subtopic.id}`} className="text-sm font-['Nunito_Sans'] text-white">
                        Points:
                    </label>
                    <input
                        type="number"
                        id={`subtopicPoints-${subtopic.id}`}
                        min="1"
                        max="100"
                        className="w-16 text-sm p-1 bg-[#2D1B59] text-white rounded border border-gray-600"
                        value={subtopic.subtopicPoints}
                        onChange={(e) => handleSubtopicPointsChange(e, subtopicIndex)}
                    />
                </div>
            )}
        </div>
    );
};

export default SubtopicItemHeader;