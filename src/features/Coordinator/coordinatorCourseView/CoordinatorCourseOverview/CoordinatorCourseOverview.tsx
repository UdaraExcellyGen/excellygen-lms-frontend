import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, BookOpen, Clock, Award, Eye, AlertTriangle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

import {
    CourseDto,
    LessonDto,
    CreateLessonPayload,
    CategoryDto,
    TechnologyDto,
    UpdateCourseCoordinatorDtoFE,
    UpdateLessonPayload,
    CourseStatus
} from '../../../../types/course.types';

import {
    getCourseById,
    updateCourseBasicDetails,
    deleteDocument,
    uploadDocument,
    getCourseCategories,
    getTechnologies,
    addLesson,
    updateLesson,
    deleteLesson,
    publishCourse,
    deactivateCourse,
    reactivateCourse,
    hardDeleteCourse
} from '../../../../api/services/Course/courseService';

import { getQuizzesByLessonId, deleteQuiz } from '../../../../api/services/Course/quizService';

import SubtopicItem from './components/SubtopicItem';
import { useConfirmationDialog } from './components/ConfirmationDialog';

interface EditSubtopicData {
    lessonName: string;
    lessonPoints: number;
}

const CoordinatorCourseOverview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId: courseIdParam } = useParams<{ courseId: string }>();

    const { showConfirmation, ConfirmationDialog: ConfirmationDialogComponent } = useConfirmationDialog();

    const courseId = useMemo(() => {
        if (!courseIdParam) return null;
        const id = parseInt(courseIdParam, 10);
        return isNaN(id) ? null : id;
    }, [courseIdParam]);

    const [courseData, setCourseData] = useState<CourseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{ documentId: number; lessonId: number; name: string } | null>(null);
    const [newDocumentFiles, setNewDocumentFiles] = useState<Record<number, File | null>>({});
    const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        message: string;
        title: string;
        confirmText: string;
        onConfirm: () => void;
    } | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [editCourseDetails, setEditCourseDetails] = useState<(UpdateCourseCoordinatorDtoFE & { thumbnail: File | null }) | null>(null);
    const [editSubtopicsData, setEditSubtopicsData] = useState<Record<number, EditSubtopicData>>({});
    const [availableCategories, setAvailableCategories] = useState<CategoryDto[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<TechnologyDto[]>([]);

    const isPublished = useMemo(() => courseData?.status === CourseStatus.Published, [courseData]);
    const isInactive = useMemo(() => courseData?.isInactive === true, [courseData]);
    
    // Add this new useEffect for cleanup
useEffect(() => {
    // Clean up the object URL to prevent memory leaks
    return () => {
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
    };
}, [thumbnailPreview]);

    useEffect(() => {
        if (courseId === null) {
            if (location.pathname.startsWith('/coordinator/course-view/')) {
                toast.error("Invalid Course ID. Redirecting...");
            }
            navigate("/coordinator/course-display-page", { replace: true });
        }
    }, [courseId, navigate, location.pathname]);

    useEffect(() => {
        if (!courseId) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const fetchCourseAndLookups = async () => {
            setIsLoading(true);
            try {
                const [fetchedCourse, categories, technologies] = await Promise.all([
                    getCourseById(courseId, { signal }),
                    getCourseCategories({ signal }),
                    getTechnologies({ signal }),
                ]);

                if (signal.aborted) return;

                setCourseData(fetchedCourse);
                setEditCourseDetails({
                    title: fetchedCourse.title,
                    description: fetchedCourse.description || '',
                    estimatedTime: fetchedCourse.estimatedTime,
                    categoryId: fetchedCourse.category.id,
                    technologyIds: fetchedCourse.technologies.map(t => t.id),
                    thumbnail: null,
                });
                const initialEditSubtopics: Record<number, EditSubtopicData> = {};
                const initialExpandedSubtopics: Record<number, boolean> = {};
                for (const lesson of fetchedCourse.lessons) {
                    initialEditSubtopics[lesson.id] = { lessonName: lesson.lessonName, lessonPoints: lesson.lessonPoints };
                    initialExpandedSubtopics[lesson.id] = true;
                    (lesson as any).quizzes = await getQuizzesByLessonId(lesson.id, { signal }).catch(() => []);
                }
                setEditSubtopicsData(initialEditSubtopics);
                setExpandedSubtopics(initialExpandedSubtopics);
                setAvailableCategories(categories);
                setAvailableTechnologies(technologies);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error("Failed to load course details.");
                    navigate("/coordinator/course-display-page");
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCourseAndLookups();

        return () => {
            controller.abort();
        };
    }, [courseId, navigate, lastRefresh]);
    
    const handleDeactivateCourse = () => {
        if (!courseId) return;
        showConfirmation({
            title: "Deactivate Course?",
            message: "Deactivating this course will hide it from the catalog and prevent new enrollments. Are you sure?",
            confirmText: "Deactivate",
            type: 'danger',
            icon: <Trash2 className="w-6 h-6 text-red-500" />,
            onConfirm: async () => {
                setIsSaving(true);
                const toastId = toast.loading("Deactivating course...");
                try {
                    await deactivateCourse(courseId);
                    toast.success("Course deactivated successfully!", { id: toastId });
                    setLastRefresh(Date.now());
                } catch (error) {
                    toast.error((error as any).response?.data?.message || "Failed to deactivate course.", { id: toastId });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };
    const handleReactivateCourse = () => {
        if (!courseId) return;
        showConfirmation({
            title: "Reactivate Course?",
            message: "This will make the course visible in the catalog again. Are you sure you want to reactivate it?",
            confirmText: "Reactivate",
            type: 'success',
            icon: <RotateCcw className="w-6 h-6 text-green-500" />,
            onConfirm: async () => {
                setIsSaving(true);
                const toastId = toast.loading("Reactivating course...");
                try {
                    await reactivateCourse(courseId);
                    toast.success("Course reactivated successfully!", { id: toastId });
                    setLastRefresh(Date.now());
                } catch (error) {
                    toast.error((error as any).response?.data?.message || "Failed to reactivate course.", { id: toastId });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };
     const handlePublishCourse = () => {
        if (!courseId) return;
        showConfirmation({
            title: "Publish Course?",
            message: "Once a course is published, its lessons and materials cannot be edited. Are you sure you want to publish?",
            confirmText: "Publish",
            type: 'info',
            icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
            onConfirm: async () => {
                setIsSaving(true);
                const toastId = toast.loading("Publishing course...");
                try {
                    await publishCourse(courseId);
                    toast.success("Course published!", { id: toastId });
                    setTimeout(() => navigate("/coordinator/course-display-page"), 1500);
                } catch (error) {
                    toast.error((error as any).response?.data?.message || "Failed to publish.", { id: toastId });
                    setIsSaving(false);
                }
            }
        });
    };

    const toggleSubtopicExpand = useCallback((lessonId: number) => setExpandedSubtopics(prev => ({ ...prev, [lessonId]: !prev[lessonId] })), []);
    const handleBackToCourseDisplay = useCallback(() => navigate("/coordinator/course-display-page"), [navigate]);

    const handleToggleEditMode = useCallback(() => {
        if (!courseData) return;
        
        setIsEditMode(prevIsEditMode => {
            const newIsEditMode = !prevIsEditMode;

            if (newIsEditMode) {
                setEditCourseDetails({
                    title: courseData.title,
                    description: courseData.description || '',
                    estimatedTime: courseData.estimatedTime,
                    categoryId: courseData.category.id,
                    technologyIds: courseData.technologies.map(t => t.id),
                    thumbnail: null,
                });
                const initialEditSubtopics: Record<number, EditSubtopicData> = {};
                courseData.lessons.forEach(l => { initialEditSubtopics[l.id] = { lessonName: l.lessonName, lessonPoints: l.lessonPoints }; });
                setEditSubtopicsData(initialEditSubtopics);
                toast.success("Edit mode activated", { icon: '✏️', id: 'edit-mode-toast' });
            } else {
                setEditCourseDetails(null);
                setEditSubtopicsData({});
                setThumbnailPreview(null);
                toast("Edit mode cancelled.", { id: 'edit-mode-toast' });
            }
            
            return newIsEditMode;
        });
    }, [courseData, thumbnailPreview]);

    // This is the new function
const handleEditCourseInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "thumbnail") {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        setEditCourseDetails(prev => (prev ? { ...prev, thumbnail: file } : null));

        // Create a URL for the selected file to use in the preview
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            setThumbnailPreview(null);
        }
    } else {
        setEditCourseDetails(prev => (prev ? { ...prev, [name]: name === "estimatedTime" ? parseInt(value, 10) || 0 : value } : null));
    }
}, []);

    const handleEditCourseTechnologyChange = useCallback((techId: string) => {
        setEditCourseDetails(prev => {
            if (!prev) return null;
            const currentTechIds = prev.technologyIds || [];
            return { ...prev, technologyIds: currentTechIds.includes(techId) ? currentTechIds.filter(id => id !== techId) : [...currentTechIds, techId] };
        });
    }, []);

    // This is the new function
const handleSaveCourse = async () => {
    if (!courseId || !editCourseDetails || !courseData) return;
    setIsSaving(true);
    const saveToastId = toast.loading("Saving changes...");
    try {
        const { thumbnail, ...coursePayload } = editCourseDetails;
        await updateCourseBasicDetails(courseId, coursePayload, thumbnail);
        if (!isPublished) {
            const lessonPromises = courseData.lessons
                .filter(l => editSubtopicsData[l.id] && (editSubtopicsData[l.id].lessonName !== l.lessonName || editSubtopicsData[l.id].lessonPoints !== l.lessonPoints))
                .map(l => updateLesson(l.id, editSubtopicsData[l.id]));
            await Promise.all(lessonPromises);
        }
        // Refresh all data to get the new thumbnail URL from the server
        setLastRefresh(Date.now());
        setIsEditMode(false);
        setThumbnailPreview(null); // Clear preview after saving
        toast.success("Course updated!", { id: saveToastId });
    } catch (error) {
        toast.error("Failed to save changes.", { id: saveToastId });
    } finally {
        setIsSaving(false);
    }
};
    
    const handleEditQuiz = useCallback((lessonId: number) => {
        if (!courseId) return;
        getQuizzesByLessonId(lessonId)
            .then(quizzes => {
                if (quizzes.length > 0) {
                    const quizId = quizzes[0].quizId;
                    let navUrl = `/coordinator/edit-quiz/${quizId}?lessonId=${lessonId}&courseId=${courseId}&source=course-view`;
                    if (isPublished) navUrl += '&view=true';
                    navigate(navUrl);
                } else {
                    toast.error("No quiz found for this lesson.");
                }
            })
            .catch(() => toast.error("Failed to load quiz information."));
    }, [navigate, courseId, isPublished]);

    const handleEditSubtopicNameChange = useCallback((lessonId: number, newName: string) => setEditSubtopicsData(prev => ({ ...prev, [lessonId]: { ...prev[lessonId]!, lessonName: newName } })), []);
    const handleEditSubtopicPointsChange = useCallback((lessonId: number, newPoints: number) => setEditSubtopicsData(prev => ({ ...prev, [lessonId]: { ...prev[lessonId]!, lessonPoints: newPoints } })), []);
    
    const handleAddSubtopic = async () => {
        if (!courseId ) return;
        setIsSaving(true);
        const loadingToast = toast.loading("Adding new subtopic...");
        try {
            const newLessonDto = await addLesson({ courseId, lessonName: "\u200B", lessonPoints: 1 });
            setCourseData(prev => prev ? { ...prev, lessons: [...prev.lessons, { ...newLessonDto, quizzes: [], documents:[] }] } : null);
            setEditSubtopicsData(prev => ({ ...prev, [newLessonDto.id]: { lessonName: newLessonDto.lessonName, lessonPoints: newLessonDto.lessonPoints } }));
            setExpandedSubtopics(prev => ({ ...prev, [newLessonDto.id]: true }));
            toast.success("Subtopic added. Remember to save.", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to add subtopic.", { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };
    const handleRemoveSubtopic = (lessonId: number, lessonName: string) => {
        showConfirmation({
            title: `Delete "${lessonName}"?`,
            message: `Are you sure you want to permanently delete this subtopic? This action cannot be undone.`,
            confirmText: "Delete",
            type: 'danger',
            onConfirm: async () => {
                setIsSaving(true);
                const loadingToast = toast.loading(`Deleting "${lessonName}"...`);
                try {
                    await deleteLesson(lessonId);
                    setCourseData(prev => prev ? { ...prev, lessons: prev.lessons.filter(l => l.id !== lessonId) } : null);
                    setEditSubtopicsData(prev => {
                        const newState = { ...prev };
                        delete newState[lessonId];
                        return newState;
                    });
                    toast.success(`"${lessonName}" deleted.`, { id: loadingToast });
                } catch (error) {
                    toast.error(`Failed to delete "${lessonName}".`, { id: loadingToast });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };
    
    const handleDocumentFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, lessonId: number) => setNewDocumentFiles(prev => ({ ...prev, [lessonId]: event.target.files?.[0] || null })), []);
    const handleCancelDocumentUpload = useCallback((lessonId: number) => setNewDocumentFiles(prev => ({ ...prev, [lessonId]: null })), []);
    
    const handleAddMaterial = async (lessonId: number) => {
        const file = newDocumentFiles[lessonId];
        if (!file) return;
        setUploadingDocId(lessonId);
        const uploadToastId = toast.loading(`Uploading "${file.name}"...`);
        try {
            const uploadedDoc = await uploadDocument(lessonId, file);
            setCourseData(prev => prev ? {
                ...prev,
                lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, documents: [...l.documents, uploadedDoc] } : l)
            } : null);
            setNewDocumentFiles(prev => ({ ...prev, [lessonId]: null }));
            toast.success(`"${file.name}" uploaded.`, { id: uploadToastId });
        } catch (error) {
            toast.error(`Failed to upload "${file.name}".`, { id: uploadToastId });
        } finally {
            setUploadingDocId(null);
        }
    };
    const handleDeleteMaterial = (documentId: number, lessonId: number, documentName: string) => {
        showConfirmation({
            title: "Confirm Deletion",
            message: `Are you sure you want to remove "${documentName}"?`,
            confirmText: "Delete",
            type: 'danger',
            onConfirm: async () => {
                setIsSaving(true);
                const deleteToastId = toast.loading(`Deleting "${documentName}"...`);
                try {
                    await deleteDocument(documentId);
                    setCourseData(prev => prev ? {
                        ...prev,
                        lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, documents: l.documents.filter(d => d.id !== documentId) } : l)
                    } : null);
                    toast.success(`"${documentName}" deleted.`, { id: deleteToastId });
                } catch (error) {
                    toast.error(`Failed to delete "${documentName}".`, { id: deleteToastId });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };


    
    const handleCancelDelete = useCallback(() => { setDeleteDialogOpen(false); setMaterialToDelete(null); }, []);
    const handleAddVideoMaterial = useCallback(() => toast("Video functionality is not implemented."), []);
    const handleCreateQuiz = useCallback((lessonId: number) => { if (courseId) navigate(`/coordinator/create-quiz/${lessonId}?courseId=${courseId}&source=course-view`); }, [navigate, courseId]);
    
    const handleRemoveQuiz = useCallback((lessonId: number) => {
        if (!courseId) return;
        showConfirmation({
            title: "Delete Quiz?",
            message: "Are you sure you want to permanently delete this quiz?",
            confirmText: "Delete",
            type: 'danger',
            onConfirm: async () => {
                setIsSaving(true);
                const deleteQuizToast = toast.loading("Deleting quiz...");
                try {
                    const quizzes = await getQuizzesByLessonId(lessonId);
                    if (quizzes.length > 0) {
                        await deleteQuiz(quizzes[0].quizId);
                        setCourseData(prevData => {
                            if (!prevData) return null;
                            
                            // Create a new lessons array with the quiz removed from the specific lesson
                            const updatedLessons = prevData.lessons.map(lesson => {
                                if (lesson.id === lessonId) {
                                    return { ...lesson, quizzes: [] }; // Set quizzes to an empty array
                                }
                                return lesson;
                            });

                            // Return the new state object
                            return { ...prevData, lessons: updatedLessons };
                        });

                        toast.success("Quiz deleted successfully.", { id: deleteQuizToast });
                    } else {
                        toast.error("No quiz found to delete.", { id: deleteQuizToast });
                    }
                } catch (error) {
                    toast.error("Failed to delete the quiz.", { id: deleteQuizToast });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    }, [courseId, showConfirmation]);
    
    const refreshAllQuizData = async () => {
        if (!courseData) return;
        const toastId = toast.loading("Refreshing data...");
        try {
          // Re-fetch the main course data which should now be updated.
          setLastRefresh(Date.now());
          toast.success("Data refreshed!", { id: toastId });
        } catch (error) {
           toast.error("Failed to refresh data.", { id: toastId });
        }
    };

    const calculateTotalCoursePoints = useMemo(() => {
        if (!courseData || courseData.lessons.length === 0) return 0;
        const total = courseData.lessons.reduce((sum, lesson) => sum + (editSubtopicsData[lesson.id]?.lessonPoints ?? lesson.lessonPoints), 0);
        return Math.round(total / courseData.lessons.length);
    }, [courseData, editSubtopicsData]);

    const lessonPointsDisplay = useMemo(() => {
        const pointsMap: Record<number, number> = {};
        if (!courseData) return pointsMap;
        courseData.lessons.forEach(lesson => {
            pointsMap[lesson.id] = editSubtopicsData[lesson.id]?.lessonPoints ?? lesson.lessonPoints;
        });
        return pointsMap;
    }, [courseData, editSubtopicsData]);

    if (isLoading || !courseData) {
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

    const renderCourseMaterials = () => (
        <div className="space-y-4">
            {courseData.lessons.map((lesson) => (
                <SubtopicItem
                    key={lesson.id}
                    lesson={lesson}
                    isEditMode={isEditMode}
                    isPublished={isPublished}
                    editData={editSubtopicsData[lesson.id]}
                    onEditNameChange={handleEditSubtopicNameChange}
                    onEditPointsChange={handleEditSubtopicPointsChange}
                    onRemoveSubtopic={handleRemoveSubtopic}
                    isExpanded={!!expandedSubtopics[lesson.id]}
                    toggleExpand={() => toggleSubtopicExpand(lesson.id)}
                    materials={lesson.documents}
                    quizzes={(lesson as any).quizzes || []}
                    onDeleteMaterial={handleDeleteMaterial}
                    onAddMaterial={handleAddMaterial}
                    onCancelDocumentUpload={handleCancelDocumentUpload}
                    onDocumentFileChange={handleDocumentFileChange}
                    newDocumentFile={newDocumentFiles[lesson.id] || null}
                    isUploadingDoc={uploadingDocId === lesson.id}
                    onAddVideo={handleAddVideoMaterial}
                    onCreateQuiz={handleCreateQuiz}
                    onEditQuiz={handleEditQuiz}
                    onRemoveQuiz={handleRemoveQuiz}
                    isSaving={isSaving}
                    lessonPointsDisplay={lessonPointsDisplay[lesson.id] || lesson.lessonPoints}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <button onClick={handleBackToCourseDisplay} className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6" disabled={isSaving}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </button>

                {/* ADDED: Inactive course warning */}
                {isInactive && (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">This course is inactive.</h3>
                            <p className="text-sm">It is hidden from the course catalog and new enrollments are disabled. Previously enrolled learners can still view their progress.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            {isEditMode ? (
                                <div className="relative">
                                    <img 
                                        src={thumbnailPreview || courseData.thumbnailUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                                        alt={courseData.title} 
                                        className="w-full h-48 object-contain bg-[#1B0A3F] rounded-xl shadow-lg" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <label className="cursor-pointer bg-[#1B0A3F]/80 hover:bg-[#1B0A3F]/50 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-1">
                                            <Edit size={16} /> Change Thumbnail
                                            <input type="file" name="thumbnail" accept="image/*" onChange={handleEditCourseInputChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <img 
                                    src={courseData.thumbnailUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                                    alt={courseData.title} 
                                    className="w-full h-48 object-contain bg-[#1B0A3F] rounded-xl shadow-lg" 
                                />      
                            )}
                        </div>
                        
                        <div className="md:col-span-2">
                            {isEditMode && editCourseDetails ? ( // Check for editCourseDetails
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[#1B0A3F] text-sm mb-1 font-bold">Course Title</label>
                                        <input type="text" name="title" value={editCourseDetails.title} onChange={handleEditCourseInputChange} className="w-full border border-[#52007C] rounded-lg p-2 text-[#1B0A3F] focus:outline-none focus:border-[#BF4BF6]" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[#1B0A3F] text-sm mb-1 font-bold">Category</label>
                                            <select name="categoryId" value={editCourseDetails.categoryId} onChange={handleEditCourseInputChange} className="w-full border border-[#52007C] rounded-lg p-2 text-[#1B0A3F] focus:outline-none focus:border-[#BF4BF6]">
                                                {availableCategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[#1B0A3F] text-sm mb-1 font-bold">Estimated Time (hours)</label>
                                            <input type="number" name="estimatedTime" value={editCourseDetails.estimatedTime} onChange={handleEditCourseInputChange} min="1" className="w-full border border-[#52007C] rounded-lg p-2 text-[#1B0A3F] focus:outline-none focus:border-[#BF4BF6]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[#1B0A3F] text-sm mb-1 font-bold">Technologies</label>
                                        <div className="border border-[#52007C] rounded-lg p-2 flex flex-wrap gap-2">
                                            {availableTechnologies.map(t => (
                                                <label key={t.id} className="inline-flex items-center">
                                                    <input type="checkbox" checked={editCourseDetails.technologyIds.includes(t.id)} onChange={() => handleEditCourseTechnologyChange(t.id)} className="form-checkbox h-4 w-4 text-[#BF4BF6] transition duration-150 ease-in-out" />
                                                    <span className="ml-2 text-[#1B0A3F] text-sm">{t.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[#1B0A3F] text-sm mb-1 font-bold">Description</label>
                                        <textarea name="description" value={editCourseDetails.description || ''} onChange={handleEditCourseInputChange} rows={3} className="w-full border border-[#52007C] rounded-lg p-2 text-[#1B0A3F] focus:outline-none focus:border-[#BF4BF6]" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-3">
                                        <h1 className="text-2xl font-bold text-[#1B0A3F]">{courseData.title}</h1>
                                        <div className="flex gap-2">
                                            {/* --- MODIFIED BUTTON LOGIC --- */}
                                            {isInactive ? (
                                                <button onClick={handleReactivateCourse} disabled={isSaving} className="bg-green-200 hover:bg-green-300 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                    <RotateCcw size={16} /> Reactivate
                                                </button>
                                            ) : (
                                                <>
                                                    {courseData.status === 'Draft' && (
                                                        <button onClick={handlePublishCourse} disabled={isSaving} className="bg-[#34137C] hover:bg-[#34137C]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                            Publish
                                                        </button>
                                                    )}
                                                    <button onClick={handleToggleEditMode} disabled={isSaving || isInactive} className="bg-[#34137C] hover:bg-[#34137C]/90 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                                        <Edit size={16} /> Edit
                                                    </button>
                                                    {courseData.status === 'Published' && (
                                                        <button onClick={handleDeactivateCourse} disabled={isSaving} className="bg-red-200 hover:bg-red-300 text-red-700 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                                                            <Trash2 size={16} /> Deactivate
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button onClick={refreshAllQuizData} title="Refresh course data" className="bg-[#34137C] hover:bg-[#4A1F95] text-white p-2 rounded-lg transition-colors shadow-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="bg-[#34137C]/60 text-white px-3 py-1 rounded-full text-sm">{courseData.category.title}</span>
                                        {courseData.technologies.map(t => <span key={t.id} className="bg-[#34137C]/60 text-white px-3 py-1 rounded-full text-sm">{t.name}</span>)}
                                    </div>
                                    <p className="text-gray-500 mb-4">{courseData.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-[#1B0A3F]/60">
                                        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />Estimated time: {courseData.estimatedTime} hours</div>
                                        <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />Lessons: {courseData.lessons.length}</div>
                                        {/* <div className="flex items-center"><Award className="w-4 h-4 mr-2 text-[#D68BF9]" />Average Points: {calculateTotalCoursePoints}/100</div> */}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {isEditMode && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={handleToggleEditMode} disabled={isSaving} className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSaveCourse} disabled={isSaving} className="bg-[#34137C] hover:bg-[#34137C]/90 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                {isSaving ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>) : (<><CheckCircle className="w-4 h-4 mr-2" />Save Changes</>)}
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[#1B0A3F]">Course Lessons & Materials</h2>
                            <p className="text-[#1B0A3F]/100 text-sm">Organize subtopics, documents, and quizzes.</p>
                        </div>
                        {/* Disable adding lessons if the course is inactive */}
                        {isEditMode && !isPublished && !isInactive && (
                            <button onClick={handleAddSubtopic} className="border border-[#34137C] hover:bg-[#34137C]/10 text-[#34137C] font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-1" disabled={isSaving}>
                                <Plus size={16} /> Add New Lesson
                            </button>
                        )}
                    </div>
                    {courseData.lessons.length === 0 ? (
                        <div className="bg-[#34137C]/10 rounded-xl p-8 text-center">
                            <BookOpen className="w-12 h-12 text-[#D68BF9] mx-auto mb-4" />
                            <p className="text-gray-800 mb-4">No lessons added yet.</p>
                            {isEditMode && !isPublished && !isInactive && (
                                <button onClick={handleAddSubtopic} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white py-2 px-6 rounded-lg transition-colors flex items-center gap-1 mx-auto
                                ">
                                    <Plus size={16}/> Add First Lesson
                                </button>
                            )}
                        </div>
                    ) : (
                        renderCourseMaterials()
                    )}
                </div>

                <ConfirmationDialogComponent />
            </div>
        </div>
    );
};

export default CoordinatorCourseOverview;