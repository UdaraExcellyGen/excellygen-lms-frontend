// features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../../contexts/CourseContext';
// Import refined types
import {
    CourseContextState,
    SubtopicFE,
    ExistingMaterialFile,
    BasicCourseDetailsState,
    CourseDto,
    QuizBank
} from '../../../../types/course.types';

// Import API service functions
import { getCourseById, deleteDocument, publishCourse } from '../../../../api/services/Course/courseService';
import { getQuizzesByLessonId } from '../../../../api/services/Course/quizService';

import PageHeader from './components/PageHeader';
import ProgressSteps from './components/ProgressSteps';
import CourseMaterialsSection from './components/CourseMaterialsSection';
import ConfirmationDialog from './components/ConfirmationDialog';
import PublishButton from './components/PublishButton';
import QuizOverviewModal from './components/QuizOverviewModal';

// Local interface for the course data displayed on this page
interface DisplayCourseData {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    estimatedTime: string;
    coordinatorPoints: number;
    lessons: SubtopicFE[];
}

const PublishCoursePage: React.FC = () => {
    const navigate = useNavigate();
    // Get courseId from URL param (if navigating directly) or context
    const { courseId: courseIdFromParam } = useParams<{ courseId: string }>();
    const { courseData: contextCourseData, setLessonsState, removeDocumentFromLessonState, resetCourseContext } = useCourseContext();

    const courseId = contextCourseData.createdCourseId || (courseIdFromParam ? parseInt(courseIdFromParam, 10) : null);

    // State for this page
    const [displayCourse, setDisplayCourse] = useState<DisplayCourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

    // State for UI components
    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials']);
    const [expandedSubtopicsUI, setExpandedSubtopicsUI] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{ lessonId: number; documentId: number; name: string } | null>(null);

    // Quiz related state
    const [showQuizOverviewPage, setShowQuizOverviewPage] = useState<QuizBank | null>(null);
    const [quizzes, setQuizzes] = useState<Record<number, any[]>>({});
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);

    // Function to map context/API data to DisplayCourseData
    const mapToDisplayData = useCallback((
        basicDetails: BasicCourseDetailsState,
        lessonsFromContext: SubtopicFE[],
        fetchedCourseId?: number,
        fetchedThumbnailUrl?: string | null
    ): DisplayCourseData => {
        // Calculate average points from all subtopics
        const totalPoints = lessonsFromContext.reduce((sum, subtopic) => sum + (subtopic.lessonPoints || 0), 0);
        const numSubtopics = lessonsFromContext.length || 1; // Prevent division by zero
        const averagePoints = Math.round(totalPoints / numSubtopics);
        
        let thumbUrl: string | null = null;
        if (fetchedThumbnailUrl) { // Prioritize freshly fetched URL
            thumbUrl = fetchedThumbnailUrl;
        } else if (basicDetails.thumbnail instanceof File) {
            thumbUrl = URL.createObjectURL(basicDetails.thumbnail);
        }
        
        return {
            id: fetchedCourseId || contextCourseData.createdCourseId || 0,
            title: basicDetails.title || "Untitled Course",
            description: basicDetails.description || "",
            thumbnailUrl: thumbUrl,
            estimatedTime: basicDetails.estimatedTime || "",
            coordinatorPoints: averagePoints,
            lessons: lessonsFromContext,
        };
    }, [contextCourseData.createdCourseId]);

    // Function to fetch quizzes for all lessons
    const fetchQuizzesForLessons = async (lessons: SubtopicFE[]) => {
        setLoadingQuizzes(true);
        const quizzesMap: Record<number, any[]> = {};
        
        try {
            // Create an array of promises for all lessons
            const quizPromises = lessons.map(lesson => 
                getQuizzesByLessonId(lesson.id)
                    .then(fetchedQuizzes => {
                        quizzesMap[lesson.id] = fetchedQuizzes;
                    })
                    .catch(error => {
                        console.warn(`Could not fetch quiz for lesson ${lesson.id}:`, error);
                        quizzesMap[lesson.id] = [];
                    })
            );
            
            // Wait for all promises to resolve
            await Promise.all(quizPromises);
            
            // Update state with all quizzes
            setQuizzes(quizzesMap);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            toast.error("Failed to load some quizzes.");
        } finally {
            setLoadingQuizzes(false);
        }
    };

    useEffect(() => {
        if (!courseId) {
            toast.error("No course specified to publish.");
            navigate('/coordinator/dashboard');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // If lessons are not loaded in context for this courseId, fetch the whole course
        if (!contextCourseData.lessonsLoaded || contextCourseData.createdCourseId !== courseId) {
            console.log(`PublishPage: Fetching full course data for ID: ${courseId}`);
            getCourseById(courseId)
                .then(fetchedCourse => {
                    // Map backend DTOs to frontend state types
                    const basicDetailsForDisplay: BasicCourseDetailsState = {
                        title: fetchedCourse.title,
                        description: fetchedCourse.description || '',
                        estimatedTime: fetchedCourse.estimatedTime.toString(),
                        categoryId: fetchedCourse.category.id,
                        technologies: fetchedCourse.technologies.map(t => t.id),
                        thumbnail: contextCourseData.basicDetails.thumbnail instanceof File ? contextCourseData.basicDetails.thumbnail : null,
                    };
                    const mappedLessons: SubtopicFE[] = fetchedCourse.lessons.map(l => ({
                        id: l.id,
                        lessonName: l.lessonName,
                        lessonPoints: l.lessonPoints,
                        courseId: l.courseId,
                        documents: l.documents.map(d => ({
                            id: d.id, name: d.name, type: 'document', fileUrl: d.fileUrl,
                            documentType: d.documentType, fileSize: d.fileSize, lessonId: d.lessonId
                        })),
                        isEditing: false,
                        originalName: l.lessonName,
                        originalPoints: l.lessonPoints,
                    }));
                    setLessonsState(mappedLessons); // Update context
                    setDisplayCourse(mapToDisplayData(basicDetailsForDisplay, mappedLessons, fetchedCourse.id, fetchedCourse.thumbnailUrl));
                    
                    // Initialize expanded state for subtopics
                    const initialExpanded: Record<number, boolean> = {};
                    mappedLessons.forEach(l => initialExpanded[l.id] = true); // Expand all by default
                    setExpandedSubtopicsUI(initialExpanded);

                    // Fetch quizzes for all lessons
                    fetchQuizzesForLessons(mappedLessons);
                })
                .catch(err => {
                    console.error("Failed to fetch course details for publish page:", err);
                    toast.error("Could not load course details.");
                    navigate('/coordinator/dashboard');
                })
                .finally(() => setIsLoading(false));
        } else {
            // Use data already in context
            console.log("PublishPage: Using course data from context.");
            setDisplayCourse(mapToDisplayData(contextCourseData.basicDetails, contextCourseData.lessons, courseId, contextCourseData.basicDetails.thumbnail instanceof File ? null : contextCourseData.basicDetails.thumbnail));
            
            const initialExpanded: Record<number, boolean> = {};
            contextCourseData.lessons.forEach(l => initialExpanded[l.id] = true); // Expand all by default
            setExpandedSubtopicsUI(initialExpanded);

            // Fetch quizzes for all lessons
            fetchQuizzesForLessons(contextCourseData.lessons);
            
            setIsLoading(false);
        }
    }, [courseId, contextCourseData.basicDetails, contextCourseData.lessons, contextCourseData.lessonsLoaded, navigate, setLessonsState, mapToDisplayData]);

    const handleBack = () => {
        if (courseId) {
            navigate(`/coordinator/upload-materials/${courseId}`);
        } else {
            navigate('/coordinator/dashboard'); // Fallback
        }
    };

    const handleSaveDraft = () => {
        toast.success('Course saved as draft.');
        // navigate('/coordinator/dashboard');
    };

    const handlePublish = async () => {
        if (!courseId) {
            toast.error("Cannot publish: Course ID is missing.");
            return;
        }
        if (displayCourse?.lessons.length === 0) {
            toast.error("Cannot publish: Course must have at least one lesson/subtopic.");
            return;
        }

        setIsPublishing(true);
        const loadingToastId = toast.loading("Publishing course...");
        try {
            await publishCourse(courseId);
            toast.dismiss(loadingToastId);
            toast.success('Course published successfully!');
            resetCourseContext(); // Clear context after successful creation/publish
            navigate('/coordinator/course-display-page'); // Navigate to a page showing published courses
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("Failed to publish course:", error);
            toast.error("Failed to publish course. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeleteMaterialRequest = (lessonId: number, documentId: number, documentName: string) => {
        setMaterialToDelete({ lessonId, documentId, name: documentName });
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDeleteMaterial = async () => {
        if (!materialToDelete) return;
        setIsDeletingMaterial(true);
        const loadingToastId = toast.loading(`Deleting ${materialToDelete.name}...`);
        try {
            await deleteDocument(materialToDelete.documentId);
            // Update local state and context
            removeDocumentFromLessonState(materialToDelete.lessonId, materialToDelete.documentId);
            // Also update displayCourse state if not directly relying on context re-render
            setDisplayCourse(prev => prev ? ({
                ...prev,
                lessons: prev.lessons.map(l => l.id === materialToDelete.lessonId
                    ? { ...l, documents: l.documents.filter(d => d.id !== materialToDelete.documentId) }
                    : l
                )
            }) : null);

            toast.dismiss(loadingToastId);
            toast.success(`Material "${materialToDelete.name}" deleted.`);
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("Failed to delete material:", error);
            toast.error("Failed to delete material. Please try again.");
        } finally {
            setIsDeleteDialogOpen(false);
            setMaterialToDelete(null);
            setIsDeletingMaterial(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setMaterialToDelete(null);
    };

    const toggleSubtopicUI = (subtopicId: number) => {
        setExpandedSubtopicsUI(prev => ({
            ...prev,
            [subtopicId]: !prev[subtopicId],
        }));
    };

    // Quiz related handlers
    const handleViewQuiz = (lessonId: number) => {
        if (quizzes[lessonId] && quizzes[lessonId].length > 0) {
            // Convert the quiz data to a QuizBank object
            const quizData = quizzes[lessonId][0];
            const quizBank: QuizBank = {
                id: quizData.quizId,
                title: quizData.title,
                description: quizData.description || '',
                questions: quizData.questions || [],
                timeLimitMinutes: quizData.timeLimitMinutes,
                totalMarks: quizData.totalMarks,
                lessonId: lessonId
            };
            setShowQuizOverviewPage(quizBank);
        } else {
            toast.error("No quiz available for this lesson.");
        }
    };

    const handleCloseQuizOverview = () => { 
        setShowQuizOverviewPage(null); 
    };
    
    const handleSaveOverviewQuizDetails = (updatedQuizBank: QuizBank) => { 
        // Update local quiz state
        if (updatedQuizBank.lessonId) {
            setQuizzes(prev => ({
                ...prev,
                [updatedQuizBank.lessonId]: [
                    {
                        ...prev[updatedQuizBank.lessonId][0],
                        title: updatedQuizBank.title,
                        description: updatedQuizBank.description,
                        timeLimitMinutes: updatedQuizBank.timeLimitMinutes,
                        totalMarks: updatedQuizBank.totalMarks
                    }
                ]
            }));
        }
        handleCloseQuizOverview();
        toast.success("Quiz details updated.");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center">
                <div className="text-white text-xl flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Course Overview...
                </div>
            </div>
        );
    }

    if (!displayCourse) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center">
                <p className="text-red-400 text-xl">Could not load course data.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
            <PageHeader title="Publish Course" onBack={handleBack} onSaveDraft={handleSaveDraft} />
            <ProgressSteps currentStep={3} />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 relative">
                {/* Display Basic Course Details */}
                <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
                    <h3 className="font-bold text-white text-xl mb-4">{displayCourse.title}</h3>
                    {displayCourse.thumbnailUrl && (
                        <img src={displayCourse.thumbnailUrl} alt={displayCourse.title} className="w-full h-60 object-cover rounded-lg mb-4 shadow-md" />
                    )}
                    <p className="text-gray-300 mb-2"><span className="font-semibold text-gray-100">Description:</span> {displayCourse.description || "N/A"}</p>
                    <p className="text-gray-300 mb-2"><span className="font-semibold text-gray-100">Estimated Time:</span> {displayCourse.estimatedTime} hours</p>
                    <p className="text-gray-300"><span className="font-semibold text-gray-100">Total Points:</span> {displayCourse.coordinatorPoints}</p>
                </div>

                <CourseMaterialsSection
                    localSubtopics={displayCourse.lessons}
                    expandedTopics={expandedTopics}
                    setExpandedTopics={setExpandedTopics}
                    expandedSubtopics={expandedSubtopicsUI}
                    toggleSubtopic={toggleSubtopicUI}
                    handleDeleteMaterial={handleDeleteMaterialRequest}
                    quizzes={quizzes}
                    loadingQuizzes={loadingQuizzes}
                    handleViewQuiz={handleViewQuiz}
                    showQuizOverviewPage={showQuizOverviewPage}
                    handleCloseQuizOverview={handleCloseQuizOverview}
                    handleSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                />

                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onConfirm={handleConfirmDeleteMaterial}
                    onCancel={handleCancelDelete}
                    message={`Are you sure you want to delete "${materialToDelete?.name || 'this material'}"? This action cannot be undone.`}
                />

                {showQuizOverviewPage && (
                    <QuizOverviewModal
                        quizBank={showQuizOverviewPage}
                        onClose={handleCloseQuizOverview}
                        onSave={handleSaveOverviewQuizDetails}
                        isFullScreen={true}
                        subtopicId={showQuizOverviewPage.lessonId.toString()}
                    />
                )}
            </div>

            <PublishButton
                onBack={handleBack}
                onPublish={handlePublish}
                disabled={isPublishing}
            />
        </div>
    );
};

export default PublishCoursePage;