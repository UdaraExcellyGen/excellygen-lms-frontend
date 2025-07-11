// src/features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/CoordinatorCourseOverview.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText, PlayCircle, CheckCircle, BookOpen, Clock, List, Download, Award } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    CourseDto,
    LessonDto,
    CreateLessonPayload,
    CategoryDto,
    TechnologyDto,
    UpdateCourseCoordinatorDtoFE,
    UpdateLessonPayload,
    CreateCoursePayload
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
    deleteLesson
} from '../../../../api/services/Course/courseService';

import { getQuizzesByLessonId, deleteQuiz } from '../../../../api/services/Course/quizService';

// Import components
import CourseOverviewHeader from './components/CourseOverviewHeader';
import CourseOverviewCourseSection from './components/CourseOverviewCourseSection';
import SubtopicItem from './components/SubtopicItem';
import ConfirmationDialog from './components/ConfirmationDialog';

// Type for subtopic editing state
interface EditSubtopicData {
    lessonName: string;
    lessonPoints: number;
}

const CoordinatorCourseOverview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId: courseIdParam } = useParams<{ courseId: string }>();
    const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

    const [courseData, setCourseData] = useState<CourseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials', 'technologies', 'course-details']);
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{ documentId: number; lessonId: number; name: string } | null>(null);
    const [newDocumentFiles, setNewDocumentFiles] = useState<Record<number, File | null>>({});
    const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<{lessonId: number, quizId?: number} | null>(null);
    const [showQuizOptions, setShowQuizOptions] = useState<number | null>(null);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

    // Fixed the type to match the backend expectations (strings)
    const [editCourseDetails, setEditCourseDetails] = useState<
        (UpdateCourseCoordinatorDtoFE & { thumbnail: File | null }) | null
    >(null);

    // Form data for subtopics in edit mode
    const [editSubtopicsData, setEditSubtopicsData] = useState<Record<number, EditSubtopicData>>({});

    // Lookups for dropdowns
    const [availableCategories, setAvailableCategories] = useState<CategoryDto[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<TechnologyDto[]>([]);

    // Tech dropdown state
    const [isTechnologiesDropdownOpen, setIsTechnologiesDropdownOpen] = useState(false);
    const technologiesDropdownRef = React.useRef<HTMLDivElement>(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot load course overview.");
            navigate("/coordinator/course-display-page");
            return;
        }

        const fetchCourseAndLookups = async () => {
            setIsLoading(true);
            try {
                const [fetchedCourse, categories, technologies] = await Promise.all([
                    getCourseById(courseId),
                    getCourseCategories(),
                    getTechnologies(),
                ]);

                // Set main course data
                setCourseData(fetchedCourse);

                // Initialize edit form data with correct string types
                setEditCourseDetails({
                    title: fetchedCourse.title,
                    description: fetchedCourse.description || '',
                    estimatedTime: fetchedCourse.estimatedTime,
                    categoryId: fetchedCourse.category.id, // Keep as string
                    technologyIds: fetchedCourse.technologies.map(t => t.id), // Keep as strings
                    thumbnail: null,
                });

                // Initialize edit subtopics data and expanded state
                const initialEditSubtopics: Record<number, EditSubtopicData> = {};
                const initialExpandedSubtopics: Record<number, boolean> = {};
                
                // Fetch quizzes for each lesson
                for (const lesson of fetchedCourse.lessons) {
                    initialEditSubtopics[lesson.id] = {
                        lessonName: lesson.lessonName,
                        lessonPoints: lesson.lessonPoints,
                    };
                    initialExpandedSubtopics[lesson.id] = true;
                    
                    try {
                        const quizzes = await getQuizzesByLessonId(lesson.id);
                        (lesson as LessonDto & { quizzes?: any[] }).quizzes = quizzes;
                    } catch (quizError) {
                        console.warn(`Could not fetch quiz for lesson ${lesson.id}:`, quizError);
                        (lesson as LessonDto & { quizzes?: any[] }).quizzes = [];
                    }
                }
                
                setEditSubtopicsData(initialEditSubtopics);
                setExpandedSubtopics(initialExpandedSubtopics);

                // Set lookup data
                setAvailableCategories(categories);
                setAvailableTechnologies(technologies);

            } catch (error) {
                console.error("Error fetching course details or lookups:", error);
                toast.error("Failed to load course details. Please try again.");
                navigate("/coordinator/course-display-page");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseAndLookups();
        // Adding lastRefresh to dependencies so we can force a refetch when returning from edit quiz
    }, [courseId, navigate, lastRefresh]);

    // Listen for route changes to refresh data when returning from quiz edit
    useEffect(() => {
        // Force a refresh when returning to this component
        setLastRefresh(Date.now());
    }, [location.pathname]);

    // Click outside dropdown handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
                setIsTechnologiesDropdownOpen(false);
            }
            setShowQuizOptions(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- UI State Toggles ---
    const toggleSection = useCallback((sectionId: string) => {
        setExpandedTopics(prev =>
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
        );
    }, []);

    const toggleSubtopicExpand = useCallback((lessonId: number) => {
        setExpandedSubtopics(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
    }, []);

    // --- Navigation Handlers ---
    const handleBackToCourseDisplay = useCallback(() => {
        navigate("/coordinator/course-display-page");
    }, [navigate]);

    // --- Main Course Editing Handlers ---
    const handleToggleEditMode = useCallback(() => {
        if (!courseData) return;
        
        if (!isEditMode) { // Entering edit mode
            setEditCourseDetails({
                title: courseData.title,
                description: courseData.description || '',
                estimatedTime: courseData.estimatedTime,
                categoryId: courseData.category.id, // Keep as string
                technologyIds: courseData.technologies.map(t => t.id), // Keep as strings
                thumbnail: null,
            });

            const initialEditSubtopics: Record<number, EditSubtopicData> = {};
            courseData.lessons.forEach(lesson => {
                initialEditSubtopics[lesson.id] = {
                    lessonName: lesson.lessonName,
                    lessonPoints: lesson.lessonPoints,
                };
            });
            setEditSubtopicsData(initialEditSubtopics);
            toast.success("Edit mode activated", {
                icon: '✏️',
                style: {
                    background: '#1B0A3F',
                    color: '#fff',
                    border: '1px solid #BF4BF6'
                }
            });
        } else { // Exiting edit mode (via Cancel)
            setEditCourseDetails(null);
            setEditSubtopicsData({});
            toast("Edit mode cancelled. Changes discarded.");
        }
        setIsEditMode(prev => !prev);
    }, [isEditMode, courseData]);

    const handleEditCourseInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditCourseDetails(prev => {
            if (!prev) return null;
            if (name === "estimatedTime") {
                return { ...prev, [name]: parseInt(value, 10) || 0 };
            } else if (name === "thumbnail") {
                const file = (e.target as HTMLInputElement).files?.[0] || null;
                return { ...prev, thumbnail: file };
            }
            return { ...prev, [name]: value };
        });
    }, []);

    // Fixed technology change handler to work with string IDs
    const handleEditCourseTechnologyChange = useCallback((techId: string) => {
        setEditCourseDetails(prev => {
            if (!prev) return null;
            const currentTechIds = prev.technologyIds || [];
            return {
                ...prev,
                technologyIds: currentTechIds.includes(techId)
                    ? currentTechIds.filter(id => id !== techId)
                    : [...currentTechIds, techId]
            };
        });
    }, []);

    // Validation helper function
    const validateCoursePayload = (payload: UpdateCourseCoordinatorDtoFE) => {
        const errors = [];
        
        if (!payload.title || payload.title.trim() === '') {
            errors.push('Title is required');
        }
        
        if (!payload.categoryId || payload.categoryId.trim() === '') {
            errors.push('Category is required');
        }
        
        if (!payload.estimatedTime || payload.estimatedTime <= 0) {
            errors.push('Estimated time must be greater than 0');
        }
        
        if (!payload.technologyIds || payload.technologyIds.length === 0) {
            errors.push('At least one technology must be selected');
        }
        
        return errors;
    };

    const handleSaveCourse = async () => {
        if (!courseId || !editCourseDetails || !courseData) {
            toast.error("Course data for saving is incomplete.");
            return;
        }
        
        setIsSaving(true);
        const saveToastId = toast.loading("Saving course changes...");

        try {
            // 1. Update main course details
            const { thumbnail, ...coursePayload } = editCourseDetails;
            
            // Ensure payload is properly formatted (no conversion needed since types are already strings)
            const sanitizedPayload: UpdateCourseCoordinatorDtoFE = {
                title: coursePayload.title?.trim() || '',
                description: coursePayload.description?.trim() || '',
                estimatedTime: coursePayload.estimatedTime,
                categoryId: coursePayload.categoryId,
                technologyIds: coursePayload.technologyIds || []
            };
            
            // Validate the payload
            const validationErrors = validateCoursePayload(sanitizedPayload);
            if (validationErrors.length > 0) {
                toast.error(`Validation failed: ${validationErrors.join(', ')}`, { id: saveToastId });
                return;
            }
            
            // Debug: Log the payload being sent
            console.log("Course payload being sent:", sanitizedPayload);
            
            const updatedCourseDto = await updateCourseBasicDetails(courseId, sanitizedPayload, thumbnail);

            // 2. Update individual lessons (subtopics) if changed
            const lessonUpdatePromises: Promise<LessonDto>[] = [];
            for (const lesson of courseData.lessons) {
                const editedData = editSubtopicsData[lesson.id];
                if (editedData && (editedData.lessonName !== lesson.lessonName || editedData.lessonPoints !== lesson.lessonPoints)) {
                    lessonUpdatePromises.push(updateLesson(lesson.id, {
                        lessonName: editedData.lessonName,
                        lessonPoints: editedData.lessonPoints
                    }));
                }
            }
            await Promise.all(lessonUpdatePromises);

            // 3. Re-fetch course data to ensure consistency
            const refetchedCourse = await getCourseById(courseId);
            for (const lesson of refetchedCourse.lessons) {
                try {
                    const quizzes = await getQuizzesByLessonId(lesson.id);
                    (lesson as LessonDto & { quizzes?: any[] }).quizzes = quizzes;
                } catch (quizError) {
                    console.warn(`Could not fetch quiz for lesson ${lesson.id} during refetch:`, quizError);
                    (lesson as LessonDto & { quizzes?: any[] }).quizzes = [];
                }
            }
            setCourseData(refetchedCourse);
            setIsEditMode(false);
            toast.success("Course updated successfully!", { id: saveToastId });

        } catch (error: any) {
            console.error("Error saving course:", error);
            // Enhanced error logging
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
                
                // Show more specific error message if available
                const errorMessage = error.response.data?.message || error.response.data?.title || "Failed to save course changes. Please try again.";
                toast.error(errorMessage, { id: saveToastId });
            } else {
                toast.error("Failed to save course changes. Please try again.", { id: saveToastId });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // --- Subtopic (Lesson) Management Handlers ---
    const handleEditSubtopicNameChange = useCallback((lessonId: number, newName: string) => {
        setEditSubtopicsData(prev => ({
            ...prev,
            [lessonId]: { ...prev[lessonId]!, lessonName: newName }
        }));
    }, []);

    const handleEditSubtopicPointsChange = useCallback((lessonId: number, newPoints: number) => {
        setEditSubtopicsData(prev => ({
            ...prev,
            [lessonId]: { ...prev[lessonId]!, lessonPoints: newPoints }
        }));
    }, []);

    const handleAddSubtopic = async () => {
        if (!courseId) {
            toast.error("Course ID is missing to add a subtopic.");
            return;
        }
        setIsSaving(true);
        const loadingToast = toast.loading("Adding new subtopic...");
        try {
            const payload: CreateLessonPayload = { courseId, lessonName: "New Subtopic", lessonPoints: 1 };
            const newLessonDto = await addLesson(payload);

            // Update the state
            setCourseData(prevCourseData => {
                if (!prevCourseData) return null;
                const updatedLessons = [...prevCourseData.lessons, { ...newLessonDto, quizzes: [] }];
                return { ...prevCourseData, lessons: updatedLessons };
            });

            // Initialize edit data
            setEditSubtopicsData(prev => ({
                ...prev,
                [newLessonDto.id]: { lessonName: newLessonDto.lessonName, lessonPoints: newLessonDto.lessonPoints }
            }));
            setExpandedSubtopics(prev => ({ ...prev, [newLessonDto.id]: true }));

            toast.dismiss(loadingToast);
            toast.success("Subtopic added successfully. Remember to save the course to persist changes.");
        } catch (error) {
            console.error("Failed to add subtopic:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to add subtopic.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSubtopic = async (lessonId: number, lessonName: string) => {
        if (!window.confirm(`Are you sure you want to delete the subtopic "${lessonName}" and all its associated materials and quizzes? This action cannot be undone.`)) return;
        
        setIsSaving(true);
        const loadingToast = toast.loading(`Deleting "${lessonName}"...`);
        try {
            await deleteLesson(lessonId);

            // Update state
            setCourseData(prevCourseData => {
                if (!prevCourseData) return null;
                return {
                    ...prevCourseData,
                    lessons: prevCourseData.lessons.filter(lesson => lesson.id !== lessonId)
                };
            });
            
            // Remove from edit state
            setEditSubtopicsData(prev => {
                const newState = { ...prev };
                delete newState[lessonId];
                return newState;
            });

            toast.dismiss(loadingToast);
            toast.success(`Subtopic "${lessonName}" deleted successfully.`);
        } catch (error) {
            console.error(`Failed to delete subtopic ${lessonId}:`, error);
            toast.dismiss(loadingToast);
            toast.error(`Failed to delete subtopic "${lessonName}".`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Document Management Handlers ---
    const handleDocumentFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, lessonId: number) => {
        if (event.target.files && event.target.files[0]) {
            setNewDocumentFiles(prevFiles => ({ ...prevFiles, [lessonId]: event.target.files![0] }));
        } else {
            setNewDocumentFiles(prevFiles => ({ ...prevFiles, [lessonId]: null }));
        }
    }, []);

    const handleCancelDocumentUpload = useCallback((lessonId: number) => {
        setNewDocumentFiles(prevFiles => ({ ...prevFiles, [lessonId]: null }));
    }, []);

    const handleAddMaterial = async (lessonId: number) => {
        const file = newDocumentFiles[lessonId];
        if (!file) {
            toast.error("Please select a document file to upload.");
            return;
        }

        setUploadingDocId(lessonId);
        const uploadToastId = toast.loading(`Uploading "${file.name}"...`);

        try {
            const uploadedDoc = await uploadDocument(lessonId, file);
            setCourseData(prevCourseData => {
                if (!prevCourseData) return null;
                return {
                    ...prevCourseData,
                    lessons: prevCourseData.lessons.map(lesson =>
                        lesson.id === lessonId
                            ? { ...lesson, documents: [...lesson.documents, uploadedDoc] }
                            : lesson
                    ),
                };
            });
            setNewDocumentFiles(prevFiles => ({ ...prevFiles, [lessonId]: null }));
            toast.success(`"${file.name}" uploaded successfully.`, { id: uploadToastId });
        } catch (error) {
            console.error(`Error uploading document for lesson ${lessonId}:`, error);
            toast.error(`Failed to upload "${file.name}".`, { id: uploadToastId });
        } finally {
            setUploadingDocId(null);
        }
    };

    const askDeleteConfirmation = useCallback((documentId: number, lessonId: number, documentName: string) => {
        setMaterialToDelete({ documentId, lessonId, name: documentName });
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = async () => {
        if (!materialToDelete) return;

        setIsSaving(true);
        const deleteToastId = toast.loading(`Deleting "${materialToDelete.name}"...`);

        try {
            await deleteDocument(materialToDelete.documentId);
            setCourseData(prevCourseData => {
                if (!prevCourseData) return null;
                return {
                    ...prevCourseData,
                    lessons: prevCourseData.lessons.map(lesson =>
                        lesson.id === materialToDelete.lessonId
                            ? { ...lesson, documents: lesson.documents.filter(doc => doc.id !== materialToDelete.documentId) }
                            : lesson
                    ),
                };
            });
            toast.success(`"${materialToDelete.name}" deleted successfully.`, { id: deleteToastId });
        } catch (error) {
            console.error(`Error deleting material ${materialToDelete.documentId}:`, error);
            toast.error(`Failed to delete "${materialToDelete.name}".`, { id: deleteToastId });
        } finally {
            setDeleteDialogOpen(false);
            setMaterialToDelete(null);
            setIsSaving(false);
        }
    };

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
    }, []);

    // --- Video Material Handlers ---
    const handleAddVideoMaterial = useCallback((lessonId: number) => {
        toast("Adding video functionality is not yet implemented.");
    }, []);

    // --- Quiz Management Handlers ---
    const handleEditQuiz = useCallback((lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot edit quiz.");
            return;
        }
        
        getQuizzesByLessonId(lessonId)
            .then(quizzes => {
                if (quizzes.length > 0) {
                    const quizId = quizzes[0].quizId;
                    navigate(`/coordinator/edit-quiz/${quizId}?lessonId=${lessonId}&courseId=${courseId}&source=course-view`);
                } else {
                    toast.error("No quiz found for this lesson to edit. Please create one first.");
                }
            })
            .catch(error => {
                console.error(`Failed to get quiz for lesson ${lessonId}:`, error);
                toast.error("Failed to load quiz information. Please try again.");
            });
    }, [navigate, courseId]);

    const handleCreateQuiz = useCallback((lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot create quiz.");
            return;
        }
        navigate(`/coordinator/create-quiz/${lessonId}?courseId=${courseId}`);
    }, [navigate, courseId]);

    const handleRemoveQuiz = useCallback(async (lessonId: number) => {
        if (!courseId) {
            toast.error("Course ID is missing. Cannot remove quiz.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            return;
        }

        setIsSaving(true);
        const deleteQuizToast = toast.loading("Deleting quiz...");
        try {
            const quizzes = await getQuizzesByLessonId(lessonId);
            if (quizzes.length > 0) {
                const quizId = quizzes[0].quizId;
                await deleteQuiz(quizId);

                // Update state
                setCourseData(prevCourseData => {
                    if (!prevCourseData) return null;
                    return {
                        ...prevCourseData,
                        lessons: prevCourseData.lessons.map(lesson =>
                            lesson.id === lessonId ? { ...lesson, quizzes: [] } : lesson
                        ),
                    };
                });
                toast.success("Quiz deleted successfully.", { id: deleteQuizToast });
            } else {
                toast.error("No quiz found for this lesson.", { id: deleteQuizToast });
            }
        } catch (error) {
            console.error(`Failed to delete quiz for lesson ${lessonId}:`, error);
            toast.error("Failed to delete quiz. Please try again.", { id: deleteQuizToast });
        } finally {
            setIsSaving(false);
        }
    }, [courseId]);

    // Function to refresh quiz data for a specific lesson
    const refreshLessonQuizData = async (lessonId: number) => {
        if (!courseData) return;
        
        try {
            const quizzes = await getQuizzesByLessonId(lessonId);
            
            setCourseData(prevData => {
                if (!prevData) return null;
                
                return {
                    ...prevData,
                    lessons: prevData.lessons.map(lesson => 
                        lesson.id === lessonId 
                            ? { ...lesson, quizzes: quizzes } 
                            : lesson
                    )
                };
            });
        } catch (error) {
            console.error(`Failed to refresh quiz data for lesson ${lessonId}:`, error);
        }
    };

    const toggleQuizOptions = useCallback((lessonId: number) => {
        setShowQuizOptions(prev => prev === lessonId ? null : lessonId);
    }, []);

    // --- Memoized Data for Rendering ---
    // Group materials and quizzes by lessonId
    const groupedMaterials = useMemo(() => {
        if (!courseData) return {};
        return courseData.lessons.reduce((groups, lesson) => {
            groups[lesson.id] = lesson.documents;
            return groups;
        }, {} as Record<number, any[]>);
    }, [courseData]);

    const groupedQuizzes = useMemo(() => {
        if (!courseData) return {};
        return courseData.lessons.reduce((groups, lesson) => {
            groups[lesson.id] = (lesson as any).quizzes || [];
            return groups;
        }, {} as Record<number, any[]>);
    }, [courseData]);

    // Calculate total course points
    const calculateTotalCoursePoints = useMemo(() => {
        if (!courseData || courseData.lessons.length === 0) return 0;
        const totalLessonPoints = courseData.lessons.reduce((sum, lesson) => {
            const lessonPoints = isEditMode && editSubtopicsData[lesson.id] !== undefined
                ? editSubtopicsData[lesson.id].lessonPoints
                : lesson.lessonPoints;
            return sum + lessonPoints;
        }, 0);
        return Math.round(totalLessonPoints / courseData.lessons.length);
    }, [courseData, isEditMode, editSubtopicsData]);

    // Lesson points for display
    const lessonPointsDisplay = useMemo(() => {
        const pointsMap: Record<number, number> = {};
        courseData?.lessons.forEach(lesson => {
            pointsMap[lesson.id] = isEditMode && editSubtopicsData[lesson.id] !== undefined
                ? editSubtopicsData[lesson.id].lessonPoints
                : lesson.lessonPoints;
        });
        return pointsMap;
    }, [courseData?.lessons, isEditMode, editSubtopicsData]);

    // Force refresh all quiz data
    const refreshAllQuizData = async () => {
        if (!courseData) return;
        
        for (const lesson of courseData.lessons) {
            await refreshLessonQuizData(lesson.id);
        }
    };

    if (isLoading || !courseData || !editCourseDetails) {
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

    // Render Course Materials and Lessons
    const renderCourseMaterials = () => {
        return (
            <div className="space-y-4">
                {courseData.lessons.map((lesson) => (
                    <SubtopicItem
                        key={lesson.id}
                        lesson={lesson}
                        isEditMode={isEditMode}
                        editData={editSubtopicsData[lesson.id]}
                        onEditNameChange={handleEditSubtopicNameChange}
                        onEditPointsChange={handleEditSubtopicPointsChange}
                        onRemoveSubtopic={handleRemoveSubtopic}
                        isExpanded={!!expandedSubtopics[lesson.id]}
                        toggleExpand={() => toggleSubtopicExpand(lesson.id)}
                        materials={lesson.documents}
                        quizzes={(lesson as any).quizzes || []}
                        onDeleteMaterial={askDeleteConfirmation}
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
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <button
                    onClick={handleBackToCourseDisplay}
                    className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
                    disabled={isSaving}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </button>

                {/* Course Header */}
                <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            {isEditMode ? (
                                <div className="relative">
                                    {courseData.thumbnailUrl ? (
                                        <img 
                                            src={courseData.thumbnailUrl} 
                                            alt={courseData.title} 
                                            className="w-full h-48 object-cover rounded-xl shadow-lg opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center opacity-80">
                                            <BookOpen className="w-16 h-16 text-[#D68BF9]" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <label className="cursor-pointer bg-[#1B0A3F]/80 hover:bg-[#1B0A3F] text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-1">
                                            <Edit size={16} />
                                            Change Thumbnail
                                            <input
                                                type="file"
                                                name="thumbnail"
                                                accept="image/*"
                                                onChange={handleEditCourseInputChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                courseData.thumbnailUrl ? (
                                    <img 
                                        src={courseData.thumbnailUrl} 
                                        alt={courseData.title} 
                                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-[#D68BF9]" />
                                    </div>
                                )
                            )}
                        </div>
                        
                        <div className="md:col-span-2">
                            {isEditMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[#D68BF9] text-sm mb-1">Course Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editCourseDetails.title}
                                            onChange={handleEditCourseInputChange}
                                            className="w-full bg-[#34137C]/50 border border-[#BF4BF6]/30 rounded-lg p-2 text-white focus:outline-none focus:border-[#BF4BF6]"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[#D68BF9] text-sm mb-1">Category</label>
                                            <select
                                                name="categoryId"
                                                value={editCourseDetails.categoryId}
                                                onChange={handleEditCourseInputChange}
                                                className="w-full bg-[#34137C]/50 border border-[#BF4BF6]/30 rounded-lg p-2 text-white focus:outline-none focus:border-[#BF4BF6]"
                                            >
                                                {availableCategories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[#D68BF9] text-sm mb-1">Estimated Time (hours)</label>
                                            <input
                                                type="number"
                                                name="estimatedTime"
                                                value={editCourseDetails.estimatedTime}
                                                onChange={handleEditCourseInputChange}
                                                min="1"
                                                className="w-full bg-[#34137C]/50 border border-[#BF4BF6]/30 rounded-lg p-2 text-white focus:outline-none focus:border-[#BF4BF6]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[#D68BF9] text-sm mb-1">Technologies</label>
                                        <div className="bg-[#34137C]/50 border border-[#BF4BF6]/30 rounded-lg p-2 flex flex-wrap gap-2">
                                            {availableTechnologies.map(tech => (
                                                <label key={tech.id} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={editCourseDetails.technologyIds.includes(tech.id)}
                                                        onChange={() => handleEditCourseTechnologyChange(tech.id)}
                                                        className="form-checkbox h-4 w-4 text-[#BF4BF6] transition duration-150 ease-in-out"
                                                    />
                                                    <span className="ml-2 text-white text-sm">{tech.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[#D68BF9] text-sm mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={editCourseDetails.description}
                                            onChange={handleEditCourseInputChange}
                                            rows={3}
                                            className="w-full bg-[#34137C]/50 border border-[#BF4BF6]/30 rounded-lg p-2 text-white focus:outline-none focus:border-[#BF4BF6]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-3">
                                        <h1 className="text-2xl font-bold text-white">{courseData.title}</h1>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleToggleEditMode}
                                                disabled={isSaving}
                                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                <Edit size={16} /> Edit Course
                                            </button>
                                            <button
                                                onClick={refreshAllQuizData}
                                                title="Refresh course data"
                                                className="bg-[#34137C] hover:bg-[#4A1F95] text-white p-2 rounded-lg transition-colors shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
                                            {courseData.category.title}
                                        </span>
                                        {courseData.technologies.map(tech => (
                                            <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
                                                {tech.name}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <p className="text-gray-300 mb-4">{courseData.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
                                            Estimated time: {courseData.estimatedTime} hours
                                        </div>
                                        <div className="flex items-center">
                                            <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
                                            Lessons: {courseData.lessons.length}
                                        </div>
                                        <div className="flex items-center">
                                            <Award className="w-4 h-4 mr-2 text-[#D68BF9]" />
                                            Average Rating: {calculateTotalCoursePoints}/10
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {isEditMode && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleToggleEditMode}
                                disabled={isSaving}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCourse}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Course Materials Section */}
                <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Course Lessons & Materials</h2>
                            <p className="text-gray-400 text-sm">Organize and manage subtopics, documents, and quizzes.</p>
                        </div>
                        
                        {isEditMode && (
                            <button
                                onClick={handleAddSubtopic}
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                disabled={isSaving}
                            >
                                <Plus size={16} /> Add New Lesson
                            </button>
                        )}
                    </div>
                    
                    {courseData.lessons.length === 0 ? (
                        <div className="bg-[#34137C]/30 rounded-xl p-8 text-center">
                            <BookOpen className="w-12 h-12 text-[#D68BF9] mx-auto mb-4 opacity-70" />
                            <p className="text-gray-300 mb-4">No lessons added yet.</p>
                            {isEditMode && (
                                <button
                                    onClick={handleAddSubtopic}
                                    className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Your First Lesson
                                </button>
                            )}
                        </div>
                    ) : (
                        renderCourseMaterials()
                    )}
                </div>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    message={`Are you sure you want to remove "${materialToDelete?.name || 'this material'}"? This cannot be undone.`}
                />
            </div>
        </div>
    );
};

export default CoordinatorCourseOverview;