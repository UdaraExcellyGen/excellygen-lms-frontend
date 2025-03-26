import React from 'react';
import { ChevronDown, X, FileText, Play, BookCheck, Plus, Upload, Edit } from 'lucide-react';
import { MaterialFile, Subtopic } from '../types/index'; /

interface SubtopicItemProps {
    subtopic: Subtopic;
    subtopicIndex: number;
    expanded: boolean;
    pendingFiles: File[];
    errorMessage: string | undefined;
    showUploadSection: boolean;
    toggleSubtopic: () => void;
    handleRemoveSubtopic: () => void;
    handleSubtopicTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubtopicPointsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeMaterial: (materialId: string) => void;
    handleCreateQuizClick: () => void;
    handleEditQuiz: () => void;
    handleRemoveQuiz: () => void;
    handleUploadDocumentClick: () => void;
    handleAddVideoClick: () => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, type: 'document' | 'video') => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'video') => void;
    handleUploadPendingFiles: () => void;
    handleRemovePendingFile: (fileName: string) => void;
    setIsDraggingDocs: React.Dispatch<React.SetStateAction<boolean>>;
    isDraggingDocs: boolean;
}


const SubtopicItem: React.FC<SubtopicItemProps> = ({
    subtopic,
    subtopicIndex,
    expanded,
    pendingFiles,
    errorMessage,
    showUploadSection,
    toggleSubtopic,
    handleRemoveSubtopic,
    handleSubtopicTitleChange,
    handleSubtopicPointsChange,
    removeMaterial,
    handleCreateQuizClick,
    handleEditQuiz,
    handleRemoveQuiz,
    handleUploadDocumentClick,
    handleAddVideoClick,
    handleDrop,
    handleFileSelect,
    handleUploadPendingFiles,
    handleRemovePendingFile,
    setIsDraggingDocs,
    isDraggingDocs,
}) => {
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
                            onChange={handleSubtopicTitleChange}
                        />
                        <ChevronDown
                            className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        onClick={handleRemoveSubtopic}
                        className="p-1 rounded-full hover:bg-gray-700 transition-colors h-6 w-6 flex items-center justify-center"
                    >
                        <X size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

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
                        onChange={handleSubtopicPointsChange}
                    />
                </div>
            </div>

            {expanded && (
                <div className="mt-2 space-y-2 pl-4">
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
                                            onClick={() => removeMaterial(material.id)}
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
                                onClick={handleCreateQuizClick}
                                className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                Create Quiz
                            </button>
                        )}

                        {subtopic.hasQuiz && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEditQuiz}
                                    className="px-4 py-2 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-sm">
                                    <Edit size={16} className="inline mr-1" /> Edit Quiz
                                </button>
                                <button
                                    onClick={handleRemoveQuiz}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-['Nunito_Sans'] hover:bg-red-200 transition-colors text-sm">
                                    <X size={16} className="inline mr-1" /> Remove Quiz
                                </button>
                            </div>
                        )}
                    </div>

                    {showUploadSection && (
                        <div className="mt-4 bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-4">
                            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Upload Documents</p>

                            {pendingFiles && pendingFiles.length > 0 && (
                                <div className="mb-4 bg-[#1B0A3F]/30 rounded-lg p-3">
                                    <p className="text-[15px] text-gray-300 font-['Nunito_Sans']">Selected Files:</p>
                                    <ul className="list-none pl-0 text-gray-300 space-y-2">
                                        {pendingFiles.map(file => (
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
                                    onClick={handleUploadDocumentClick}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg font-['Nunito_Sans'] hover:bg-gray-600 transition-colors text-sm">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadPendingFiles}
                                    className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm">
                                    Upload
                                </button>
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 text-sm mt-2 font-['Nunito_Sans']">{errorMessage}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicItem;