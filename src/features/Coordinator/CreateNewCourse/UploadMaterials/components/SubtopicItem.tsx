// components/SubtopicItem.tsx
import React, { useState } from 'react';
import { ChevronDown, X, FileText, Play, BookCheck, Upload, Plus, Edit } from 'lucide-react';
import QuizCreator, { QuizBank } from '../../../CreateNewCourse/QuizCreator/QuizCreator';
import { MaterialFile, Subtopic as SubtopicType } from '../types/types';

interface SubtopicItemProps {
    subtopic: SubtopicType;
    subtopicIndex: number;
    onRemoveSubtopic: (subtopicId: string) => void;
    onSubtopicTitleChange: (title: string) => void;
    onSubtopicPointsChange: (points: number) => void;
    onRemoveMaterial: (materialId: string, subtopicIndex: number) => void;
    onAddMaterial: (newMaterial: MaterialFile, subtopicIndex: number) => void;
    onSaveQuizForSubtopic: (subtopicId: string, quizBankData: QuizBank) => void;
    onSaveOverviewQuizDetails: (subtopicId: string, updatedQuizBank: QuizBank) => void;
    onRemoveQuiz: (subtopicIndex: number) => void;
    onSetQuizBank: (subtopicIndex: number, quizBank: QuizBank) => void;
}


const SubtopicItem: React.FC<SubtopicItemProps> = ({
    subtopic,
    subtopicIndex,
    onRemoveSubtopic,
    onSubtopicTitleChange,
    onSubtopicPointsChange,
    onRemoveMaterial,
    onAddMaterial,
    onSaveQuizForSubtopic,
    onSaveOverviewQuizDetails,
    onRemoveQuiz,
    onSetQuizBank
}) => {
    const [expanded, setExpanded] = useState(false);
    const [showUploadSections, setShowUploadSections] = useState<string | null>(null);
    const [showQuizCreator, setShowQuizCreator] = useState<string | null>(null);
    const [showQuizOverview, setShowQuizOverview] = useState<string | null>(null);
    const [hidePointSection, setHidePointSection] = useState(false);
    const [isDraggingDocs, setIsDraggingDocs] = useState(false);
    const [pendingUploadFiles, setPendingUploadFiles] = useState<Record<string, File[]>>({});
    const [subtopicErrorMessages, setSubtopicErrorMessages] = useState<Record<string, string>>({});


    const toggleSubtopic = () => {
        setExpanded(!expanded);
    };

    const handleCreateQuizClickForSubtopic = () => {
        setShowQuizCreator(subtopic.id);
        setShowUploadSections(null);
        setHidePointSection(true);
    };

    const handleCancelQuizCreator = () => {
        setShowQuizCreator(null);
        setHidePointSection(false);
    };


    const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'document' | 'video') => {
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
                    [subtopic.id]: `Invalid file type: "${file.name}". Only PDF and Word documents are allowed.`,
                }));
            }
        });


        if (validFiles.length > 0) {
            setPendingUploadFiles(prev => ({
                ...prev,
                [subtopic.id]: [...(prev[subtopic.id] || []), ...validFiles]
            }));
            setSubtopicErrorMessages(prevErrors => {
                const updatedErrors = {...prevErrors};
                delete updatedErrors[subtopic.id];
                return updatedErrors;
            });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'video') => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setPendingUploadFiles(prev => ({
                ...prev,
                [subtopic.id]: [...(prev[subtopic.id] || []), ...files]
            }));
            e.target.value = '';
        }
    };

    const addSubtopicFiles = (files: File[], type: 'document' | 'video') => {
        let isValidUpload = true;
        const validFiles = files.filter(file => {
            const isValidFileType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
            if (!isValidFileType) {
                setSubtopicErrorMessages(prevErrors => ({
                    ...prevErrors,
                    [subtopic.id]: `Invalid file type: "${file.name}". Only PDF and Word documents are allowed for ${subtopic.title}.`,
                }));
                isValidUpload = false;
                return false;
            }
            return true;
        });

        if (!isValidUpload) {
            return;
        }

        validFiles.forEach(file => {
            onAddMaterial({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type,
                file,
            }, subtopicIndex);
        });


        if (isValidUpload) {
            setSubtopicErrorMessages(prevErrors => {
                const updatedErrors = {...prevErrors};
                delete updatedErrors[subtopic.id];
                return updatedErrors;
            });
        }
    };


    const handleEditQuiz = () => {
        setShowQuizOverview(subtopic.id);
        setShowQuizCreator(null);
        setShowUploadSections(null);
    };

    const handleCloseQuizOverview = () => {
        setShowQuizOverview(null);
    };


    const handleUploadDocumentClick = () => {
        if (showUploadSections === subtopic.id) {
            setShowUploadSections(null);
        } else {
            setShowUploadSections(subtopic.id);
            setShowQuizCreator(null);
        }

    };

    const handleAddVideoClick = () => {
        alert("Video upload/link feature is not fully implemented in this example.");
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        onSubtopicPointsChange(isNaN(value) ? 1 : Math.max(1, Math.min(100, value)));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSubtopicTitleChange(e.target.value);
    };


    const handleUploadPendingFiles = () => {
        const filesToUpload = pendingUploadFiles[subtopic.id] || [];
        if (filesToUpload.length > 0) {
            addSubtopicFiles(filesToUpload, 'document');
            setPendingUploadFiles(prev => {
                const updatedPendingFiles = {...prev};
                delete updatedPendingFiles[subtopic.id];
                return updatedPendingFiles;
            });
            setShowUploadSections(null);
        } else {
            alert("No documents selected for upload.");
        }
    };

    const handleRemovePendingFile = (fileName: string) => {
        setPendingUploadFiles(prev => {
            const currentPendingFiles = prev[subtopic.id] || [];
            const updatedPendingFilesArray = currentPendingFiles.filter(file => file.name !== fileName);
            return {
                ...prev,
                [subtopic.id]: updatedPendingFilesArray
            };
        });
    };


    return (
        <div className="mb-6">
            <div className="bg-[#1B0A3F]/60 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <button
                        onClick={toggleSubtopic}
                        className="flex items-center gap-2 text-white hover:text-[#D68BF9] transition-colors w-full text-left"
                    >
                        <input
                            type="text"
                            placeholder="New Sub Topic"
                            className="bg-transparent border-none outline-none font-['Unbounded'] text-white w-full"
                            value={subtopic.title}
                            onChange={handleTitleChange}
                        />
                        <ChevronDown
                            className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        onClick={() => onRemoveSubtopic(subtopic.id)}
                        className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center"
                    >
                        <X size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                {!hidePointSection && (
                    <div className="flex items-center gap-4 justify-end mt-2">
                        <label htmlFor={`subtopicPoints-${subtopic.id}`} className="text-sm font-['Nunito_Sans'] text-white">
                            Points:
                        </label>
                        <input
                            type="number"
                            id={`subtopicPoints-${subtopic.id}`}
                            min="1"
                            max="100"
                            className="w-16 text-sm p-1 bg-[#2D1B59] text-white rounded border border-gray-600"
                            value={subtopic.subtopicPoints}
                            onChange={handlePointsChange}
                        />
                    </div>
                )}
            </div>

            {expanded && (
                <div className="mt-2 space-y-2 pl-4">

                    {showQuizOverview === subtopic.id && subtopic.quizBank && (
                        <QuizCreator
                            subtopicId={subtopic.id}
                            onSaveQuiz={(subtopicId, quizBankData) => onSaveQuizForSubtopic(subtopicId, quizBankData)}
                            onCancelQuizCreator={handleCancelQuizCreator}
                            editableQuizBankForOverview={subtopic.quizBank}
                            onCloseQuizOverview={handleCloseQuizOverview}
                            onSaveOverviewQuizDetails={(subtopicId, updatedQuizBank) => onSaveOverviewQuizDetails(subtopicId, updatedQuizBank)}
                        />
                    )}


                    {showQuizCreator === subtopic.id && (
                        <QuizCreator
                            subtopicId={subtopic.id}
                            onSaveQuiz={(subtopicId, quizBankData) => onSaveQuizForSubtopic(subtopicId, quizBankData)}
                            onCancelQuizCreator={handleCancelQuizCreator}
                            onCloseQuizOverview={handleCloseQuizOverview}
                            onSaveOverviewQuizDetails={(subtopicId, updatedQuizBank) => onSaveOverviewQuizDetails(subtopicId, updatedQuizBank)}
                        />
                    )}

                    {subtopic.materials.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Uploaded Materials:</p>
                            <ul className="space-y-2">
                                {subtopic.materials.map((material) => (
                                    <li key={material.id} className="bg-[#1B0A3F]/30 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {material.type === 'document' ? <FileText size={16} color="white" /> : material.type === 'video' ? <Play size={16} color="white" /> : <BookCheck size={16} color="white" />}
                                            <span className="text-sm text-white font-['Nunito_Sans']">{material.name}</span>
                                        </div>
                                        <button
                                            onClick={() => onRemoveMaterial(material.id, subtopicIndex)}
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
                            onClick={handleUploadDocumentClick}
                            className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                            <Plus size={16} className="inline mr-1" /> Add Document
                        </button>

                        <button
                            onClick={handleAddVideoClick}
                            className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                            <Plus size={16} className="inline mr-1" /> Add Video
                        </button>
                        {!subtopic.hasQuiz && (
                            <button
                                onClick={handleCreateQuizClickForSubtopic}
                                className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                Create Quiz
                            </button>
                        )}
                        {subtopic.hasQuiz && (
                            <button
                                onClick={handleEditQuiz}
                                className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                Edit Quiz
                            </button>
                        )}
                    </div>


                    {showUploadSections === subtopic.id && (
                        <div className="mt-4 bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-4">
                            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Upload Documents</p>

                            {pendingUploadFiles[subtopic.id] && pendingUploadFiles[subtopic.id].length > 0 && (
                                <div className="mb-4 bg-[#1B0A3F]/30 rounded-lg p-3">
                                    <p className="text-[15px] text-gray-300 font-['Nunito_Sans']">Selected Files:</p>
                                    <ul className="list-none pl-0 text-gray-300 space-y-2">
                                        {pendingUploadFiles[subtopic.id].map(file => (
                                            <li key={file.name} className="text-[15px] font-['Nunito_Sans'] flex items-center justify-between bg-[#2D1B59] p-2 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} color="white" />
                                                    <span>{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePendingFile(file.name)}
                                                    className="p-1 rounded-full hover:bg-gray-700 transition-colors h-8 w-8 flex items-center justify-center"
                                                >
                                                    <X size={15} color="white" className="group-hover:text-red-500" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}


                            <div
                                className={`border-2 border-dashed ${isDraggingDocs ? 'border-[#BF4BF6] bg-[#F6E6FF]/10' : 'border-gray-600'}
                                rounded-lg p-8 text-center transition-colors`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDraggingDocs(true);
                                }}
                                onDragLeave={() => setIsDraggingDocs(false)}
                                onDrop={(e) => handleDrop(e, 'document')}
                            >
                                <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-300 font-['Nunito_Sans']">Drag or Click to upload your Documents</p>
                                <p className="text-xs text-gray-400 font-['Nunito_Sans']">PDF, Word Documents max size (5 MB)</p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileSelect(e, 'document')}
                                    className="hidden"
                                    id={`document-upload-${subtopicIndex}`}
                                />
                                <label
                                    htmlFor={`document-upload-${subtopicIndex}`}
                                    className="mt-4 inline-block cursor-pointer text-sm text-[#BF4BF6] hover:text-[#D68BF9] transition-colors font-['Nunito_Sans']"
                                >
                                    Click to upload
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowUploadSections(null)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg font-['Nunito_Sans'] hover:bg-gray-600 transition-colors text-sm">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadPendingFiles}
                                    className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm">
                                    Upload
                                </button>
                            </div>

                            {subtopicErrorMessages[subtopic.id] && (
                                <p className="text-red-500 text-sm mt-2 font-['Nunito_Sans']">{subtopicErrorMessages[subtopic.id]}</p>
                            )}

                        </div>
                    )}


                </div>
            )}
        </div>
    );
};

export default SubtopicItem;