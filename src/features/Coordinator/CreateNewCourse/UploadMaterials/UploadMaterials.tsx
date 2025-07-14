// features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../../contexts/CourseContext';
import { SubtopicFE, ExistingMaterialFile, CourseDocumentDto, LessonDto, UpdateLessonPayload } from '../../../../types/course.types'; // Adjust path
import { 
    getCourseById, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    uploadDocument, 
    deleteDocument 
} from '../../../../api/services/Course/courseService'; // Adjust path

import {
    getQuizzesByLessonId,
    deleteQuiz
} from '../../../../api/services/Course/quizService';

import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import SubtopicItem from './components/SubtopicItem';
import BottomNavigation from './components/BottomNavigation';

const UploadMaterials: React.FC = () => {
    const navigate = useNavigate();
    const { courseId: courseIdParam } = useParams<{ courseId: string }>();
    const {
        courseData,
        setLessonsState,
        setLessonsLoaded,
        addLessonToState,
        updateLessonInState,
        removeLessonFromState,
        addDocumentToLessonState,
        removeDocumentFromLessonState,
        setCreatedCourseId // Ensure this is destructured from useCourseContext
    } = useCourseContext();

    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    const [pendingUploadFiles, setPendingUploadFiles] = useState<Record<number, File[]>>({});
    const [subtopicErrorMessages, setSubtopicErrorMessages] = useState<Record<number, string>>({});
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<number, boolean>>({});
    const [showUploadSections, setShowUploadSections] = useState<number | null>(null);
    const [isDraggingDocsPerLesson, setIsDraggingDocsPerLesson] = useState<Record<number, boolean>>({});

    const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

    useEffect(() => {
        let isMounted = true;
        if (courseId) {
            if (courseData.createdCourseId !== courseId) {
                setCreatedCourseId(courseId); // Sync context with current URL's course ID
            }

            // Load lessons if not loaded for *this* courseId, or if context just got synced to this ID
            if (!courseData.lessonsLoaded || courseData.createdCourseId !== courseId) {
                setIsLoadingPage(true);
                const fetchCourseData = async () => {
                    if (!isMounted) return;
                    try {
                        console.log(`UploadMaterials: Fetching data for course ID: ${courseId}`);
                        const fetchedCourse = await getCourseById(courseId);
                        if (isMounted) {
                            const mappedLessons: SubtopicFE[] = fetchedCourse.lessons.map(l => ({
                                id: l.id, lessonName: l.lessonName, lessonPoints: l.lessonPoints,
                                courseId: l.courseId,
                                documents: l.documents.map(d => ({
                                    id: d.id, name: d.name, fileUrl: d.fileUrl,
                                    documentType: d.documentType, fileSize: d.fileSize, lessonId: d.lessonId,
                                    lastUpdatedDate: d.lastUpdatedDate
                                })),
                                isEditing: false, originalName: l.lessonName, originalPoints: l.lessonPoints ?? 1
                            }));
                            setLessonsState(mappedLessons);
                            setLessonsLoaded(true);
                            const initialExpanded: Record<number, boolean> = {};
                            mappedLessons.forEach(l => initialExpanded[l.id] = true);
                            setExpandedSubtopics(initialExpanded);
                            console.log("UploadMaterials: Initial lessons data loaded:", mappedLessons);
                        }
                    } catch (error) {
                        if (isMounted) {
                            console.error("UploadMaterials: Failed to fetch course data:", error);
                            toast.error("Failed to load course materials. Please try again or navigate back.");
                        }
                    } finally {
                        if (isMounted) setIsLoadingPage(false);
                    }
                };
                fetchCourseData();
            } else {
                // Lessons for this course ID are already in context and marked as loaded
                if (isMounted) setIsLoadingPage(false);
                if (Object.keys(expandedSubtopics).length === 0 && courseData.lessons.length > 0) {
                    const initialExpanded: Record<number, boolean> = {};
                    courseData.lessons.forEach(l => initialExpanded[l.id] = true);
                    setExpandedSubtopics(initialExpanded);
                }
            }
        } else {
            if (isMounted) {
                console.error("UploadMaterials: No valid course ID found in URL.");
                toast.error("No course specified. Redirecting...");
                setIsLoadingPage(false);
                navigate('/coordinator/dashboard');
            }
        }
        return () => { isMounted = false; };
    }, [courseId, courseData.createdCourseId, courseData.lessonsLoaded, setLessonsState, setLessonsLoaded, setCreatedCourseId, navigate]);


    const toggleSubtopicExpand = useCallback((lessonId: number) => {
        setExpandedSubtopics(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
    }, []);

    // Modified handleAddNewSubtopic function in UploadMaterials.tsx
    const handleAddNewSubtopic = useCallback(async () => {
        if (!courseId) { toast.error("Course ID is missing to add a subtopic."); return; }
        setIsSubmittingAction(true);
        const loadingToast = toast.loading("Adding new subtopic...");
        try {
            const payload = { courseId, lessonName: "New Subtopic", lessonPoints: 1 };
            const newLessonDto = await addLesson(payload);
            const newSubtopic: SubtopicFE = {
                id: newLessonDto.id, lessonName: newLessonDto.lessonName, lessonPoints: newLessonDto.lessonPoints,
                courseId: newLessonDto.courseId, documents: [], isEditing: true, // Set isEditing to true
                originalName: newLessonDto.lessonName, originalPoints: newLessonDto.lessonPoints,
            };
            addLessonToState(newSubtopic);
            setExpandedSubtopics(prev => ({ ...prev, [newLessonDto.id]: true })); // Expand new subtopic
            setShowUploadSections(null); // Close any open upload sections
            toast.dismiss(loadingToast);
            toast.success("Subtopic added successfully.");
        } catch (error) {
            console.error("Failed to add subtopic:", error);
            toast.dismiss(loadingToast);
            // Error message likely handled by apiClient interceptor
        } finally {
            setIsSubmittingAction(false);
        }
    }, [courseId, addLessonToState]);

    const handleSubtopicInputChangeInternal = useCallback((lessonId: number, field: 'lessonName' | 'lessonPoints', value: string) => {
        setLessonsState(
            courseData.lessons.map(l => {
                if (l.id === lessonId) {
                    if (field === 'lessonPoints') {
                        // Keep as string for input, parse to number on save/blur
                        return { ...l, lessonPoints: value === '' ? 0 : Number(value) }; // Store as number or 0 if empty string
                    }
                    return { ...l, [field]: value };
                }
                return l;
            })
        );
    }, [courseData.lessons, setLessonsState]);

    const handleToggleEditSubtopicInternal = useCallback((lessonId: number, startEditing: boolean) => {
        setLessonsState(
            courseData.lessons.map(l => {
                if (l.id === lessonId) {
                    if (startEditing) {
                        return { ...l, isEditing: true, originalName: l.lessonName, originalPoints: l.lessonPoints };
                    } else { // Cancel edit
                        return { ...l, isEditing: false, lessonName: l.originalName ?? l.lessonName, lessonPoints: l.originalPoints ?? l.lessonPoints };
                    }
                }
                return l;
            })
        );
    }, [courseData.lessons, setLessonsState]);

    const handleSaveChangesSubtopicInternal = useCallback(async (lessonId: number) => {
        const subtopicToSave = courseData.lessons.find(l => l.id === lessonId);
        if (!subtopicToSave || !subtopicToSave.isEditing) return;

        const lessonName = subtopicToSave.lessonName.trim();
        // Ensure lessonPoints is treated as a number; if it was stored as string from input, parse it
        let lessonPoints = Number(subtopicToSave.lessonPoints);

        if (!lessonName) {
            toast.error("Subtopic name cannot be empty.");
            return;
        }
        if (isNaN(lessonPoints) || lessonPoints < 1 || lessonPoints > 100) {
            toast.error("Points must be a whole number between 1 and 100.");
            // Optionally revert UI points to original or a valid default
            setLessonsState(
                courseData.lessons.map(l =>
                    l.id === lessonId ? { ...l, lessonPoints: l.originalPoints ?? 1 } : l
                )
            );
            return;
        }

        setIsSubmittingAction(true);
        const loadingToast = toast.loading(`Saving changes for "${lessonName}"...`);
        try {
            const payload: UpdateLessonPayload = { lessonName, lessonPoints };
            const updatedLessonDto = await updateLesson(lessonId, payload);
            updateLessonInState({ // updateLessonInState is from context
                ...subtopicToSave,
                lessonName: updatedLessonDto.lessonName,
                lessonPoints: updatedLessonDto.lessonPoints,
                isEditing: false,
                originalName: updatedLessonDto.lessonName, // Update original values
                originalPoints: updatedLessonDto.lessonPoints,
            });
            toast.dismiss(loadingToast);
            toast.success("Changes saved successfully.");
        } catch (error) {
            console.error("Failed to save subtopic changes:", error);
            toast.dismiss(loadingToast);
            // Revert UI changes on API error
            setLessonsState(
                courseData.lessons.map(l =>
                    l.id === lessonId ? {
                        ...l,
                        isEditing: false, // Exit editing mode
                        lessonName: l.originalName!, // Revert to original
                        lessonPoints: l.originalPoints! // Revert to original
                    } : l
                )
            );
        } finally {
            setIsSubmittingAction(false);
        }
    }, [courseData.lessons, updateLessonInState, setLessonsState]);

    const handleRemoveSubtopicConfirmInternal = useCallback(async (lessonId: number, lessonName: string) => {
        if (!window.confirm(`Are you sure you want to delete the subtopic "${lessonName}" and all its materials? This action cannot be undone.`)) return;
        setIsSubmittingAction(true);
        const loadingToast = toast.loading(`Deleting "${lessonName}"...`);
        try {
            await deleteLesson(lessonId);
            removeLessonFromState(lessonId); // Update context state
            toast.dismiss(loadingToast);
            toast.success(`Subtopic "${lessonName}" deleted successfully.`);
        } catch (error) {
            console.error(`Failed to delete subtopic ${lessonId}:`, error);
            toast.dismiss(loadingToast);
        } finally {
            setIsSubmittingAction(false);
        }
    }, [removeLessonFromState]);

    const handleToggleUploadSection = useCallback((lessonId: number) => {
        setShowUploadSections(prev => (prev === lessonId ? null : lessonId));
        setSubtopicErrorMessages(prev => ({ ...prev, [lessonId]: '' }));
    }, []);

    const addFilesToPending = useCallback((files: File[], lessonId: number) => {
        const validFiles: File[] = []; let errorMsg = '';
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSizeMB = 5; const maxSizeByte = maxSizeMB * 1024 * 1024;

        files.forEach(file => {
            if (!allowedTypes.includes(file.type)) errorMsg += `Invalid file type: "${file.name}". Only PDF, DOC, DOCX allowed.\n`;
            else if (file.size > maxSizeByte) errorMsg += `File too large: "${file.name}". Max size is ${maxSizeMB}MB.\n`;
            else validFiles.push(file);
        });
        setSubtopicErrorMessages(prev => ({ ...prev, [lessonId]: errorMsg.trim() || '' }));
        if (validFiles.length > 0) {
            setPendingUploadFiles(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), ...validFiles] }));
        }
    }, []);

    const handleFileDropInternal = useCallback((e: React.DragEvent<HTMLDivElement>, lessonId: number) => {
        e.preventDefault();
        setIsDraggingDocsPerLesson(prev => ({ ...prev, [lessonId]: false }));
        addFilesToPending(Array.from(e.dataTransfer.files), lessonId);
    }, [addFilesToPending]);

    const handleFileSelectInternal = useCallback((e: React.ChangeEvent<HTMLInputElement>, lessonId: number) => {
        if (e.target.files) {
            addFilesToPending(Array.from(e.target.files), lessonId);
            e.target.value = ''; // Reset file input
        }
    }, [addFilesToPending]);

    const handleRemovePendingFileInternal = useCallback((fileName: string, lessonId: number) => {
        setPendingUploadFiles(prev => ({ ...prev, [lessonId]: (prev[lessonId] || []).filter(f => f.name !== fileName) }));
    }, []);

    const handleUploadPendingFilesActionInternal = useCallback(async (lessonId: number) => {
        const filesToUpload = pendingUploadFiles[lessonId] || [];
        if (filesToUpload.length === 0) { toast.error("No valid documents selected to upload."); return; }

        setIsSubmittingAction(true);
        const fileNamesForToast = filesToUpload.map(f => f.name).join(', ');
        const loadingToastId = toast.loading(`Uploading ${filesToUpload.length} document(s): ${fileNamesForToast}...`);
        let successCount = 0; let errorCount = 0;

        for (const file of filesToUpload) {
            try {
                const docDto = await uploadDocument(lessonId, file);
                const newDoc: ExistingMaterialFile = {
                    id: docDto.id, name: docDto.name, fileUrl: docDto.fileUrl,
                    documentType: docDto.documentType, fileSize: docDto.fileSize, lessonId: docDto.lessonId,lastUpdatedDate: docDto.lastUpdatedDate 
                };
                addDocumentToLessonState(lessonId, newDoc);
                successCount++;
            } catch (err) {
                errorCount++;
                console.error(`Failed to upload ${file.name}:`, err);
                toast.error(`Upload failed for ${file.name}.`);
                // No need to re-throw if individual toasts are shown
            }
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) toast.success(`${successCount} document(s) uploaded successfully.`);
        if (errorCount === 0) {
            setPendingUploadFiles(prev => { const updated = { ...prev }; delete updated[lessonId]; return updated; });
            setShowUploadSections(null); // Close upload section on full success
            setSubtopicErrorMessages(prev => ({ ...prev, [lessonId]: '' }));
        } else {
            setSubtopicErrorMessages(prev => ({ ...prev, [lessonId]: `${errorCount} upload(s) failed. Please review and retry.` }));
        }
        setIsSubmittingAction(false);
    }, [pendingUploadFiles, addDocumentToLessonState]);

    const handleRemoveExistingDocumentInternal = useCallback(async (lessonId: number, documentId: number, documentName: string) => {
        if (!window.confirm(`Are you sure you want to delete the document "${documentName}"?`)) return;
        setIsSubmittingAction(true);
        const loadingToastId = toast.loading(`Deleting "${documentName}"...`);
        try {
            await deleteDocument(documentId);
            removeDocumentFromLessonState(lessonId, documentId);
            toast.dismiss(loadingToastId);
            toast.success(`Document "${documentName}" deleted successfully.`);
        } catch (error) {
            console.error(`Failed to delete document ${documentId}:`, error);
            toast.dismiss(loadingToastId);
        } finally {
            setIsSubmittingAction(false);
        }
    }, [removeDocumentFromLessonState]);

    const handleBackNavigation = useCallback(() => {
        if (courseId) {
            navigate(`/coordinator/course-details/${courseId}`); // Navigate to edit mode of basic details
        } else {
            navigate('/coordinator/course-details'); // Fallback to new course form
        }
    }, [courseId, navigate]);

    const handleNextNavigation = useCallback(() => {
        // Check for pending uploads across ALL subtopics
        const hasPendingUploads = Object.values(pendingUploadFiles).some(fileList => fileList && fileList.length > 0);
        if (hasPendingUploads) {
            toast.error("You have pending documents to upload or cancel for one or more subtopics.");
            return;
        }
        if (courseData.lessons.some(l => l.isEditing)) {
            toast.error("Please save or cancel changes on all subtopics before proceeding.");
            return;
        }
        if (courseData.lessons.length === 0) {
            toast.error("Please add at least one subtopic with content before proceeding.");
            return;
        }
        if (courseId) {
            navigate(`/coordinator/publish-Course/${courseId}`);
        } else {
            toast.error("Course ID is missing. Cannot proceed.");
        }
    }, [courseId, navigate, pendingUploadFiles, courseData.lessons]);

    const handleSaveDraftAction = useCallback(() => {
         //toast.error("Save as Draft feature is not implemented yet."); 
        const hasPendingUploads = Object.values(pendingUploadFiles).some(fileList => fileList && fileList.length > 0);
        if (hasPendingUploads) {
            toast.error("You have pending documents that are not uploaded. Please upload or remove them before saving a draft.");
            return;
        }

        if (courseData.lessons.some(l => l.isEditing)) {
            toast.error("Please save or cancel changes on all subtopics before saving a draft.");
            return;
        }
        
        // If all checks pass, it's safe to leave.
        toast.success('Your progress has been saved. You can continue later.');
        navigate('/coordinator/course-display-page');

    }, [navigate, pendingUploadFiles, courseData.lessons]);
        
    
    const handleCreateQuizAction = useCallback((lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot create quiz.");
            return;
        }
        navigate(`/coordinator/create-quiz/${lessonId}?courseId=${courseId}`);
    }, [navigate, courseId]);

    const handleEditQuizAction = useCallback((lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot edit quiz.");
            return;
        }
        // First, find the quiz ID for this lesson
        getQuizzesByLessonId(lessonId)
            .then(quizzes => {
                if (quizzes.length > 0) {
                    const quizId = quizzes[0].quizId;
                    navigate(`/coordinator/edit-quiz/${quizId}?lessonId=${lessonId}&courseId=${courseId}`);
                } else {
                    toast.error("No quiz found for this lesson.");
                }
            })
            .catch(error => {
                console.error(`Failed to get quiz for lesson ${lessonId}:`, error);
                toast.error("Failed to load quiz information. Please try again.");
            });
    }, [navigate, courseId]);

   // Update this function in UploadMaterials.tsx
