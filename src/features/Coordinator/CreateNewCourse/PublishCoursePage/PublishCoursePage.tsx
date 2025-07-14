// src/features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../../contexts/CourseContext';
// Import refined types
import {
    // CourseContextState, // Not directly used
    SubtopicFE,
    // ExistingMaterialFile, // Not directly used
    BasicCourseDetailsState,
    // CourseDto, // Not directly used
} from '../../../../types/course.types';

import { QuizBank } from '../../../../types/quiz.types';

// Import API service functions
import { getCourseById, deleteDocument, publishCourse } from '../../../../api/services/Course/courseService';
import { getQuizzesByLessonId, deleteQuiz } from '../../../../api/services/Course/quizService';

import PageHeader from './components/PageHeader';
import ProgressSteps from '../BasicCourseDetails/components/ProgressSteps';
import CourseMaterialsSection from './components/CourseMaterialsSection';
import ConfirmationDialog from './components/ConfirmationDialog';
import PublishButton from './components/PublishButton';
//import QuizOverviewModal from './components/QuizOverviewModal';

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
    const location = useLocation();
    const { courseId: courseIdFromParam } = useParams<{ courseId: string }>();
    const { courseData: contextCourseData, setLessonsState, updateBasicCourseDetails: updateContextBasicDetails, removeDocumentFromLessonState, resetCourseContext } = useCourseContext(); // Added updateContextBasicDetails

    const courseId = contextCourseData.createdCourseId || (courseIdFromParam ? parseInt(courseIdFromParam, 10) : null);

    const [displayCourse, setDisplayCourse] = useState<DisplayCourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials']);
    const [expandedSubtopicsUI, setExpandedSubtopicsUI] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{ lessonId: number; documentId: number; name: string } | null>(null);

    const [showQuizOverviewPage, setShowQuizOverviewPage] = useState<QuizBank | null>(null);
    const [quizzes, setQuizzes] = useState<Record<number, any[]>>({});
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [deleteQuizConfirmation, setDeleteQuizConfirmation] = useState<{lessonId: number, quizId: number} | null>(null);

    const mapToDisplayData = useCallback((
        basicDetailsFromSource: BasicCourseDetailsState,
        lessonsFromContext: SubtopicFE[],
        courseIdForDisplay: number,
        apiThumbnailUrl?: string | null // This is the URL from the backend for an existing thumbnail
    ): DisplayCourseData => {
        const totalPoints = lessonsFromContext.reduce((sum, subtopic) => sum + (subtopic.lessonPoints || 0), 0);
        const numSubtopics = lessonsFromContext.length || 1;
        const averagePoints = Math.round(totalPoints / numSubtopics);
        
        let thumbUrl: string | null = null;
        if (basicDetailsFromSource.thumbnail instanceof File) {
            thumbUrl = URL.createObjectURL(basicDetailsFromSource.thumbnail);
        } else if (apiThumbnailUrl) { // Use API URL if no new file and API URL is provided
            thumbUrl = apiThumbnailUrl;
        }
        // If basicDetailsFromSource.thumbnail is null (not a File), and apiThumbnailUrl is also null/undefined,
        // then thumbUrl will correctly be null.

        return {
            id: courseIdForDisplay,
            title: basicDetailsFromSource.title, // Source of truth is basicDetailsFromSource
            description: basicDetailsFromSource.description || "",
            thumbnailUrl: thumbUrl,
            estimatedTime: basicDetailsFromSource.estimatedTime || "",
            coordinatorPoints: averagePoints,
            lessons: lessonsFromContext,
        };
    }, []);

    const fetchQuizzesForLessons = async (lessons: SubtopicFE[]) => {
        if (!lessons || lessons.length === 0) {
            setQuizzes({});
            setLoadingQuizzes(false);
            return;
        }
        setLoadingQuizzes(true);
        const quizzesMap: Record<number, any[]> = {};
        
        try {
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
            
            await Promise.all(quizPromises);
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

        let isMounted = true;
        setIsLoading(true);
        
        // Primary condition: Always try to fetch if `displayCourse` isn't set for the current `courseId`,
        // or if `lessonsLoaded` flag in context suggests context is stale for this course.
        // `lastRefresh` will also trigger this.
        // The context `basicDetails` and `lessons` changes will also re-trigger.
        
        getCourseById(courseId)
            .then(fetchedCourse => {
                if (!isMounted) return;

                // This `basicDetailsForDisplay` will be the definitive source from the backend.
                const basicDetailsFromAPI: BasicCourseDetailsState = {
                    title: fetchedCourse.title,
                    description: fetchedCourse.description || '',
                    estimatedTime: fetchedCourse.estimatedTime.toString(),
                    categoryId: fetchedCourse.category.id,
                    technologies: fetchedCourse.technologies.map(t => t.id),
                    // Thumbnail: if context has a File for *this* course, it's a pending edit.
                    // Otherwise, we'll rely on fetchedCourse.thumbnailUrl passed to mapToDisplayData.
                    thumbnail: (contextCourseData.createdCourseId === fetchedCourse.id && contextCourseData.basicDetails.thumbnail instanceof File)
                               ? contextCourseData.basicDetails.thumbnail
                               : null, 
                };

                // Update context with the fetched basic details if context is stale or for a different course
                // This ensures context basicDetails are aligned with the latest fetched data,
                // unless a more recent File-based thumbnail change is in context.
                if (contextCourseData.createdCourseId !== fetchedCourse.id || 
                    JSON.stringify(contextCourseData.basicDetails.title) !== JSON.stringify(basicDetailsFromAPI.title) // Example check
                ) {
                    updateContextBasicDetails({
                        ...basicDetailsFromAPI,
                        // Preserve local thumbnail file if it exists and is more recent than API's lack of one
                        thumbnail: basicDetailsFromAPI.thumbnail // This already considers context's File
                                   // or a File from context might be more appropriate if context was just updated on another page:
                                   // (contextCourseData.createdCourseId === fetchedCourse.id && contextCourseData.basicDetails.thumbnail instanceof File)
                                   // ? contextCourseData.basicDetails.thumbnail
                                   // : null, // No, basicDetailsFromAPI.thumbnail is better.
                    });
                }

                const mappedLessons: SubtopicFE[] = fetchedCourse.lessons.map(l => ({
                    id: l.id,
                    lessonName: l.lessonName,
                    lessonPoints: l.lessonPoints,
                    courseId: l.courseId,
                    documents: l.documents.map(d => ({
                        id: d.id, name: d.name, fileUrl: d.fileUrl,
                        documentType: d.documentType, fileSize: d.fileSize, lessonId: d.lessonId, lastUpdatedDate: d.lastUpdatedDate
                    })),
                    isEditing: false,
                    originalName: l.lessonName,
                    originalPoints: l.lessonPoints,
                }));
                
                setLessonsState(mappedLessons); 

                // Determine which basic details to use for display:
                // Prefer context's basic details if they are for the current course,
                // as they might contain unpersisted changes from the BasicDetails page.
                // Otherwise, use the fresh details from the API.
                const finalBasicDetailsForDisplay = (contextCourseData.createdCourseId === fetchedCourse.id)
                                                  ? contextCourseData.basicDetails // Context might have latest edits
                                                  : basicDetailsFromAPI;          // API is fallback

                // Ensure the thumbnail file from context is prioritized if it exists for the current course
                let finalThumbnailFileForDisplay: File | null = null;
                if (contextCourseData.createdCourseId === fetchedCourse.id && contextCourseData.basicDetails.thumbnail instanceof File) {
                    finalThumbnailFileForDisplay = contextCourseData.basicDetails.thumbnail;
                }
                
                setDisplayCourse(mapToDisplayData(
                    { // Construct the basic details to pass ensuring title, desc, time are from finalBasicDetailsForDisplay
                        ...finalBasicDetailsForDisplay,
                        thumbnail: finalThumbnailFileForDisplay // Explicitly pass the resolved thumbnail File or null
                    },
                    mappedLessons,
                    fetchedCourse.id,
                    fetchedCourse.thumbnailUrl // Always pass the API thumbnail URL
                ));
                
                const initialExpanded: Record<number, boolean> = {};
                mappedLessons.forEach(l => initialExpanded[l.id] = true);
                setExpandedSubtopicsUI(initialExpanded);

                fetchQuizzesForLessons(mappedLessons);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Failed to fetch course details for publish page:", err);
                toast.error("Could not load course details.");
                // Fallback to context if displayCourse already has something, otherwise navigate.
                if (!displayCourse) {
                    navigate('/coordinator/dashboard');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };

    // This useEffect should primarily react to:
    // - courseId changing (param or context)
    // - lastRefresh (manual refresh trigger)
    // - Changes in context's lessons or basic details if we want to reflect them immediately without a full re-fetch always.
    //   However, the current logic fetches on every significant change anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, lastRefresh, updateContextBasicDetails, setLessonsState, mapToDisplayData, navigate, 
        // Add context parts that, if changed externally, should trigger a re-fetch/re-evaluation
        contextCourseData.createdCourseId, // if this changes, courseId calculated above changes.
        // contextCourseData.basicDetails, // Deep comparison is tricky; `lastRefresh` or direct fetch is more reliable
        // contextCourseData.lessons,      // for updates from other pages.
        // contextCourseData.lessonsLoaded // This flag is mainly for initial load strategy
        ]);


    // Effect to re-sync displayCourse if relevant parts of context change FOR THE SAME courseId
    // This is more for minor updates from context after initial load.
    useEffect(() => {
        if (displayCourse && courseId === displayCourse.id && courseId === contextCourseData.createdCourseId) {
            // If basic details in context changed for the current course
            // (e.g., title edited on BasicDetails page and context updated)
            // Or if lessons in context changed (e.g., document deleted)

            // Check if a re-map is actually needed by comparing relevant fields.
            // This avoids re-mapping if only irrelevant parts of context changed.
            const needsRemapForBasicDetails = 
                contextCourseData.basicDetails.title !== displayCourse.title ||
                (contextCourseData.basicDetails.description || "") !== displayCourse.description ||
                (contextCourseData.basicDetails.estimatedTime || "") !== displayCourse.estimatedTime ||
                (contextCourseData.basicDetails.thumbnail instanceof File !== (displayCourse.thumbnailUrl?.startsWith("blob:") || false));
            
            const needsRemapForLessons = 
                JSON.stringify(contextCourseData.lessons.map(l => l.id + l.documents.length)) !== 
                JSON.stringify(displayCourse.lessons.map(l => l.id + l.documents.length));


            if (needsRemapForBasicDetails || needsRemapForLessons) {
                console.log("PublishPage: Re-mapping displayCourse from context updates.");
                
                let currentApiThumbnailUrl = displayCourse.thumbnailUrl && !displayCourse.thumbnailUrl.startsWith("blob:")
                                           ? displayCourse.thumbnailUrl
                                           : null;

                // If basic details in context changed, AND context has a File thumbnail, that takes precedence.
                // Otherwise, retain the existing displayCourse's API thumbnail URL.
                const thumbnailFileFromContext = contextCourseData.basicDetails.thumbnail instanceof File 
                                               ? contextCourseData.basicDetails.thumbnail 
                                               : null;

                setDisplayCourse(mapToDisplayData(
                    {
                        ...contextCourseData.basicDetails, // Use latest basic details from context
                        thumbnail: thumbnailFileFromContext, // Prioritize File from context
                    },
                    contextCourseData.lessons, // Use latest lessons from context
                    courseId,
                    thumbnailFileFromContext ? null : currentApiThumbnailUrl // Pass API URL only if no new File
                ));

                if (needsRemapForLessons) { // If lessons structure changed, re-fetch quizzes.
                    fetchQuizzesForLessons(contextCourseData.lessons);
                }
            }
        }
    // This effect specifically listens to detailed changes in context basicDetails and lessons
    // for the *currently displayed course*.
    // mapToDisplayData, courseId are stable or derived.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextCourseData.basicDetails, contextCourseData.lessons, courseId, displayCourse]);


    useEffect(() => {
        const handleRouteChange = () => {
            if (!isLoading) { // Only refresh if not already loading
                console.log("PublishPage: Route changed, triggering lastRefresh.");
                setLastRefresh(Date.now());
            }
        };
        handleRouteChange(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // Removed isLoading from here to simplify, main fetch handles isLoading state.


    const handleBack = () => {
        if (courseId) {
            navigate(`/coordinator/upload-materials/${courseId}`);
        } else {
            navigate('/coordinator/dashboard');
        }
    };

    const handleSaveDraft = () => {
        toast.success('Course saved as draft.');
        resetCourseContext(); 
        
        // Navigate to the course display page.
        navigate('/coordinator/course-display-page'); 
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
            resetCourseContext(); 
            navigate('/coordinator/course-display-page'); 
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
            // This will update contextCourseData.lessons, triggering the secondary useEffect to re-map displayCourse.
            removeDocumentFromLessonState(materialToDelete.lessonId, materialToDelete.documentId);
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

    // ... (rest of the component, including JSX, remains the same as your last "image fixing" version)
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

    const handleViewQuiz = (lessonId: number) => {
        if (quizzes[lessonId] && quizzes[lessonId].length > 0) {
            const quizData = quizzes[lessonId][0];
            const quizBank: QuizBank = {
                id: quizData.quizId,
                title: quizData.quizTitle || quizData.title || '',
                description: quizData.description || '',
                questions: quizData.questions || [],
                timeLimitMinutes: quizData.timeLimitMinutes || 0,
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

    const handleEditQuiz = (lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot edit quiz.");
            return;
        }
        
        getQuizzesByLessonId(lessonId)
            .then(quizzesResp => {
                if (quizzesResp.length > 0) {
                    const quizId = quizzesResp[0].quizId;
                    navigate(`/coordinator/edit-quiz/${quizId}?lessonId=${lessonId}&courseId=${courseId}&source=publish-course`);
                } else {
                    toast.error("No quiz found for this lesson to edit. Please create one first.");
                }
            })
            .catch(error => {
                console.error(`Failed to get quiz for lesson ${lessonId}:`, error);
                toast.error("Failed to load quiz information. Please try again.");
            });
    };

    const handleRemoveQuiz = (lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot remove quiz.");
            return;
        }
        if (quizzes[lessonId] && quizzes[lessonId].length > 0) {
            const quizId = quizzes[lessonId][0].quizId;
            setDeleteQuizConfirmation({ lessonId, quizId });
        } else {
            toast.error("No quiz found for this lesson.");
        }
    };

    const handleConfirmDeleteQuiz = async () => {
        if (!deleteQuizConfirmation) return;
        
        const { lessonId, quizId } = deleteQuizConfirmation;
        const loadingToastId = toast.loading("Deleting quiz...");
        
        try {
            await deleteQuiz(quizId);
            setQuizzes(prev => {
                const newQuizzes = { ...prev };
                newQuizzes[lessonId] = [];
                return newQuizzes;
            });
            toast.dismiss(loadingToastId);
            toast.success("Quiz deleted successfully.");
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error(`Failed to delete quiz ${quizId}:`, error);
            toast.error("Failed to delete quiz. Please try again.");
        } finally {
            setDeleteQuizConfirmation(null);
        }
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
                <p className="text-red-400 text-xl">Could not load course data. Please try refreshing.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <PageHeader title="Publish Course" onBack={handleBack} onSaveDraft={handleSaveDraft} />
            <ProgressSteps stage={3} />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 relative">
                <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#52007C] p-6 shadow-lg">
                    {displayCourse.thumbnailUrl && (
                        <div className="mb-4 flex justify-left"> 
                            <img
                                src={displayCourse.thumbnailUrl}
                                alt={`${displayCourse.title || 'Course'} thumbnail`}
                                className="max-w-sm h-auto max-h-48 object-contain rounded-lg shadow-md bg-gray-800/20"
                            />
                        </div>
                    )}
                    <h3 className="font-bold text-[#1B0A3F] text-xl mb-4 text-center md:text-left">
                        {displayCourse.title || "Course Title Not Set"}
                    </h3>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold text-[#1B0A3F]">Description :</span> {displayCourse.description || "Not specified"}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold text-[#1B0A3F]">Estimated Time :</span> {displayCourse.estimatedTime ? `${displayCourse.estimatedTime} hours` : "Not specified"}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold text-[#1B0A3F]">Total Points :</span> {displayCourse.coordinatorPoints}
                    </p>
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
                    onEditQuiz={handleEditQuiz}
                    onRemoveQuiz={handleRemoveQuiz}
                    courseId={courseId} 
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

                <ConfirmationDialog
                    isOpen={!!deleteQuizConfirmation}
                    onConfirm={handleConfirmDeleteQuiz}
                    onCancel={() => setDeleteQuizConfirmation(null)}
                    message="Are you sure you want to delete this quiz? This action cannot be undone."
                />

                {/* {showQuizOverviewPage && (
                    <QuizOverviewModal
                        quizBank={showQuizOverviewPage}
                        onClose={handleCloseQuizOverview}
                        onSave={handleSaveOverviewQuizDetails}
                        isFullScreen={true}
                        subtopicId={showQuizOverviewPage.lessonId.toString()}
                    />
                )} */}
            </div>

            <PublishButton
                onBack={handleBack}
                onPublish={handlePublish}
                disabled={isPublishing || isLoading}
            />
            
        </div>
    );
};

export default PublishCoursePage;