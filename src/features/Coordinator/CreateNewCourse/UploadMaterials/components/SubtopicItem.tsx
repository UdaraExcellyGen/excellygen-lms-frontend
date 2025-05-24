// features/Coordinator/CreateNewCourse/UploadMaterials/components/SubtopicItem.tsx
import React from 'react';
import { ChevronDown, X, FileText, Plus, Upload, Edit, Save, XCircle } from 'lucide-react';
import { SubtopicFE, ExistingMaterialFile } from '../../../../../types/course.types'; // Adjust path if needed

interface SubtopicItemProps {
    subtopic: SubtopicFE;
    expanded: boolean;
    pendingFiles: File[]; // Browser File objects
    errorMessage: string | undefined;
    showUploadSection: boolean;
    isSubmitting: boolean;
    toggleSubtopic: () => void;
    handleRemoveSubtopic: () => void;
    handleSubtopicInputChange: (field: 'lessonName' | 'lessonPoints', value: string) => void;
    handleToggleEdit: () => void;
    handleSaveChanges: () => void;
    handleCancelEdit: () => void;
    removeMaterial: (documentId: number, documentName: string) => void;
    handleUploadDocumentClick: () => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUploadPendingFiles: () => void;
    handleRemovePendingFile: (fileName: string) => void;
    setIsDraggingDocs: (isDragging: boolean) => void;
    isDraggingDocs: boolean;
    // Placeholder functions now correctly defined as expecting no arguments from SubtopicItem's direct call
    handleAddVideoClick: () => void;
    handleCreateQuizClick: () => void;
    handleEditQuiz: () => void;
    handleRemoveQuiz: () => void;
}

