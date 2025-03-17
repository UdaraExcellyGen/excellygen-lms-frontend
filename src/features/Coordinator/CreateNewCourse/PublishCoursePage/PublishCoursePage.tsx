// PublishCoursePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCourseContext } from '../../contexts/CourseContext';
import { QuizBank, Subtopic, Course } from '../../contexts/CourseContext';

import PageHeader from './components/PageHeader';
import ProgressSteps from './components/ProgressSteps';
import CourseMaterialsSection from './components/CourseMaterialsSection';
import ConfirmationDialog from './components/ConfirmationDialog';
import QuizOverviewModal from './components/QuizOverviewModal';
import PublishButton from './components/PublishButton';

interface PublishCoursePageProps {}

const PublishCoursePage: React.FC<PublishCoursePageProps> = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const location = useLocation();
    const { courseData: contextCourseData, setCourseData } = useCourseContext();

    const [localSubtopics, setLocalSubtopics] = useState<Subtopic[]>(
        contextCourseData?.materials || []
    );
    const courseData: Course = {
        title: contextCourseData?.basicDetails?.title || "Untitled Course",
        description: contextCourseData?.basicDetails?.description || "",
        thumbnailUrl: contextCourseData?.basicDetails?.thumbnail
            ? URL.createObjectURL(contextCourseData.basicDetails.thumbnail)
            : '/api/placeholder/400/200',
        deadline: contextCourseData?.basicDetails?.estimatedTime || "",
        coordinatorPoints: 0,
    };

    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials']);
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
    const [pageCourseData, setPageCourseData] = useState<Course>(courseData);

    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDeleteId, setMaterialToDeleteId] = useState<string | null>(null);
    const [showQuizOverviewPage, setShowQuizOverviewPage] = useState<QuizBank | null>(null);


    useEffect(() => {
        if (contextCourseData?.materials) {
            setLocalSubtopics(contextCourseData.materials);
        }
    }, [contextCourseData]);

    React.useEffect(() => {
        const totalPoints = localSubtopics.reduce(
            (sum, subtopic) => sum + (subtopic.subtopicPoints || 0),
            0
        );
        setPageCourseData(prevPageCourseData => ({
            ...prevPageCourseData,
            coordinatorPoints: totalPoints,
        }));
    }, [localSubtopics]);

    React.useEffect(() => {
        setPageCourseData({
            title: contextCourseData?.basicDetails?.title || "Untitled Course",
            description: contextCourseData?.basicDetails?.description || "",
            thumbnailUrl: contextCourseData?.basicDetails?.thumbnail
                ? URL.createObjectURL(contextCourseData.basicDetails.thumbnail)
                : '/api/placeholder/400/200',
            deadline: contextCourseData?.basicDetails?.estimatedTime || "",
            coordinatorPoints: pageCourseData.coordinatorPoints,
        });
    }, [contextCourseData, pageCourseData.coordinatorPoints]);

    useEffect(() => {
        const initialExpandedState: Record<string, boolean> = {};
        localSubtopics.forEach(subtopic => {
            initialExpandedState[subtopic.id] = true;
        });
        setExpandedSubtopics(initialExpandedState);
    }, [localSubtopics]);


    const handleBack = () => {
        navigate("/coordinator/upload-materials");
    };

    const handleSaveDraft = () => {
        alert('Course saved as draft successfully');
        navigate('/coordinator/course-display-page');
    };

    const handlePublish = () => {
        console.log('Course materials on publish:', localSubtopics);
        console.log('Course published');
        alert('Course published successfully!');
        navigate('/coordinator/course-display-page');
    };

    const handleViewQuiz = (quizBank: QuizBank | undefined) => {
        setShowQuizOverviewPage(quizBank || null);
    };

    const handleCloseQuizOverview = () => {
        setShowQuizOverviewPage(null);
    };

    const handleSaveOverviewQuizDetails = (updatedQuizBank: QuizBank) => {
        handleCloseQuizOverview();
        alert("Quiz overview details saved.");
    };


    const handleConfirmDelete = () => {
        if (materialToDeleteId) {
            const updatedSubtopics = localSubtopics.map(subtopic => ({
                ...subtopic,
                materials: subtopic.materials.filter(material => material.id !== materialToDeleteId)
            }));
            setLocalSubtopics(updatedSubtopics);
            setCourseData(prevCourseData => ({
                ...prevCourseData,
                materials: updatedSubtopics,
            }));
            setDeleteDialogOpen(false);
            setMaterialToDeleteId(null);
            alert('Material deleted successfully!');
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setMaterialToDeleteId(null);
    };

    const handleDeleteMaterial = (materialId: string) => {
        setMaterialToDeleteId(materialId);
        setDeleteDialogOpen(true);
    };

    const toggleSubtopic = (subtopicId: string) => {
        setExpandedSubtopics(prev => ({
            ...prev,
            [subtopicId]: !prev[subtopicId],
        }));
    };


    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <PageHeader title="Create New Courses" onBack={handleBack} onSaveDraft={handleSaveDraft} />
            <ProgressSteps currentStep={3} />

            <div className="max-w-7xl mx-auto px-8 py-12 space-y-8 relative">
                <CourseMaterialsSection
                    localSubtopics={localSubtopics}
                    expandedTopics={expandedTopics}
                    setExpandedTopics={setExpandedTopics}
                    expandedSubtopics={expandedSubtopics}
                    setExpandedSubtopics={setExpandedSubtopics}
                    toggleSubtopic={toggleSubtopic}
                    handleDeleteMaterial={handleDeleteMaterial}
                    handleViewQuiz={handleViewQuiz}
                    showQuizOverviewPage={showQuizOverviewPage}
                    handleCloseQuizOverview={handleCloseQuizOverview}
                    handleSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                />

                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    message="Are you sure you want to remove this file?"
                />

                {showQuizOverviewPage && (
                    <QuizOverviewModal
                        quizBank={showQuizOverviewPage}
                        onClose={handleCloseQuizOverview}
                        onSave={handleSaveOverviewQuizDetails}
                        isFullScreen={true}
                        subtopicId="" // Pass subtopicId if needed for QuizOverviewPage
                    />
                )}
            </div>

            <PublishButton onPublish={handlePublish} />
        </div>
    );
};

export default PublishCoursePage;