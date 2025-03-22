// features/createNewCourse/components/CourseMaterialsSection.tsx
import React from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { Subtopic, QuizBank, MaterialFile } from '../../../contexts/CourseContext';
import SubtopicSection from './SubtopicSection';

interface CourseMaterialsSectionProps {
    localSubtopics: Subtopic[];
    expandedTopics: string[];
    setExpandedTopics: React.Dispatch<React.SetStateAction<string[]>>;
    expandedSubtopics: Record<string, boolean>;
    setExpandedSubtopics: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    toggleSubtopic: (subtopicId: string) => void;
    handleDeleteMaterial: (materialId: string) => void;
    handleViewQuiz: (quizBank: QuizBank | undefined) => void;
    showQuizOverviewPage: QuizBank | null;
    handleCloseQuizOverview: () => void;
    handleSaveOverviewQuizDetails: (updatedQuizBank: QuizBank) => void;
}

const CourseMaterialsSection: React.FC<CourseMaterialsSectionProps> = ({
    localSubtopics,
    expandedTopics,
    setExpandedTopics,
    expandedSubtopics,
    setExpandedSubtopics,
    toggleSubtopic,
    handleDeleteMaterial,
    handleViewQuiz,
    showQuizOverviewPage,
    handleCloseQuizOverview,
    handleSaveOverviewQuizDetails,
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
                            Course Materials
                        </h3>
                        <p className="text-sm text-[#D68BF9] font-nunito">
                            Documents, videos and quizes
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
                    {localSubtopics && localSubtopics.length > 0 ? (
                        localSubtopics.map((subtopic: Subtopic) => (
                            <SubtopicSection
                                key={subtopic.id}
                                subtopic={subtopic}
                                expandedSubtopics={expandedSubtopics}
                                toggleSubtopic={toggleSubtopic}
                                handleDeleteMaterial={handleDeleteMaterial}
                                handleViewQuiz={handleViewQuiz}
                            />
                        ))
                    ) : (
                        <div className="text-white p-4 font-nunito">
                            No materials or quizzes uploaded yet. Please go back to the Upload Materials step to add content.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseMaterialsSection;