// features/createNewCourse/components/CourseMaterialsSection.tsx
import React from 'react';
import SubtopicItem from './SubtopicItem';
import { Subtopic } from '../types/types';

interface CourseMaterialsSectionProps {
    subtopics: Subtopic[];
    onSubtopicsChange: React.Dispatch<React.SetStateAction<Subtopic[]>>;
    onAddNewSubtopic: () => void;
    onRemoveSubtopic: (subtopicId: string) => void;
    onSubtopicTitleChange: (subtopicIndex: number, title: string) => void;
    onSubtopicPointsChange: (subtopicIndex: number, points: number) => void;
    onRemoveMaterial: (materialId: string, subtopicIndex: number) => void;
    onAddMaterial: (newMaterial: any, subtopicIndex: number) => void; // Type 'any' to avoid circular dependency, refine later if needed
    onSaveQuizForSubtopic: (subtopicId: string, quizBankData: any) => void; // Type 'any' to avoid circular dependency, refine later if needed
    onSaveOverviewQuizDetails: (subtopicId: string, updatedQuizBank: any) => void; // Type 'any' to avoid circular dependency, refine later if needed
    onRemoveQuiz: (subtopicIndex: number) => void;
    onSetQuizBank: (subtopicIndex: number, quizBank: any) => void; // Type 'any' to avoid circular dependency, refine later if needed
}

const CourseMaterialsSection: React.FC<CourseMaterialsSectionProps> = ({
    subtopics,
    onSubtopicsChange,
    onAddNewSubtopic,
    onRemoveSubtopic,
    onSubtopicTitleChange,
    onSubtopicPointsChange,
    onRemoveMaterial,
    onAddMaterial,
    onSaveQuizForSubtopic,
    onSaveOverviewQuizDetails,
    onRemoveQuiz,
    onSetQuizBank
}) => {

    return (
        <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300 mb-6">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-['Unbounded'] text-white">Course Materials</h2>
                    <button
                        onClick={onAddNewSubtopic}
                        className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm">
                        Add New Subtopic
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4 border-t border-[#BF4BF6]/20">
                    {subtopics.map((subtopic, subtopicIndex) => (
                        <SubtopicItem
                            key={subtopic.id}
                            subtopic={subtopic}
                            subtopicIndex={subtopicIndex}
                            onRemoveSubtopic={onRemoveSubtopic}
                            onSubtopicTitleChange={(title) => onSubtopicTitleChange(subtopicIndex, title)}
                            onSubtopicPointsChange={(points) => onSubtopicPointsChange(subtopicIndex, points)}
                            onRemoveMaterial={onRemoveMaterial}
                            onAddMaterial={onAddMaterial}
                            onSaveQuizForSubtopic={onSaveQuizForSubtopic}
                            onSaveOverviewQuizDetails={onSaveOverviewQuizDetails}
                            onRemoveQuiz={onRemoveQuiz}
                            onSetQuizBank={onSetQuizBank}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseMaterialsSection;