// features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../../contexts/CourseContext';
// Import refined types
import {
    CourseContextState, // For context structure
    SubtopicFE,         // For lessons from context
    ExistingMaterialFile, // For documents within lessons
    BasicCourseDetailsState, // For basic details from context
    CourseDto           // For the full course data from API
} from '../../../../types/course.types'; // Adjust path as needed

// Import API service functions
import { getCourseById, deleteDocument, publishCourse } from '../../../../api/services/Course/courseService'; // Adjust path

import PageHeader from './components/PageHeader';
import ProgressSteps from './components/ProgressSteps';
import CourseMaterialsSection from './components/CourseMaterialsSection'; // Will need updates
import ConfirmationDialog from './components/ConfirmationDialog';
import PublishButton from './components/PublishButton';
// Quiz related imports - will be ignored for now as per request
// import QuizOverviewModal from './components/QuizOverviewModal';
// import { QuizBank } from '../../../../types/course.types'; // Assuming QuizBank type if needed

// Local interface for the course data displayed on this page
interface DisplayCourseData {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string | null; // Can be string (from createObjectURL) or null
    estimatedTime: string; // From basicDetails
    coordinatorPoints: number; // Calculated
    lessons: SubtopicFE[]; // Use SubtopicFE which includes documents
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
    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials']); // 'details', 'materials'
    const [expandedSubtopicsUI, setExpandedSubtopicsUI] = useState<Record<number, boolean>>({}); // For UI expand/collapse of subtopics
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{ lessonId: number; documentId: number; name: string } | null>(null);

    // Quiz related state - ignored for now
    // const [showQuizOverviewPage, setShowQuizOverviewPage] = useState<QuizBank | null>(null);


    // Function to map context/API data to DisplayCourseData
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
        id: fetchedCourseId || contextCourseData.createdCourseId || 0, // Ensure an ID is present
        title: basicDetails.title || "Untitled Course",
        description: basicDetails.description || "",
        thumbnailUrl: thumbUrl,
        estimatedTime: basicDetails.estimatedTime || "",
        coordinatorPoints: averagePoints, // Use the calculated average
        lessons: lessonsFromContext,
    };
}, [contextCourseData.createdCourseId]);


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
        // TODO: Implement actual save draft API call if this feature is intended
        toast.success('Course saved as draft (Not Implemented).');
        // navigate('/coordinator/dashboard'); // Or a page showing draft courses
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
            // Error message handled by apiClient interceptor
        } finally {
            setIsPublishing(false);
        }
    };

    // const handleDeleteMaterialRequest = (lessonId: number, documentId: number, documentName: string) => {
    //     setMaterialToDelete({ lessonId, documentId, name: documentName });
    //     setIsDeleteDialogOpen(false);
    // };
    const handleDeleteMaterialRequest = (lessonId: number, documentId: number, documentName: string) => {
    setMaterialToDelete({ lessonId, documentId, name: documentName });
    setIsDeleteDialogOpen(true); // You had setIsDeleteDialogOpen(false) here, fixed to true
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

    // Quiz related handlers - ignored for now
    // const handleViewQuiz = (quizBank: QuizBank | undefined) => { setShowQuizOverviewPage(quizBank || null); };
    // const handleCloseQuizOverview = () => { setShowQuizOverviewPage(null); };
    // const handleSaveOverviewQuizDetails = (updatedQuizBank: QuizBank) => { /* ... */ handleCloseQuizOverview(); };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
                <p className="text-white text-xl">Loading Course Overview...</p>
                {/* Spinner */}
            </div>
        );
    }

    if (!displayCourse) {
        return (
            <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
                <p className="text-red-400 text-xl">Could not load course data.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <PageHeader title="Publish Course" onBack={handleBack} onSaveDraft={handleSaveDraft} />
            <ProgressSteps currentStep={3} />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 relative">
                {/* Display Basic Course Details (Simplified) */}
                <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
                    <h3 className="font-unbounded font-bold text-white text-xl mb-4">{displayCourse.title}</h3>
                    {displayCourse.thumbnailUrl && (
                        <img src={displayCourse.thumbnailUrl} alt={displayCourse.title} className="w-full h-60 object-cover rounded-lg mb-4" />
                        
                    )}
                    <p className="text-gray-300 font-nunito mb-2"><span className="font-semibold text-gray-100">Description:</span> {displayCourse.description || "N/A"}</p>
                    <p className="text-gray-300 font-nunito mb-2"><span className="font-semibold text-gray-100">Estimated Time:</span> {displayCourse.estimatedTime} hours</p>
                    <p className="text-gray-300 font-nunito"><span className="font-semibold text-gray-100">Total Points:</span> {displayCourse.coordinatorPoints}</p>
                </div>

                <CourseMaterialsSection
                    localSubtopics={displayCourse.lessons} // Pass lessons from displayCourse
                    expandedTopics={expandedTopics}
                    setExpandedTopics={setExpandedTopics}
                    expandedSubtopics={expandedSubtopicsUI} // Use UI specific state for expansion
                    // setExpandedSubtopics={setExpandedTopics} // Cast if needed, or adjust CourseMaterialsSection
                    toggleSubtopic={toggleSubtopicUI} // Pass UI specific toggle
                    handleDeleteMaterial={handleDeleteMaterialRequest}
                    // Quiz related props - pass dummy or actual if implemented
                    handleViewQuiz={() => {/* no-op for now */}}
                    showQuizOverviewPage={null}
                    handleCloseQuizOverview={() => {/* no-op */}}
                    handleSaveOverviewQuizDetails={() => {/* no-op */}}
                />

                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onConfirm={handleConfirmDeleteMaterial}
                    onCancel={handleCancelDelete}
                    message={`Are you sure you want to delete "${materialToDelete?.name || 'this material'}"? This action cannot be undone.`}
                />

                {/* {showQuizOverviewPage && (
                    <QuizOverviewModal
                        quizBank={showQuizOverviewPage}
                        onClose={handleCloseQuizOverview}
                        onSave={handleSaveOverviewQuizDetails}
                        isFullScreen={true}
                        subtopicId="" // Adjust if needed
                    />
                )} */}
            </div>

            <PublishButton
                onBack={handleBack}
                onPublish={handlePublish}
                // disabled={isPublishing} // Add disabled state to PublishButton if needed
            />
        </div>
    );
};

export default PublishCoursePage;