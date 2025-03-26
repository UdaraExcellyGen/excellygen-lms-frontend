import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCourseContext } from '../../contexts/CourseContext';
import { Subtopic, MaterialFile } from './types/index'; // Import interfaces from types/index.ts
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import SubtopicItem from './components/SubtopicItem';
import BottomNavigation from './components/BottomNavigation';

const UploadMaterials: React.FC = () => {
    const navigate = useNavigate();
    const { courseData, updateCourseMaterials } = useCourseContext();

    const [subtopics, setSubtopics] = useState<Subtopic[]>(courseData.materials);
    const [materialsSaved, setMaterialsSaved] = useState<boolean>(false);
    const [pendingUploadFiles, setPendingUploadFiles] = useState<Record<string, File[]>>({});
    const [subtopicErrorMessages, setSubtopicErrorMessages] = useState<Record<string, string>>({});
    const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
    const [showUploadSections, setShowUploadSections] = useState<string | null>(null);
    const [hasUploadedDocuments, setHasUploadedDocuments] = useState<string | null>(null);
    const [showSavedMaterialsSection, setShowSavedMaterialsSection] = useState<boolean>(false);


    useEffect(() => {
        const updatedQuizData = sessionStorage.getItem('updatedQuizData');
        if (updatedQuizData) {
            try {
                const { subtopicId, quizBankData } = JSON.parse(updatedQuizData);

                setSubtopics(prevSubtopics => {
                    return prevSubtopics.map(subtopic => {
                        if (subtopic.id === subtopicId) {
                            const quizMaterial: MaterialFile = {
                                id: Math.random().toString(36).substr(2, 9),
                                name: quizBankData.quizDetails.title || 'Unnamed Quiz',
                                type: 'quiz',
                                file: null,
                                quizId: Math.random().toString(36).substr(2, 9)
                            };

                            const existingQuizIndex = subtopic.materials.findIndex(m => m.type === 'quiz');
                            const updatedMaterials = [...subtopic.materials];

                            if (existingQuizIndex >= 0) {
                                updatedMaterials[existingQuizIndex] = {
                                    ...updatedMaterials[existingQuizIndex],
                                    name: quizBankData.quizDetails.title || 'Unnamed Quiz'
                                };
                            } else {
                                updatedMaterials.push(quizMaterial);
                            }

                            return {
                                ...subtopic,
                                hasQuiz: true,
                                quizBank: quizBankData,
                                materials: updatedMaterials
                            };
                        }
                        return subtopic;
                    });
                });
                sessionStorage.removeItem('updatedQuizData');
            } catch (error) {
                console.error('Error parsing updated quiz data:', error);
            }
        }
    }, []);

    const toggleSubtopic = (subtopicId: string) => {
        setExpandedSubtopics(prev => ({
            ...prev,
            [subtopicId]: !prev[subtopicId],
        }));
    };

    const handleCreateQuizClickForSubtopic = (subtopicId: string) => {
        navigate('/coordinator/quiz-creator', {
            state: {
                subtopicId,
                fromUploadMaterials: true
            }
        });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'document' | 'video', subtopicIndex: number, subtopicId: string) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        let validFiles: File[] = [];
        let invalidFiles: File[] = [];

        droppedFiles.forEach(file => {
            const isValidFileType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
            if (isValidFileType) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file);
                setSubtopicErrorMessages(prevErrors => ({
                    ...prevErrors,
                    [subtopicId]: `Invalid file type: "${file.name}". Only PDF and Word documents are allowed.`,
                }));
            }
        });

        if (validFiles.length > 0) {
            setPendingUploadFiles(prev => ({
                ...prev,
                [subtopicId]: [...(prev[subtopicId] || []), ...validFiles]
            }));
            setSubtopicErrorMessages(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[subtopicId];
                return updatedErrors;
            });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'video', subtopicIndex: number, subtopicId: string) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setPendingUploadFiles(prev => ({
                ...prev,
                [subtopicId]: [...(prev[subtopicId] || []), ...files]
            }));
            e.target.value = '';
        }
    };

    const addSubtopicFiles = (files: File[], type: 'document' | 'video', subtopicIndex: number, subtopicId: string) => {
        let isValidUpload = true;
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            const currentMaterials = updatedSubtopics[subtopicIndex].materials;
            const validFiles = files.filter(file => {
                const isValidFileType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
                if (!isValidFileType) {
                    setSubtopicErrorMessages(prevErrors => ({
                        ...prevErrors,
                        [subtopicId]: `Invalid file type: "${file.name}". Only PDF and Word documents are allowed for ${subtopics[subtopicIndex].title}.`,
                    }));
                    isValidUpload = false;
                    return false;
                }
                return true;
            });

            if (!isValidUpload) {
                return prevSubtopics;
            }

            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                materials: [...currentMaterials, ...validFiles.map(file => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type,
                    file,
                }))]
            };
            return updatedSubtopics;
        });
        if (isValidUpload) {
            setMaterialsSaved(false);
            setHasUploadedDocuments(subtopics[subtopicIndex].id);
            setSubtopicErrorMessages(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[subtopicId];
                return updatedErrors;
            });
        } else {
            setMaterialsSaved(false);
        }
    };

    const removeMaterial = (id: string, subtopicIndex: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                materials: updatedSubtopics[subtopicIndex].materials.filter(material => material.id !== id)
            };
            return updatedSubtopics;
        });
        setMaterialsSaved(false);
        if (subtopics[subtopicIndex].materials.filter(material => material.id !== id).length === 0) {
            setHasUploadedDocuments(null);
        }
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

    const handleEditQuiz = (subtopicId: string, subtopicIndex: number) => {
        const subtopic = subtopics.find(s => s.id === subtopicId);
        if (subtopic && subtopic.quizBank) {
            navigate('/coordinator/quiz-creator', {
                state: {
                    subtopicId,
                    quizDetails: subtopic.quizBank,
                    fromUploadMaterials: true
                }
            });
        }
    };

    const handleUploadDocumentClick = (subtopicId: string) => {
        if (showUploadSections === subtopicId) {
            setShowUploadSections(null);
        } else {
            setShowUploadSections(subtopicId);
        }
        setShowSavedMaterialsSection(false);
    };

    const handleAddVideoClick = (subtopicId: string) => {
        navigate('/upload-video');
    };

    const handleSubtopicPointsChange = (e: React.ChangeEvent<HTMLInputElement>, subtopicIndex: number) => {
        const value = parseInt(e.target.value, 10);
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                subtopicPoints: isNaN(value) ? 1 : Math.max(1, Math.min(100, value))
            };
            return updatedSubtopics;
        });
    };

    const handleSubtopicTitleChange = (e: React.ChangeEvent<HTMLInputElement>, subtopicIndex: number) => {
        setSubtopics(prevSubtopics => {
            const updatedSubtopics = [...prevSubtopics];
            updatedSubtopics[subtopicIndex] = {
                ...updatedSubtopics[subtopicIndex],
                title: e.target.value
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

    const handleSaveMaterials = () => {
        updateCourseMaterials(subtopics);
        setMaterialsSaved(true);
        setShowSavedMaterialsSection(true);
        setShowUploadSections(null);
    };

    const handleNext = () => {
        if (!materialsSaved) {
            handleSaveMaterials();
        }
        navigate('/coordinator/publish-Course');
    };

    const handleSaveDraft = () => {
        alert("Course saved as draft!");
    };

    const handleUploadPendingFiles = (subtopicId: string, subtopicIndex: number) => {
        const filesToUpload = pendingUploadFiles[subtopicId] || [];
        if (filesToUpload.length > 0) {
            addSubtopicFiles(filesToUpload, 'document', subtopicIndex, subtopicId);
            setPendingUploadFiles(prev => {
                const updatedPendingFiles = { ...prev };
                delete updatedPendingFiles[subtopicId];
                return updatedPendingFiles;
            });
            setShowUploadSections(null);
        } else {
            alert("No documents selected for upload.");
        }
    };

    const handleRemovePendingFile = (fileName: string, subtopicId: string) => {
        setPendingUploadFiles(prev => {
            const currentPendingFiles = prev[subtopicId] || [];
            const updatedPendingFilesArray = currentPendingFiles.filter(file => file.name !== fileName);
            return {
                ...prev,
                [subtopicId]: updatedPendingFilesArray
            };
        });
    };

    return (
        <div className="min-h-screen bg-[#52007C] p-6">
            <Header onSaveDraft={handleSaveDraft} navigateToCreateCourse={() => navigate('/coordinator/course-details')} />

            <ProgressBar stage={2} />

            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300 mb-6">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h2 className="text-lg font-['Unbounded'] text-white">Course Materials</h2>
                        <button
                            onClick={addNewSubtopic}
                            className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm">
                            Add New Subtopic
                        </button>
                    </div>

                    <div className="px-6 py-4 space-y-4 border-t border-[#BF4BF6]/20">
                        {subtopics.map((subtopic, subtopicIndex) => (
                            <SubtopicItem
                                key={subtopic.id}
                                subtopic={subtopic}
                                subtopicIndex={subtopicIndex}
                                expanded={expandedSubtopics[subtopic.id]}
                                pendingFiles={pendingUploadFiles[subtopic.id] || []}
                                errorMessage={subtopicErrorMessages[subtopic.id]}
                                showUploadSection={showUploadSections === subtopic.id}
                                toggleSubtopic={() => toggleSubtopic(subtopic.id)}
                                handleRemoveSubtopic={() => handleRemoveSubtopic(subtopic.id)}
                                handleSubtopicTitleChange={(e) => handleSubtopicTitleChange(e, subtopicIndex)}
                                handleSubtopicPointsChange={(e) => handleSubtopicPointsChange(e, subtopicIndex)}
                                removeMaterial={(materialId) => removeMaterial(materialId, subtopicIndex)}
                                handleCreateQuizClick={() => handleCreateQuizClickForSubtopic(subtopic.id)}
                                handleEditQuiz={() => handleEditQuiz(subtopic.id, subtopicIndex)}
                                handleRemoveQuiz={() => handleRemoveQuiz(subtopicIndex)}
                                handleUploadDocumentClick={() => handleUploadDocumentClick(subtopic.id)}
                                handleAddVideoClick={() => handleAddVideoClick(subtopic.id)}
                                handleDrop={(e, type) => handleDrop(e, type, subtopicIndex, subtopic.id)}
                                handleFileSelect={(e, type) => handleFileSelect(e, type, subtopicIndex, subtopic.id)}
                                handleUploadPendingFiles={() => handleUploadPendingFiles(subtopic.id, subtopicIndex)}
                                handleRemovePendingFile={(fileName) => handleRemovePendingFile(fileName, subtopic.id)}
                                setIsDraggingDocs={() => {}} // Dummy function as state is managed in parent for now - can be moved to SubtopicItem 
                                isDraggingDocs={false} // Dummy value - state is managed in parent for now - can be moved to SubtopicItem 
                            />
                        ))}
                    </div>
                </div>


                <BottomNavigation
                    onBack={() => navigate('/coordinator/course-details')}
                    onNext={handleNext}
                    onSaveMaterials={handleSaveMaterials}
                    materialsSaved={materialsSaved}
                />
            </div>
        </div>
    );
};

export default UploadMaterials;