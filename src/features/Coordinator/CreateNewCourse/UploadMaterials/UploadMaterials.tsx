
import React, { useState } from 'react';
import { Upload, Play, FileText, BookCheck, Edit, X, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizCreator from './QuizCreator';
import { MaterialFile, Subtopic} from './types/course';
import { QuizBank } from './types/quiz';
import initialSubtopics from './data/initialSubtopics';
import CourseHeader from './components/CourseHeader';
import CourseProgressBar from './components/CourseProgressBar';
import PopupMessage from './components/PopupMessage'; 
import MaterialUploadSection from './components/MaterialUploadSection';
import QuizOverviewDisplay from './components/QuizOverviewDisplay';
import SubtopicItemHeader from './components/SubtopicItemHeader';

interface UploadMaterialsProps {}

const UploadMaterials: React.FC<UploadMaterialsProps> = () => {
const navigate = useNavigate();
const [subtopics, setSubtopics] = useState<Subtopic[]>(initialSubtopics);
const [isDraggingDocs, setIsDraggingDocs] = useState(false);
const [showUploadSections, setShowUploadSections] = useState<string | null>(null);
const [showQuizCreator, setShowQuizCreator] = useState<string | null>(null);
const [materialsSaved, setMaterialsSaved] = useState<boolean>(false);
const [showSavedMaterialsSection, setShowSavedMaterialsSection] = useState<boolean>(false);
const [hasUploadedDocuments, setHasUploadedDocuments] = useState<string | null>(null);
const [showQuizOverview, setShowQuizOverview] = useState<string | null>(null);
const [hidePointSection, setHidePointSection] = useState<boolean>(false);
const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
const [pendingUploadFiles, setPendingUploadFiles] = useState<Record<string, File[]>>({});
const [subtopicErrorMessages, setSubtopicErrorMessages] = useState<Record<string, string>>({});


const [showRemoveSubtopicPopup, setShowRemoveSubtopicPopup] = useState<string | null>(null);

const [showPopupMessage, setShowPopupMessage] = useState<boolean>(false);
const [popupMessageText, setPopupMessageText] = useState<string>("");

const toggleSubtopic = (subtopicId: string) => {
    setExpandedSubtopics(prev => ({
        ...prev,
        [subtopicId]: !prev[subtopicId],
    }));
};

const handleSaveQuizForSubtopic = (subtopicId: string, quizBankData: QuizBank) => {
    setSubtopics(prevSubtopics => {
        return prevSubtopics.map(subtopic => {
            if (subtopic.id === subtopicId) {
                return {
                    ...subtopic,
                    hasQuiz: true,
                    quizBank: quizBankData,
                };
            }
            return subtopic;
        });
    });
    setShowQuizCreator(null);
    alert("Quiz bank saved!");
};

const handleCreateQuizClickForSubtopic = (subtopicId: string) => {
    setShowQuizCreator(subtopicId);
    setShowUploadSections(null);
    setHidePointSection(true);
};

const handleCancelQuizCreator = () => {
    setShowQuizCreator(null);
    setHidePointSection(false);
};

const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'document' | 'video', subtopicIndex: number, subtopicId: string) => {
    e.preventDefault();
    setIsDraggingDocs(false);
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
        };
        return updatedSubtopics;
    });
};

const handleEditQuiz = (subtopicId: string, subtopicIndex: number) => {
    setShowQuizOverview(subtopicId);
    setShowQuizCreator(null);
    setShowUploadSections(null);
};

const handleCloseQuizOverview = () => {
    setShowQuizOverview(null);
};

const handleSaveOverviewQuizDetails = (subtopicId: string, updatedQuizBank: QuizBank) => {
    setSubtopics(prevSubtopics => {
        return prevSubtopics.map(subtopic => {
            if (subtopic.id === subtopicId) {
                return {
                    ...subtopic,
                    quizBank: updatedQuizBank,
                };
            }
            return subtopic;
        });
    });
    setShowQuizOverview(null);
};

const handleSaveMaterials = () => {
    setMaterialsSaved(true);
    setShowSavedMaterialsSection(true);
    setShowUploadSections(null);
    setShowQuizCreator(null);
};

const handleNext = () => {
    if (!materialsSaved) {
        handleSaveMaterials();
    }
    navigate('/coordinator/publish-course');
};

const handleUploadDocumentClick = (subtopicId: string) => {
    setShowUploadSections(subtopicId);
    setShowQuizCreator(null);
    setShowSavedMaterialsSection(false);
};

const handleAddVideoClick = (subtopicId: string) => {
    navigate('/course/123');
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


const handleRemoveSubtopic = (subtopicId: string) => {
    setShowRemoveSubtopicPopup(subtopicId); 
};


const confirmRemoveSubtopic = (subtopicIdToRemove: string) => {
    setSubtopics(prevSubtopics => {
        return prevSubtopics.filter(subtopic => subtopic.id !== subtopicIdToRemove); 
    });
    setShowRemoveSubtopicPopup(null); 
};


const handleClosePopupMessage = () => {
    setShowPopupMessage(false);
    setPopupMessageText("");
};


const cancelRemoveSubtopicPopup = () => {
    setShowRemoveSubtopicPopup(null); 
};


const addNewSubtopic = () => {
    const newId = (subtopics.length + 1).toString();
    setSubtopics(prevSubtopics => [...prevSubtopics, { id: newId, title: '', materials: [], hasQuiz: false, quizBank: null, subtopicPoints: 1 }]);
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
        setPopupMessageText("No documents selected for upload.");
        setShowPopupMessage(true);
        return; 
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
        <CourseHeader />
        <CourseProgressBar />

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
                        <div key={subtopic.id} className="mb-6">
                            <SubtopicItemHeader
                                subtopic={subtopic}
                                subtopicIndex={subtopicIndex}
                                expandedSubtopics={expandedSubtopics}
                                hidePointSection={hidePointSection}
                                toggleSubtopic={() => toggleSubtopic(subtopic.id)}
                                handleSubtopicTitleChange={handleSubtopicTitleChange}
                                handleSubtopicPointsChange={handleSubtopicPointsChange}
                                handleRemoveSubtopic={() => handleRemoveSubtopic(subtopic.id)} 
                            />

                            {expandedSubtopics[subtopic.id] && (
                                <div className="mt-2 space-y-2 pl-4">
                                    {subtopic.hasQuiz && subtopic.quizBank && showQuizOverview !== subtopic.id && (
                                        <QuizOverviewDisplay
                                            quizBank={subtopic.quizBank}
                                            onEditQuiz={() => handleEditQuiz(subtopic.id, subtopicIndex)}
                                            onRemoveQuiz={() => handleRemoveQuiz(subtopicIndex)}
                                        />
                                    )}

                                    {showQuizOverview === subtopic.id && subtopic.quizBank && (
                                        <QuizCreator
                                            subtopicId={subtopic.id}
                                            onSaveQuiz={handleSaveQuizForSubtopic}
                                            onCancelQuizCreator={handleCancelQuizCreator}
                                            editableQuizBankForOverview={subtopic.quizBank}
                                            onCloseQuizOverview={handleCloseQuizOverview}
                                            onSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                                        />
                                    )}

                                    {showQuizCreator === subtopic.id && (
                                        <QuizCreator
                                            subtopicId={subtopic.id}
                                            onSaveQuiz={handleSaveQuizForSubtopic}
                                            onCancelQuizCreator={handleCancelQuizCreator}
                                            onCloseQuizOverview={handleCloseQuizOverview}
                                            onSaveOverviewQuizDetails={handleSaveOverviewQuizDetails}
                                        />
                                    )}

                                    {subtopic.materials.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Uploaded Materials:</p>
                                            <ul className="space-y-2">
                                                {subtopic.materials.map((material) => (
                                                    <li key={material.id} className="bg-[#1B0A3F]/30 rounded-lg p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {material.type === 'document' ? <FileText size={16} color="white" /> : <Play size={16} color="white" />}
                                                            <span className="text-sm text-white font-['Nunito_Sans']">{material.name}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeMaterial(material.id, subtopicIndex)}
                                                            className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center"
                                                        >
                                                            <X size={14} color="white" className="group-hover:text-red-500" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleUploadDocumentClick(subtopic.id)}
                                            className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                            <Plus size={16} className="inline mr-1" /> Add Document
                                        </button>

                                        <button
                                            onClick={() => handleAddVideoClick(subtopic.id)}
                                            className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                            <Plus size={16} className="inline mr-1" /> Add Video
                                        </button>
                                        {!subtopic.hasQuiz && (
                                            <button
                                                onClick={() => handleCreateQuizClickForSubtopic(subtopic.id)}
                                                className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                                Create Quiz
                                            </button>
                                        )}
                                    </div>

                                    {showUploadSections === subtopic.id && (
                                        <MaterialUploadSection
                                            isDraggingDocs={isDraggingDocs}
                                            setIsDraggingDocs={setIsDraggingDocs}
                                            handleDrop={ (e) => handleDrop(e, 'document', subtopicIndex, subtopic.id)}
                                            handleFileSelect={(e) => handleFileSelect(e, 'document', subtopicIndex, subtopic.id)}
                                            pendingUploadFiles={pendingUploadFiles[subtopic.id] || []}
                                            handleRemovePendingFile={(fileName) => handleRemovePendingFile(fileName, subtopic.id)}
                                            subtopicErrorMessages={subtopicErrorMessages}
                                            subtopicId={subtopic.id}
                                            handleUploadPendingFiles={() => handleUploadPendingFiles(subtopic.id, subtopicIndex)}
                                            setShowUploadSections={() => setShowUploadSections(null)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between sticky bottom-0 bg-[#52007C] z-50 border-t border-[#BF4BF6]/20">
                <button
                    onClick={() => navigate('/coordinator/course-details')}
                    className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#34137C] rounded-lg transition-colors">
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold">
                    Save Materials & Next
                </button>
            </div>
        </div>

        
        <PopupMessage
            showPopup={showPopupMessage}
            popupMessage={popupMessageText}
            onClosePopup={handleClosePopupMessage}
            title="Warning" 
        />

        
        {showRemoveSubtopicPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-['Nunito_Sans']">
                <div className="bg-white p-6 rounded-lg shadow-xl text-black">
                    <h2 className="text-lg font-semibold mb-4">Confirm Removal</h2>
                    <p className="mb-4">Are you sure you want to remove this subtopic?</p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={cancelRemoveSubtopicPopup}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => confirmRemoveSubtopic(showRemoveSubtopicPopup)}
                            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                        >
                            Confirm Remove
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default UploadMaterials;