const SubtopicItem: React.FC<SubtopicItemProps> = ({
    subtopic,
    expanded,
    pendingFiles,
    errorMessage,
    showUploadSection,
    isSubmitting,
    toggleSubtopic,
    handleRemoveSubtopic,
    handleSubtopicInputChange,
    handleToggleEdit,
    handleSaveChanges,
    handleCancelEdit,
    removeMaterial,
    handleUploadDocumentClick,
    handleAddVideoClick,
    handleDrop,
    handleFileSelect,
    handleUploadPendingFiles,
    handleRemovePendingFile,
    setIsDraggingDocs,
    isDraggingDocs,
    handleCreateQuizClick,
    handleEditQuiz,
    handleRemoveQuiz,
}) => {

    const renderMaterialIcon = (material: ExistingMaterialFile) => {
        switch (material.documentType) {
            case 'PDF': return <FileText size={16} className="text-red-400 mr-2 flex-shrink-0" />;
            case 'Word': return <FileText size={16} className="text-blue-400 mr-2 flex-shrink-0" />;
            default: return <FileText size={16} className="text-gray-400 mr-2 flex-shrink-0" />;
        }
    };

    const handlePointsInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*$/.test(value)) {
            handleSubtopicInputChange('lessonPoints', value);
        }
    };

    const handlePointsInputBlurEvent = (e: React.FocusEvent<HTMLInputElement>) => {
        let points = parseInt(e.target.value, 10);
        const originalPoints = subtopic.originalPoints ?? 1;

        if (isNaN(points) || e.target.value.trim() === '') {
            points = originalPoints;
        } else if (points < 1) {
            points = 1;
        } else if (points > 100) {
            points = 100;
        }
        handleSubtopicInputChange('lessonPoints', points.toString());
    };


    return (
        <div className="mb-4 bg-[#1B0A3F]/60 rounded-lg p-4 transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center gap-2">
                <div className="flex-grow flex items-center gap-2 min-w-0">
                    <button
                        onClick={toggleSubtopic}
                        aria-expanded={expanded}
                        className="p-1 text-white hover:text-[#D68BF9] transition-colors flex-shrink-0"
                        aria-label={expanded ? `Collapse ${subtopic.lessonName || 'subtopic'}` : `Expand ${subtopic.lessonName || 'subtopic'}`}
                    >
                        <ChevronDown
                            className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {subtopic.isEditing ? (
                        <input
                            type="text"
                            value={subtopic.lessonName}
                            onChange={(e) => handleSubtopicInputChange('lessonName', e.target.value)}
                            className="flex-grow p-1 bg-[#2D1B59] border border-purple-400 rounded outline-none font-['Unbounded'] text-white text-sm min-w-0"
                            disabled={isSubmitting}
                            placeholder="Subtopic Name"
                        />
                    ) : (
                        <span
                            className="font-['Unbounded'] text-white cursor-pointer hover:text-[#D68BF9] text-sm flex-grow truncate"
                            onClick={toggleSubtopic}
                            title={subtopic.lessonName}
                        >
                            {subtopic.lessonName || "Unnamed Subtopic"}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {subtopic.isEditing ? (
                        <>
                            <label htmlFor={`points-${subtopic.id}`} className="text-xs text-gray-300 whitespace-nowrap">Pts:</label>
                            <input
                                type="number"
                                id={`points-${subtopic.id}`}
                                min="1"
                                max="100"
                                value={subtopic.lessonPoints === 0 && subtopic.isEditing ? '' : subtopic.lessonPoints}
                                onChange={handlePointsInputChangeEvent}
                                onBlur={handlePointsInputBlurEvent}
                                className="w-20 text-sm p-1 bg-[#2D1B59] text-white rounded border border-purple-400 text-center"
                                disabled={isSubmitting}
                            />
                            <button onClick={handleSaveChanges} disabled={isSubmitting} className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50" aria-label="Save changes"><Save size={18} /></button>
                            <button onClick={handleCancelEdit} disabled={isSubmitting} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50" aria-label="Cancel edit"><XCircle size={18} /></button>
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-['Nunito_Sans'] text-gray-300 bg-[#2D1B59] px-2 py-0.5 rounded whitespace-nowrap">
                                {subtopic.lessonPoints} pts
                            </span>
                            <button onClick={handleToggleEdit} disabled={isSubmitting} className="p-1 text-gray-400 hover:text-white" aria-label={`Edit ${subtopic.lessonName || 'subtopic'}`}><Edit size={16} /></button>
                            <button onClick={handleRemoveSubtopic} disabled={isSubmitting} className="p-1 text-gray-400 hover:text-red-500" aria-label={`Delete ${subtopic.lessonName || 'subtopic'}`}><X size={16} /></button>
                        </>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-[#BF4BF6]/30 ml-2">
                    {subtopic.documents && subtopic.documents.length > 0 && (
                        <div>
                            <p className="text-sm text-[#D68BF9] mb-2 font-['Nunito_Sans'] font-semibold">Uploaded Documents:</p>
                            <ul className="space-y-2">
                                {subtopic.documents.map((material) => (
                                    <li key={material.id} className="bg-[#1B0A3F]/40 rounded-lg p-3 flex items-center justify-between hover:bg-[#1B0A3F]/70">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {renderMaterialIcon(material)}
                                            <a
                                                href={material.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white font-['Nunito_Sans'] truncate hover:underline"
                                                title={material.name}
                                            >
                                                {material.name}
                                            </a>
                                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({(material.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeMaterial(material.id, material.name)}
                                            disabled={isSubmitting}
                                            className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors h-6 w-6 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                                            aria-label={`Delete document ${material.name}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {subtopic.documents && subtopic.documents.length === 0 && !showUploadSection && (
                         <p className="text-xs text-gray-400 font-['Nunito_Sans'] italic">No documents uploaded for this subtopic yet.</p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                        <button
                            onClick={handleUploadDocumentClick}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-[#F6E6FF] text-[#1B0A3F] rounded-lg font-['Nunito_Sans'] hover:bg-[#E0D0F2] transition-colors text-xs disabled:opacity-50">
                            <Plus size={14} className="inline mr-1" /> {showUploadSection ? 'Hide Upload' : 'Add Document'}
                        </button>
                        <button onClick={handleAddVideoClick} disabled={false} className="px-3 py-1.5 bg-gray-600 text-gray-400 rounded-lg font-['Nunito_Sans'] text-xs cursor-not-allowed"><Plus size={14} className="inline mr-1" /> Add Video </button>
                        <button onClick={handleCreateQuizClick} disabled={false} className="px-3 py-1.5 bg-gray-600 text-gray-400 rounded-lg font-['Nunito_Sans'] text-xs cursor-not-allowed"><Plus size={14} className="inline mr-1" /> Create Quiz </button>
                        {/* Example: Show Edit/Remove Quiz if subtopic.hasQuiz is true */}
                        {/* {subtopic.hasQuiz && (
                            <>
                                <button onClick={handleEditQuiz} disabled={isSubmitting || true} className="px-3 py-1.5 bg-gray-600 text-gray-400 ...">Edit Quiz (N/A)</button>
                                <button onClick={handleRemoveQuiz} disabled={isSubmitting || true} className="px-3 py-1.5 bg-red-700/50 text-red-300 ...">Remove Quiz (N/A)</button>
                            </>
                        )} */}
                    </div>

                    {showUploadSection && (
                        <div className="mt-4 bg-[#1B0A3F]/50 backdrop-blur-sm rounded-xl border border-[#BF4BF6]/30 shadow-inner p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-white font-['Nunito_Sans'] font-semibold">Upload New Documents</p>
                                <button onClick={handleUploadDocumentClick} className="p-1 text-gray-400 hover:text-white" aria-label="Close upload section"><XCircle size={16} /></button>
                            </div>
                            {pendingFiles && pendingFiles.length > 0 && (
                                <div className="mb-4 bg-[#1B0A3F]/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    <p className="text-xs text-gray-300 font-['Nunito_Sans'] mb-1">Files ready for upload:</p>
                                    <ul className="list-none pl-0 text-gray-300 space-y-1">
                                        {pendingFiles.map(file => (
                                            <li key={`${file.name}-${file.lastModified}`} className="text-xs font-['Nunito_Sans'] flex items-center justify-between bg-[#2D1B59]/80 p-1.5 rounded-md">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span className="truncate" title={file.name}>{file.name}</span>
                                                    <span className="text-gray-500 ml-1 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePendingFile(file.name)}
                                                    disabled={isSubmitting}
                                                    className="p-0.5 rounded-full text-gray-400 hover:text-red-500 transition-colors h-5 w-5 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                                                    aria-label={`Remove ${file.name} from upload list`}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div
                                className={`border-2 border-dashed ${isDraggingDocs ? 'border-[#BF4BF6] bg-[#F6E6FF]/10' : 'border-gray-600/50'} rounded-lg p-6 text-center transition-colors`}
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingDocs(true); }}
                                onDragEnter={() => setIsDraggingDocs(true)}
                                onDragLeave={() => setIsDraggingDocs(false)}
                                onDrop={handleDrop}
                            >
                                <Upload size={28} className="text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-300 font-['Nunito_Sans']">Drag & drop files here or</p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id={`document-upload-${subtopic.id}`}
                                    disabled={isSubmitting}
                                />
                                <label
                                    htmlFor={`document-upload-${subtopic.id}`}
                                    className="mt-1 inline-block cursor-pointer text-sm text-[#BF4BF6] hover:text-[#D68BF9] transition-colors font-['Nunito_Sans'] underline"
                                >
                                    Click to upload
                                </label>
                                <p className="text-xs text-gray-500 font-['Nunito_Sans'] mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                            {errorMessage && (<p className="text-red-400 text-sm mt-2 font-['Nunito_Sans'] whitespace-pre-line">{errorMessage}</p>)}
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handleUploadPendingFiles}
                                    disabled={isSubmitting || !pendingFiles || pendingFiles.length === 0}
                                    className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Uploading...' : `Upload ${pendingFiles?.length || 0} File(s)`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicItem;