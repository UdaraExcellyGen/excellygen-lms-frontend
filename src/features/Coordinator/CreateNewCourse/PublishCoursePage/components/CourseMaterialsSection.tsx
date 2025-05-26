// features/Coordinator/CreateNewCourse/PublishCoursePage/components/CourseMaterialsSection.tsx
import React from 'react';
import { ChevronDown, FileText } from 'lucide-react';
// Import refined types
import { SubtopicFE } from '../../../../../types/course.types'; // Adjust path
import SubtopicSection from './SubtopicSection';

interface CourseMaterialsSectionProps {
    localSubtopics: SubtopicFE[]; // Use SubtopicFE
    expandedTopics: string[]; // ID string for the main section 'materials'
    setExpandedTopics: React.Dispatch<React.SetStateAction<string[]>>;
    expandedSubtopics: Record<number, boolean>; // Key is number (lessonId) for subtopic expansion
    toggleSubtopic: (subtopicId: number) => void; // Use number
    handleDeleteMaterial: (lessonId: number, documentId: number, documentName: string) => void;
    // Quiz related props
    quizzes: Record<number, any[]>;
    loadingQuizzes: boolean;
    handleViewQuiz: (lessonId: number) => void;
    isEditMode?: boolean;
    onEditQuiz?: (lessonId: number) => void;
    onRemoveQuiz?: (lessonId: number) => void;
    showQuizOverviewPage: any | null;
    handleCloseQuizOverview: () => void;
    handleSaveOverviewQuizDetails: (updatedQuizBank: any) => void;
    courseId?: number;
    isLearnerView?: boolean;
}

const CourseMaterialsSection: React.FC<CourseMaterialsSectionProps> = ({
    localSubtopics,
    expandedTopics,
    setExpandedTopics,
    expandedSubtopics,
    toggleSubtopic,
    handleDeleteMaterial,
    quizzes,
    loadingQuizzes,
    handleViewQuiz,
    isEditMode = false,
    onEditQuiz,
    onRemoveQuiz,
    showQuizOverviewPage,
    handleCloseQuizOverview,
    handleSaveOverviewQuizDetails,
    courseId,
    isLearnerView = false,
}) => {
    const toggleSection = (sectionId: string) => {
        setExpandedTopics(prev =>
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
        );
    };

    return (
        <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300">
            <button
                onClick={() => toggleSection('materials')}
                className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-[#BF4BF6]/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center relative font-nunito">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-unbounded font-bold">
                            Course Materials (Lessons & Documents)
                        </h3>
                        <p className="text-sm text-[#D68BF9] font-nunito">
                            Review uploaded documents, subtopics, and quizzes.
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${
                        expandedTopics.includes('materials') ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {expandedTopics.includes('materials') && (
                <div className="px-6 py-4 space-y-3 border-t border-[#BF4BF6]/20">
                    {loadingQuizzes && (
                        <div className="text-white text-center p-2 font-nunito italic">
                            Loading quizzes...
                        </div>
                    )}
                    
                    {localSubtopics && localSubtopics.length > 0 ? (
                        localSubtopics.map((subtopic: SubtopicFE) => (
                            <SubtopicSection
                                key={subtopic.id}
                                subtopic={subtopic}
                                expandedSubtopics={expandedSubtopics}
                                toggleSubtopic={toggleSubtopic}
                                handleDeleteMaterial={handleDeleteMaterial}
                                quizzes={quizzes}
                                handleViewQuiz={handleViewQuiz}
                                isEditMode={isEditMode}
                                onEditQuiz={onEditQuiz}
                                onRemoveQuiz={onRemoveQuiz}
                                courseId={courseId}
                                isLearnerView={isLearnerView}
                            />
                        ))
                    ) : (
                        <div className="text-white text-center p-4 font-nunito">
                            No materials or subtopics have been added for this course yet.
                            Please go back to the "Upload Materials" step to add content.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseMaterialsSection;