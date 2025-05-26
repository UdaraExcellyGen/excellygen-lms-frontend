// src/features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/CoordinatorCourseOverview.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    CourseDto,
    LessonDto,
    CreateLessonPayload,
    CategoryDto,
    TechnologyDto,
    UpdateCourseCoordinatorDtoFE,
    UpdateLessonPayload,
    CreateCoursePayload // Added missing import
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

    // Fixed syntax error in useState declaration
    const [editCourseDetails, setEditCourseDetails] = useState<
        (CreateCoursePayload & { thumbnail: File | null }) | null
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

                // Initialize edit form data
                setEditCourseDetails({
                    title: fetchedCourse.title,
                    description: fetchedCourse.description || '',
                    estimatedTime: fetchedCourse.estimatedTime,
                    categoryId: fetchedCourse.category.id,
                    technologyIds: fetchedCourse.technologies.map(t => t.id),
                    thumbnail: null,
                });

                // Initialize edit subtopics data and expanded state
                const initialEditSubtopics: Record<number, EditSubtopicData> = {};
                const initialExpandedSubtopics: Record<number, boolean> = {};
                
                for (const lesson of fetchedCourse.lessons) {
                    initialEditSubtopics[lesson.id] = {
                        lessonName: lesson.lessonName,
                        lessonPoints: lesson.lessonPoints,
                    };
                    initialExpandedSubtopics[lesson.id] = true;
                    
                    // Fetch quizzes for each lesson
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
    }, [courseId, navigate]);

    // Rest of the component remains unchanged...

    // Click outside dropdown handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
                setIsTechnologiesDropdownOpen(false);
            }
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
                categoryId: courseData.category.id,
                technologyIds: courseData.technologies.map(t => t.id),
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
            toast("You are now in edit mode.");
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
            const updatedCourseDto = await updateCourseBasicDetails(courseId, coursePayload, thumbnail);

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

        } catch (error) {
            console.error("Error saving course:", error);
            toast.error("Failed to save course changes. Please try again.", { id: saveToastId });
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
                    navigate(`/coordinator/edit-quiz/${quizId}?lessonId=${lessonId}&courseId=${courseId}`);
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

                {/* Course Overview Header Section */}
                <CourseOverviewHeader
                    courseData={courseData}
                    isEditMode={isEditMode}
                    editCourseDetails={editCourseDetails}
                    handleToggleEditMode={handleToggleEditMode}
                    handleSaveCourse={handleSaveCourse}
                    handleEditCourseInputChange={handleEditCourseInputChange}
                    handleEditCourseTechnologyChange={handleEditCourseTechnologyChange}
                    availableCategories={availableCategories}
                    availableTechnologies={availableTechnologies}
                    isSaving={isSaving}
                    totalCoursePoints={calculateTotalCoursePoints}
                    technologiesDropdownRef={technologiesDropdownRef}
                    isTechnologiesDropdownOpen={isTechnologiesDropdownOpen}
                    setIsTechnologiesDropdownOpen={setIsTechnologiesDropdownOpen}
                />

                {/* Course Materials Section */}
                <CourseOverviewCourseSection
                    title="Course Lessons & Materials"
                    description="Organize and manage subtopics, documents, and quizzes."
                    expanded={expandedTopics.includes('materials')}
                    onToggle={() => toggleSection('materials')}
                    icon={null}
                >
                    {isEditMode && (
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleAddSubtopic}
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1"
                                disabled={isSaving}
                            >
                                <Plus size={16} /> Add New Lesson
                            </button>
                        </div>
                    )}

                    {courseData.lessons.length === 0 && (
                        <p className="text-gray-300 text-center py-4">
                            No lessons added yet. {isEditMode && "Click 'Add New Lesson' to begin."}
                        </p>
                    )}

                    {courseData.lessons.map(lesson => (
                        <SubtopicItem
                            key={lesson.id}
                            lesson={lesson}
                            isEditMode={isEditMode}
                            editData={editSubtopicsData[lesson.id]}
                            onEditNameChange={handleEditSubtopicNameChange}
                            onEditPointsChange={handleEditSubtopicPointsChange}
                            onRemoveSubtopic={handleRemoveSubtopic}
                            isExpanded={expandedSubtopics[lesson.id]}
                            toggleExpand={() => toggleSubtopicExpand(lesson.id)}
                            materials={groupedMaterials[lesson.id]}
                            quizzes={groupedQuizzes[lesson.id]}
                            onDeleteMaterial={askDeleteConfirmation}
                            onAddMaterial={handleAddMaterial}
                            onCancelDocumentUpload={handleCancelDocumentUpload}
                            onDocumentFileChange={handleDocumentFileChange}
                            newDocumentFile={newDocumentFiles[lesson.id]}
                            isUploadingDoc={uploadingDocId === lesson.id}
                            onAddVideo={handleAddVideoMaterial}
                            onCreateQuiz={handleCreateQuiz}
                            onEditQuiz={handleEditQuiz}
                            onRemoveQuiz={handleRemoveQuiz}
                            isSaving={isSaving}
                            lessonPointsDisplay={lessonPointsDisplay[lesson.id]}
                        />
                    ))}
                </CourseOverviewCourseSection>

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