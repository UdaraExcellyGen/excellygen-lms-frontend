// features/createNewCourse/UploadMaterials.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseContext } from '../../contexts/CourseContext';
import CourseMaterialsSection from './components/CourseMaterialsSection';
import PageHeader from './components/PageHeader';
import ProgressBar from './components/ProgressBar';
import BottomNavigation from './components/BottomNavigation';
import { Subtopic, QuizBank, MaterialFile } from './types/types';

const UploadMaterials: React.FC = () => {
    const navigate = useNavigate();
    const { courseData, updateCourseMaterials } = useCourseContext();

    const [subtopics, setSubtopics] = useState<Subtopic[]>(courseData.materials);
    const [materialsSaved, setMaterialsSaved] = useState<boolean>(false);

    const handleSaveQuizForSubtopic = (subtopicId: string, quizBankData: QuizBank) => {
        setSubtopics(prevSubtopics => {
            return prevSubtopics.map(subtopic => {
                if (subtopic.id === subtopicId) {
                    const quizMaterial: MaterialFile = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: quizBankData.quizDetails.title || 'Unnamed Quiz',
                        type: 'quiz',
                        file: null,
                        quizId:  Math.random().toString(36).substr(2, 9)
                    };
                    return {
                        ...subtopic,
                        hasQuiz: true,
                        quizBank: quizBankData,
                        materials: [...subtopic.materials, quizMaterial],
                    };
                }
                return subtopic;
            });
        });
        alert("Quiz bank saved!");
    };


    const handleSaveOverviewQuizDetails = (subtopicId: string, updatedQuizBank: QuizBank) => {
        setSubtopics(prevSubtopics => {
            return prevSubtopics.map(subtopic => {
                if (subtopic.id === subtopicId) {
                    const updatedMaterials = subtopic.materials.map(material => {
                        if (material.type === 'quiz' && material.quizId === material.id) {
                            return {
                                ...material,
                                name: updatedQuizBank.quizDetails.title || 'Unnamed Quiz',
                            };
                        }
                        return material;
                    });

                    return {
                        ...subtopic,
                        quizBank: updatedQuizBank,
                        materials: updatedMaterials,
                    };
                }
                return subtopic;
            });
        });
    };


    const handleSaveMaterials = () => {
        updateCourseMaterials(subtopics);
        setMaterialsSaved(true);
    };

    const handleNext = () => {
        if (!materialsSaved) {
            handleSaveMaterials();
        }
        navigate('/coordinator/publish-course');
    };

    const handleSaveDraft = () => {
        alert("Course saved as draft!");
    };


    const handleSubtopicPointsChange = (subtopicIndex: number, points: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                subtopicPoints: points
            };
            return updatedSubtopics;
        });
    };

    const handleSubtopicTitleChange = (subtopicIndex: number, title: string) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                title: title
            };
            return updatedSubtopics;
        });
    };

    const addNewSubtopic = () => {
        const newId = (subtopics.length + 1).toString();
        setSubtopics(prevSubtopics => [...prevSubtopics, { id: newId, title: '', materials: [], hasQuiz: false, quizBank: null, subtopicPoints: 1 }]);
    };

    const handleRemoveSubtopic = (subtopicId: string) => {
        setSubtopics(prevSubtopics => {
            return prevSubtopics.filter(subtopic => subtopic.id !== subtopicId);
        });
    };

    const handleRemoveMaterial = (materialId: string, subtopicIndex: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                materials: updatedSubtopics[subtopicIndex].materials.filter(material => material.id !== materialId)
            };
            return updatedSubtopics;
        });
        setMaterialsSaved(false);
    };

    const handleAddMaterial = (newMaterial: MaterialFile, subtopicIndex: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                materials: [...updatedSubtopics[subtopicIndex].materials, newMaterial]
            };
            return updatedSubtopics;
        });
        setMaterialsSaved(false);
    };

    const handleRemoveQuiz = (subtopicIndex: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                hasQuiz: false,
                quizBank: null,
                materials: updatedSubtopics[subtopicIndex].materials.filter(material => material.type !== 'quiz')
            };
            return updatedSubtopics;
        });
    };

    const handleSetQuizBank = (subtopicIndex: number, quizBank: QuizBank) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                quizBank: quizBank,
                hasQuiz: true,
            };
            return updatedSubtopics;
        });
    };


    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <PageHeader
                title="Create New Courses"
                onSaveDraft={handleSaveDraft}
                onBack={() => navigate('/coordinator/course-details')}
            />

            <ProgressBar activeStep={2} steps={['Course Details', 'Upload Materials', 'Publish Course']} />

            <CourseMaterialsSection
                subtopics={subtopics}
                onSubtopicsChange={setSubtopics}
                onAddNewSubtopic={addNewSubtopic}
                onRemoveSubtopic={handleRemoveSubtopic}
                onSubtopicTitleChange={handleSubtopicTitleChange}
                onSubtopicPointsChange={handleSubtopicPointsChange}
                onRemoveMaterial={handleRemoveMaterial}
                onAddMaterial={handleAddMaterial}
                onSaveQuizForSubtopic={handleSaveQuizForSubtopic}
                onSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                onRemoveQuiz={handleRemoveQuiz}
                onSetQuizBank={handleSetQuizBank}
            />

            <BottomNavigation
                onBack={() => navigate("/coordinator/course-details")}
                onNext={handleNext}
                nextText="Save Materials & Next"
            />
        </div>
    );
};

export default UploadMaterials;