const handleRemoveQuizAction = useCallback((lessonId: number) => {
    if (!courseId) {
        toast.error("Course ID is missing. Cannot remove quiz.");
        return;
    }

    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
        return;
    }

    setIsSubmittingAction(true);
    
    getQuizzesByLessonId(lessonId)
        .then(quizzes => {
            if (quizzes.length > 0) {
                const quizId = quizzes[0].quizId;
                return deleteQuiz(quizId)
                    .then(() => {
                        toast.success("Quiz deleted successfully.");
                        // Force UI refresh
                        const subtopicToRefresh = courseData.lessons.find(l => l.id === lessonId);
                        if (subtopicToRefresh) {
                            // Force expanded state update to trigger useEffect in SubtopicItem
                            setExpandedSubtopics(prev => ({ ...prev }));
                        }
                    });
            } else {
                toast.error("No quiz found for this lesson.");
            }
        })
        .catch(error => {
            console.error(`Failed to delete quiz for lesson ${lessonId}:`, error);
            toast.error("Failed to delete quiz. Please try again.");
        })
        .finally(() => {
            setIsSubmittingAction(false);
        });
}, [courseId, setIsSubmittingAction, courseData.lessons, setExpandedSubtopics]);
    
    const handleAddVideoAction = useCallback((lessonId: number) => { toast.error(`Video add for lesson ${lessonId} N/A.`); }, []);


    if (isLoadingPage) {
        return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center"><p className="text-white text-xl">Loading Course Materials...</p></div>;
    }
    if (!courseId) {
        return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center"><p className="text-red-400 text-xl">Error: Invalid Course ID.</p></div>;
    }

    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <Header onSaveDraft={handleSaveDraftAction} navigateToCreateCourse={handleBackNavigation} isSubmitting={isSubmittingAction} />
            <ProgressBar stage={2} />
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h2 className="text-lg font-['Unbounded'] text-[#1B0A3F]">Course Materials (Subtopics & Documents)</h2>
                        <button onClick={handleAddNewSubtopic} disabled={isSubmittingAction} className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm disabled:opacity-50">Add New Subtopic</button>
                    </div>
                    <div className="px-6 py-4 space-y-4 border-t border-[#BF4BF6]/20">
                        {courseData.lessons.length === 0 && (<p className="text-center text-gray-600 py-4">No subtopics added yet. Click 'Add New Subtopic' to begin.</p>)}
                        {courseData.lessons.map((subtopic) => (
                            <SubtopicItem
                                key={subtopic.id}
                                subtopic={subtopic}
                                expanded={!!expandedSubtopics[subtopic.id]}
                                pendingFiles={pendingUploadFiles[subtopic.id] || []}
                                errorMessage={subtopicErrorMessages[subtopic.id]}
                                showUploadSection={showUploadSections === subtopic.id}
                                isSubmitting={isSubmittingAction}
                                toggleSubtopic={() => toggleSubtopicExpand(subtopic.id)}
                                handleRemoveSubtopic={() => handleRemoveSubtopicConfirmInternal(subtopic.id, subtopic.lessonName)}
                                handleSubtopicInputChange={(field, value) => handleSubtopicInputChangeInternal(subtopic.id, field, value)}
                                handleToggleEdit={() => handleToggleEditSubtopicInternal(subtopic.id, !subtopic.isEditing)}
                                handleSaveChanges={() => handleSaveChangesSubtopicInternal(subtopic.id)}
                                handleCancelEdit={() => handleToggleEditSubtopicInternal(subtopic.id, false)}
                                removeMaterial={(docId, docName) => handleRemoveExistingDocumentInternal(subtopic.id, docId, docName)}
                                handleUploadDocumentClick={() => handleToggleUploadSection(subtopic.id)}
                                handleDrop={(e) => handleFileDropInternal(e, subtopic.id)}
                                handleFileSelect={(e) => handleFileSelectInternal(e, subtopic.id)}
                                handleUploadPendingFiles={() => handleUploadPendingFilesActionInternal(subtopic.id)}
                                handleRemovePendingFile={(fileName) => handleRemovePendingFileInternal(fileName, subtopic.id)}
                                setIsDraggingDocs={(isDragging) => setIsDraggingDocsPerLesson(prev => ({ ...prev, [subtopic.id]: isDragging }))}
                                isDraggingDocs={!!isDraggingDocsPerLesson[subtopic.id]}
                                handleAddVideoClick={() => handleAddVideoAction(subtopic.id)}
                                handleCreateQuizClick={() => handleCreateQuizAction(subtopic.id)}
                                handleEditQuiz={() => handleEditQuizAction(subtopic.id)}
                                handleRemoveQuiz={() => handleRemoveQuizAction(subtopic.id)}
                            />
                        ))}
                    </div>
                </div>
                <BottomNavigation onBack={handleBackNavigation} onNext={handleNextNavigation} />
            </div>
        </div>
    );
};

export default UploadMaterials;