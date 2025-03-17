// features/createNewCourse/components/SubtopicSection.tsx
import React from 'react';
import { QuizBank, Subtopic } from '../../../courseCoordinator/courses/CourseContext';
import MaterialItem from './MaterialItem';
import {
    ChevronDown
} from 'lucide-react';

interface SubtopicSectionProps {
    subtopic: Subtopic;
    expandedSubtopics: Record<string, boolean>;
    toggleSubtopic: (subtopicId: string) => void;
    handleDeleteMaterial: (materialId: string) => void;
    handleViewQuiz: (quizBank: QuizBank | undefined) => void;
}

const SubtopicSection: React.FC<SubtopicSectionProps> = ({
    subtopic,
    expandedSubtopics,
    toggleSubtopic,
    handleDeleteMaterial,
    handleViewQuiz,
}) => {
    return (
        <div className="mb-4">
            <div className="bg-[#1B0A3F]/60 rounded-lg p-4 flex justify-between items-center">
                <button
                    onClick={() => toggleSubtopic(subtopic.id)}
                    className="flex items-center gap-2 text-white hover:text-[#D68BF9] transition-colors w-full text-left"
                >
                    <h4 className="font-semibold font-unbounded">{subtopic.title}</h4>
                    <ChevronDown
                        className={`w-4 h-4 transform transition-transform ${expandedSubtopics[subtopic.id] ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {expandedSubtopics[subtopic.id] && (
                <div className="space-y-2 mt-2 pl-4">
                    {subtopic.materials && subtopic.materials.length > 0 ? (
                        subtopic.materials.map((material) => (
                            <MaterialItem
                                key={material.id}
                                material={material}
                                handleDeleteMaterial={handleDeleteMaterial}
                                handleViewQuiz={handleViewQuiz}
                                subtopic={subtopic} // Pass subtopic for quiz context if needed in MaterialItem
                            />
                        ))
                    ) : (
                        <div className="text-white p-4 font-nunito">
                            No materials added to this subtopic yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicSection;