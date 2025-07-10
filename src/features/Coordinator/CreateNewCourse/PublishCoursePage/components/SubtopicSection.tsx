// features/Coordinator/CreateNewCourse/PublishCoursePage/components/SubtopicSection.tsx
import React from 'react';
// Import refined types
import { SubtopicFE } from '../../../../../types/course.types'; // Adjust path
import MaterialItem from './MaterialItem';
import QuizItem from './QuizItem'; // Add import for new component
import { ChevronDown, BookCheck } from 'lucide-react';

interface SubtopicSectionProps {
    subtopic: SubtopicFE; // Use SubtopicFE
    expandedSubtopics: Record<number, boolean>; // Key is number (lessonId)
    toggleSubtopic: (subtopicId: number) => void; // Use number
    handleDeleteMaterial: (lessonId: number, documentId: number, documentName: string) => void;
    // Quiz related props
    quizzes?: Record<number, any[]>;
    handleViewQuiz?: (lessonId: number) => void;
    isEditMode?: boolean;
    onEditQuiz?: (lessonId: number) => void;
    onRemoveQuiz?: (lessonId: number) => void;
    courseId?: number;
    isLearnerView?: boolean;
}

const SubtopicSection: React.FC<SubtopicSectionProps> = ({
    subtopic,
    expandedSubtopics,
    toggleSubtopic,
    handleDeleteMaterial,
    quizzes,
    handleViewQuiz,
    isEditMode = false,
    onEditQuiz,
    onRemoveQuiz,
    courseId,
    isLearnerView = false
}) => {
    // Check if this subtopic has a quiz
    const hasQuiz = quizzes && quizzes[subtopic.id] && quizzes[subtopic.id].length > 0;
    const quiz = hasQuiz ? quizzes[subtopic.id][0] : null;

    return (
        <div className="mb-3 border border-[#52007C] rounded-lg p-0.5"> {/* Reduced padding */}
            <button
                onClick={() => toggleSubtopic(subtopic.id)}
                className="w-full flex items-center justify-between p-3 text-[#1B0A3F] hover:bg-white/30 rounded-md transition-colors"
                aria-expanded={expandedSubtopics[subtopic.id]}
            >
                <h4 className="font-semibold font-unbounded text-base">{subtopic.lessonName}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#1B0A3F] text-bold border border-[#52007C] px-2 py-0.5 rounded-full">{subtopic.lessonPoints} Points</span>
                    {hasQuiz && (
                        <span className="text-xs text-purple-400 bg-[#2D1B59] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BookCheck size={12} />
                            Quiz
                        </span>
                    )}
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
                            />
                        ))
                    ) : (
                        <div className="text-gray-400 p-3 text-sm font-nunito">
                            No documents added to this subtopic yet.
                        </div>
                    )}

                    {/* Display quiz if available */}
                    {hasQuiz && handleViewQuiz && (
                        <QuizItem
                            lessonId={subtopic.id}
                            quiz={quiz}
                            handleViewQuiz={handleViewQuiz}
                            isEditMode={isEditMode}
                            onEditQuiz={onEditQuiz}
                            onRemoveQuiz={onRemoveQuiz}
                            courseId={courseId}
                            isLearnerView={isLearnerView}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicSection;