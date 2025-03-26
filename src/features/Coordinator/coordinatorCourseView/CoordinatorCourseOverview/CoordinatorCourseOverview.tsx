// features/Mainfolder/CoordinatorCourseOverview/CoordinatorCourseOverview.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
} from 'lucide-react';
import {
    Material,
    QuizDetails,
    Question,
    CourseData,
    EditSubtopicData
} from './types/index';
import { courseDataMock, mockMaterials, mockQuizDetails, mockQuestions } from './data/mockData';
import CourseOverviewHeader from './components/CourseOverviewHeader';
import CourseOverviewCourseSection from './components/CourseOverviewCourseSection';
import SubtopicItem from './components/SubtopicItem';
import MaterialList from './components/MaterialList';
import QuizList from './components/QuizList';
import ConfirmationDialog from './components/ConfirmationDialog';
import { Plus } from 'lucide-react';


const CoordinatorCourseOverview: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [expandedTopics, setExpandedTopics] = useState<string[]>(['materials']);
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
    const [mockMaterialsState, setMockMaterialsState] = useState<Material[]>(mockMaterials);
    const [mockQuizDetailsState, setMockQuizDetailsState] = useState<QuizDetails[]>(mockQuizDetails);
    const [mockQuestionsState, setMockQuestionsState] = useState<Question[]>(mockQuestions);
    const [courseDataState, setCourseDataState] = useState<CourseData>(courseDataMock);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDeleteId, setMaterialToDeleteId] = useState<string | null>(null);
    const [newDocumentFiles, setNewDocumentFiles] = useState<Record<string, File | null>>({});
    const [uploadingSubtopic, setUploadingSubtopic] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editCourseData, setEditCourseData] = useState<CourseData>({});
    const [subtopics, setSubtopics] = useState<string[]>([]);
    const [editSubtopics, setEditSubtopics] = useState<Record<string, EditSubtopicData>>({});
    const [uploadingMaterialSubtopic, setUploadingMaterialSubtopic] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const savedQuizData = sessionStorage.getItem('updatedQuizData');

        if (savedQuizData) {
            try {
                const { subtopicId, quizBankData } = JSON.parse(savedQuizData);

                setMockQuizDetailsState(prevQuizDetails => {
                    return prevQuizDetails.map(quiz => {
                        if (quiz.subtopic === subtopicId) {
                            return {
                                ...quiz,
                                title: quizBankData.name || quiz.title,
                                bankSize: quizBankData.bankSize || quiz.bankSize,
                                quizSize: quizBankData.quizSize || quiz.quizSize,
                                duration: quizBankData.duration || quiz.duration,
                                questions: quizBankData.questions || quiz.questions,
                            };
                        }
                        return quiz;
                    });
                });

                setCourseDataState(prevCourseData => {
                    if (prevCourseData.quizDetails) {
                        const updatedQuizDetails = prevCourseData.quizDetails.map(quiz => {
                            if (quiz.subtopic === subtopicId) {
                                return {
                                    ...quiz,
                                    title: quizBankData.name || quiz.title,
                                    bankSize: quizBankData.bankSize || quiz.bankSize,
                                    quizSize: quizBankData.quizSize || quiz.quizSize,
                                    duration: quizBankData.duration || quiz.duration,
                                    questions: quizBankData.questions || quiz.questions,
                                };
                            }
                            return quiz;
                        });

                        return {
                            ...prevCourseData,
                            quizDetails: updatedQuizDetails
                        };
                    }
                    return prevCourseData;
                });

                sessionStorage.removeItem('updatedQuizData');
                console.log(`Quiz for subtopic ${subtopicId} updated successfully`);
            } catch (error) {
                console.error('Error parsing saved quiz data:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (isEditMode) {
            setEditCourseData(courseDataState);
            const initialSubtopics: string[] = Array.from(new Set([
                ...(courseDataState.materials || []).map(m => m.subtopic),
                ...(courseDataState.quizDetails || []).map(q => q.subtopic)
            ]));
            setSubtopics(initialSubtopics);
            const subtopicEditMap: Record<string, EditSubtopicData> = {};
            initialSubtopics.forEach(subtopic => {
                const initialPoints = courseDataState.quizDetails?.find(quiz => quiz.subtopic === subtopic)?.points || 0;
                subtopicEditMap[subtopic] = { name: subtopic, points: initialPoints };
            });
            setEditSubtopics(subtopicEditMap);
        } else {
            const initialSubtopics: string[] = Array.from(new Set([
                ...(courseDataState.materials || []).map(m => m.subtopic),
                ...(courseDataState.quizDetails || []).map(q => q.subtopic)
            ]));
            setSubtopics(initialSubtopics);
        }
    }, [isEditMode, courseDataState]);


    const toggleSection = (sectionId: string) => {
        setExpandedTopics(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleSubtopic = (subtopicId: string) => {
        setExpandedSubtopics(prev => ({
            ...prev,
            [subtopicId]: !prev[subtopicId],
        }));
    };

    const handleBack = () => {
        navigate("/coordinator/CoursesPage");
    };

    const handleAssign = () => {
        navigate("/coordinator/AssignLearners");
    };

    const handleDeleteMaterial = (materialId: string) => {
        setMockMaterialsState(prevMaterials => prevMaterials.filter(material => material.id !== materialId));
        setDeleteDialogOpen(false);
        setMaterialToDeleteId(null);
    };

    const handleConfirmDelete = () => {
        if (materialToDeleteId) {
            handleDeleteMaterial(materialToDeleteId);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setMaterialToDeleteId(null);
    };

    const askDeleteConfirmation = (materialId: string) => {
        setMaterialToDeleteId(materialId);
        setDeleteDialogOpen(true);
    };


    const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>, subtopic: string) => {
        if (event.target.files && event.target.files[0]) {
            setNewDocumentFiles(prevFiles => ({
                ...prevFiles,
                [subtopic]: event.target.files[0],
            }));
        } else {
            setNewDocumentFiles(prevFiles => ({
                ...prevFiles,
                [subtopic]: null,
            }));
        }
    };

    const handleCancelDocumentUpload = (subtopic: string) => {
        setNewDocumentFiles(prevFiles => ({
            ...prevFiles,
            [subtopic]: null,
        }));
    };


    const handleAddMaterial = async (subtopic: string) => {
        const file = newDocumentFiles[subtopic];
        if (!file) {
            alert("Please select a document file to upload.");
            console.log("handleAddMaterial: No file selected for subtopic", subtopic);
            return;
        }

        setUploadingMaterialSubtopic(subtopic);
        console.log(`handleAddMaterial: Upload started for subtopic: ${subtopic}, file:`, file);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newMaterial: Material = {
                id: String(Date.now()),
                type: 'document',
                name: file.name,
                url: 'uploaded-documents/' + file.name,
                subtopic: subtopic
            };

            setMockMaterialsState(prevMaterials => [...prevMaterials, newMaterial]);


            setCourseDataState(prevCourseData => ({
                ...prevCourseData,
                materials: [...prevCourseData.materials || [], newMaterial]
            }));


            setNewDocumentFiles(prevFiles => ({
                ...prevFiles,
                [subtopic]: null,
            }));
            console.log(`handleAddMaterial: Material added successfully for subtopic: ${subtopic}, material:`, newMaterial);

        } catch (error) {
            console.error(`handleAddMaterial: Error uploading material for subtopic ${subtopic}:`, error);
            alert(`Error uploading document for ${subtopic}. Please check console.`);
        } finally {
            setUploadingMaterialSubtopic(null);
        }
    };


    const handleAddVideoMaterial = (subtopic: string) => {
        navigate(`/course/${courseId}/add-video?subtopic=${subtopic}`);
    };


    const handleEditQuiz = (subtopic: string) => {
        const quizDetails = mockQuizDetailsState.find(quiz => quiz.subtopic === subtopic);

        if (quizDetails) {
            navigate(`/coordinator/quiz-creator`, {
                state: {
                    subtopicId: subtopic,
                    quizDetails: quizDetails,
                    fromCourseOverview: true
                }
            });
        } else {
            console.error(`No quiz found for subtopic: ${subtopic}`);
        }
    };

    const handleEditCourse = () => {
        setIsEditMode(true);
    };

    const handleSaveCourse = () => {
        const updatedMaterials = courseDataState.materials?.map(material => {
            return {
                ...material,
                subtopic: editSubtopics[material.subtopic]?.name || material.subtopic
            };
        }) || [];

        const updatedQuizDetails = courseDataState.quizDetails?.map(quiz => {
            const editedSubtopicData = editSubtopics[quiz.subtopic];
            return {
                ...quiz,
                subtopic: editedSubtopicData?.name || quiz.subtopic,
                points: editedSubtopicData?.points !== undefined ? editSubtopics[quiz.subtopic].points : quiz.points,
            };
        }) || [];


        const updatedCourseData = {
            ...editCourseData,
            materials: updatedMaterials,
            quizDetails: updatedQuizDetails,
        };

        console.log("Saving course data:", updatedCourseData);
        setCourseDataState(updatedCourseData);
        setIsEditMode(false);
    };


    const handleCancelEditCourse = () => {
        setIsEditMode(false);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let parsedValue: string | number = value;
        if (name === 'deadline') {
            let numValue = parseInt(value, 10);
            if (isNaN(numValue)) {
                numValue = 0;
            } else {
                numValue = Math.max(0, numValue);
            }
            parsedValue = numValue;
        }
        setEditCourseData(prevData => ({
            ...prevData,
            [name]: parsedValue,
        }));
    };

    const handleEditSubtopicChange = (oldSubtopic: string, newName: string) => {
        setEditSubtopics(prev => ({
            ...prev,
            [oldSubtopic]: { ...prev[oldSubtopic], name: newName }
        }));
    };

    const handleEditSubtopicPointsChange = (oldSubtopic: string, newPoints: number) => {
        setEditSubtopics(prev => ({
            ...prev,
            [oldSubtopic]: { ...prev[oldSubtopic], points: newPoints }
        }));
    };


    const groupedMaterials = useCallback(() => {
        console.log("groupedMaterials: Recalculating grouped materials");
        return courseDataState?.materials?.reduce((groups, material) => {
            const { subtopic } = material;
            const displaySubtopic = isEditMode && editSubtopics[subtopic] !== undefined ? editSubtopics[subtopic].name : subtopic;
            groups[displaySubtopic] = groups[displaySubtopic] || [];
            groups[displaySubtopic].push(material);
            return groups;
        }, {} as Record<string, Material[]>);
    }, [courseDataState?.materials, isEditMode, editSubtopics]);


    const groupedQuizzes = useCallback(() => {
        return courseDataState?.quizDetails?.reduce((groups, quiz) => {
            const { subtopic } = quiz;
            const displaySubtopic = isEditMode && editSubtopics[subtopic] !== undefined ? editSubtopics[subtopic].name : subtopic;
            groups[displaySubtopic] = groups[displaySubtopic] || [];
            groups[displaySubtopic].push(quiz);
            return groups;
        }, {} as Record<string, QuizDetails[]>);
    }, [courseDataState?.quizDetails, isEditMode, editSubtopics]);


    const memoizedGroupedMaterials = groupedMaterials();
    const memoizedGroupedQuizzes = groupedQuizzes();

    const subtopicPoints = useMemo(() => {
        const pointsMap: Record<string, number> = {};
        if (courseDataState?.quizDetails) {
            courseDataState.quizDetails.forEach(quiz => {
                const displaySubtopic = isEditMode && editSubtopics[quiz.subtopic] !== undefined ? editSubtopics[quiz.subtopic].name : quiz.subtopic;
                pointsMap[displaySubtopic] = (pointsMap[displaySubtopic] || 0) + (isEditMode && editSubtopics[quiz.subtopic]?.points !== undefined ? editSubtopics[quiz.subtopic].points : quiz.points);
            });
        }
        return pointsMap;
    }, [courseDataState?.quizDetails, isEditMode, editSubtopics]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-4 md:space-y-8 relative">
                <button
                    onClick={handleBack}
                    className="flex items-center text-[#D68BF9] hover:text-white transition-colors mb-4 md:mb-6 font-nunito"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Back to Previous Page
                </button>

                <CourseOverviewHeader
                    isEditMode={isEditMode}
                    editCourseData={isEditMode ? editCourseData : courseDataState}
                    isMobileMenuOpen={isMobileMenuOpen}
                    handleEditCourse={handleEditCourse}
                    handleSaveCourse={handleSaveCourse}
                    handleCancelEditCourse={handleCancelEditCourse}
                    handleAssign={handleAssign}
                    handleEditInputChange={handleEditInputChange}
                    toggleMobileMenu={toggleMobileMenu}
                />

                <CourseOverviewCourseSection
                    title="Course Materials"
                    description="Documents, videos and quizes"
                    icon={<FileText className="w-3 h-3 sm:w-5 sm:h-5 text-white" />}
                    expanded={expandedTopics.includes('materials')}
                    onToggle={() => toggleSection('materials')}
                >
                    {subtopics.map((subtopic) => {
                        const displaySubtopicName = isEditMode && editSubtopics[subtopic] !== undefined ? editSubtopics[subtopic].name : subtopic;
                        return (
                            <SubtopicItem
                                key={subtopic}
                                subtopic={subtopic}
                                displaySubtopicName={displaySubtopicName}
                                expandedSubtopics={expandedSubtopics}
                                toggleSubtopic={toggleSubtopic}
                                isEditMode={isEditMode}
                                editSubtopics={editSubtopics}
                                handleEditSubtopicChange={handleEditSubtopicChange}
                                handleEditSubtopicPointsChange={handleEditSubtopicPointsChange}
                                subtopicPoints={subtopicPoints}
                            >
                                <MaterialList
                                    materials={memoizedGroupedMaterials?.[displaySubtopicName]}
                                    askDeleteConfirmation={askDeleteConfirmation}
                                />
                                <QuizList
                                    quizzes={memoizedGroupedQuizzes?.[displaySubtopicName]}
                                    handleEditQuiz={handleEditQuiz}
                                />
                                {isEditMode && (
                                    <div className="flex flex-wrap gap-2 mt-4 items-center">
                                        <input type="file" id={`document-upload-${subtopic}`} className="hidden" onChange={(e) => handleDocumentFileChange(e, subtopic)} />
                                        <label htmlFor={`document-upload-${subtopic}`} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-full transition-colors font-nunito cursor-pointer text-xs sm:text-sm">
                                            Upload Doc
                                        </label>
                                        {newDocumentFiles[subtopic] && <span className="text-[#D68BF9] ml-2 font-nunito text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">{newDocumentFiles[subtopic]?.name}</span>}
                                        {newDocumentFiles[subtopic] && !uploadingMaterialSubtopic && (
                                            <button onClick={() => handleAddMaterial(subtopic)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-full transition-colors font-nunito text-xs sm:text-sm">Upload</button>
                                        )}
                                        {uploadingMaterialSubtopic === subtopic && (
                                            <span className="text-white ml-2 font-nunito text-xs sm:text-sm">Uploading...</span>
                                        )}
                                        {newDocumentFiles[subtopic] && !uploadingMaterialSubtopic && (
                                            <button onClick={() => handleCancelDocumentUpload(subtopic)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-full transition-colors font-nunito text-xs sm:text-sm">Cancel</button>
                                        )}
                                        <button
                                            onClick={() => handleAddVideoMaterial(subtopic)}
                                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-full transition-colors font-nunito text-xs sm:text-sm"
                                        >
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block align-middle" />
                                            Add Video
                                        </button>
                                    </div>
                                )}
                                {(!memoizedGroupedMaterials?.[displaySubtopicName] || memoizedGroupedMaterials[displaySubtopicName].length === 0) &&
                                    (!memoizedGroupedQuizzes?.[displaySubtopicName] || memoizedGroupedQuizzes[displaySubtopicName].length === 0) && isEditMode && (
                                        <div className="text-white p-2 sm:p-4 font-nunito text-sm">No materials or quizes uploaded yet for this subtopic.</div>
                                )}
                            </SubtopicItem>
                        );
                    })}
                    {(!courseDataState?.materials || courseDataState.materials.length === 0) &&
                        (!courseDataState?.quizDetails || courseDataState.quizDetails.length === 0) && !isEditMode && (
                            <div className="text-white p-2 sm:p-4 font-nunito text-sm">No materials or quizes uploaded yet.</div>
                    )}
                </CourseOverviewCourseSection>


                <CourseOverviewCourseSection
                    title="Technologies"
                    icon={<FileText className="w-3 h-3 sm:w-5 sm:h-5 text-white" />}
                    expanded={true} // Always expanded
                    onToggle={() => {}} // No toggle needed
                >
                    <div className="flex flex-wrap gap-2">
                        {courseDataState.technologies?.map((tech, index) => (
                            <span key={index} className="bg-[#34137C] text-white rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-nunito">{tech}</span>
                        ))}
                    </div>
                </CourseOverviewCourseSection>


                <CourseOverviewCourseSection
                    title="Course Details"
                    icon={<FileText className="w-3 h-3 sm:w-5 sm:h-5 text-white" />}
                    expanded={true} // Always expanded
                    onToggle={() => {}} // No toggle needed
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <p className="text-[#ffffff] font-nunito font-medium text-sm sm:text-base">Estimated Time</p>
                            {isEditMode ? (
                                <input
                                    type="number"
                                    name="deadline"
                                    value={editCourseData.deadline !== undefined ? String(editCourseData.deadline) : ''}
                                    onChange={handleEditInputChange}
                                    placeholder="Hours"
                                    className="block w-full p-1 sm:p-2 text-white bg-transparent border border-[#BF4BF6]/50 rounded-md focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-unbounded text-base sm:text-xl font-bold mt-1"
                                />
                            ) : (
                                <p className="text-base sm:text-xl font-bold text-[#ffffff] mt-1 font-unbounded">{courseDataState?.deadline} Hours</p>
                            )}
                        </div>
                    </div>
                </CourseOverviewCourseSection>

                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            </div>
        </div>
    );
};

export default CoordinatorCourseOverview;