// features/Coordinator/CreateNewCourse/PublishCoursePage/components/SubtopicSection.tsx
import React from 'react';
// Import refined types
import { SubtopicFE } from '../../../../../types/course.types'; // Adjust path
import MaterialItem from './MaterialItem';
import { ChevronDown } from 'lucide-react';

interface SubtopicSectionProps {
    subtopic: SubtopicFE; // Use SubtopicFE
    expandedSubtopics: Record<number, boolean>; // Key is number (lessonId)
    toggleSubtopic: (subtopicId: number) => void; // Use number
     handleDeleteMaterial: (lessonId: number, documentId: number, documentName: string) => void;
    // Quiz related props
    // handleViewQuiz: (quizBank: QuizBank | undefined) => void;
}

const SubtopicSection: React.FC<SubtopicSectionProps> = ({
    subtopic,
    expandedSubtopics,
    toggleSubtopic,
    handleDeleteMaterial,
    // handleViewQuiz,
}) => {
    return (
        <div className="mb-3 bg-[#1B0A3F]/50 rounded-lg p-0.5"> {/* Reduced padding */}
            <button
                onClick={() => toggleSubtopic(subtopic.id)}
                className="w-full flex items-center justify-between p-3 text-white hover:bg-[#1B0A3F]/80 rounded-md transition-colors"
                aria-expanded={expandedSubtopics[subtopic.id]}
            >
                <h4 className="font-semibold font-unbounded text-base">{subtopic.lessonName}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-[#2D1B59] px-2 py-0.5 rounded-full">{subtopic.lessonPoints} pts</span>
                    <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${expandedSubtopics[subtopic.id] ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {expandedSubtopics[subtopic.id] && (
                <div className="space-y-2 mt-2 px-3 pb-3"> {/* Add padding for content */}
                    {subtopic.documents && subtopic.documents.length > 0 ? (
                        subtopic.documents.map((material) => (
                            <MaterialItem
                                key={material.id}
                                lessonId={subtopic.id} // Pass lessonId
                                material={material}
                                handleDeleteMaterial={handleDeleteMaterial}
                                // handleViewQuiz={handleViewQuiz}
                                // subtopic={subtopic}
                            />
                        ))
                    ) : (
                        <div className="text-gray-400 p-3 text-sm font-nunito">
                            No documents added to this subtopic yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicSection;