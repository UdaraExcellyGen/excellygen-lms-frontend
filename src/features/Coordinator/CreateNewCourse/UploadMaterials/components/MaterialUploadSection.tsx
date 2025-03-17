
import React from 'react';
import { Upload, FileText, X } from 'lucide-react';
import PendingFileList  from './PendingFileList'; 

interface MaterialUploadSectionProps {
    isDraggingDocs: boolean;
    setIsDraggingDocs: React.Dispatch<React.SetStateAction<boolean>>;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pendingUploadFiles: File[];
    handleRemovePendingFile: (fileName: string) => void;
    subtopicErrorMessages: Record<string, string>;
    subtopicId: string;
    handleUploadPendingFiles: () => void;
    setShowUploadSections: () => void;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({
    isDraggingDocs,
    setIsDraggingDocs,
    handleDrop,
    handleFileSelect,
    pendingUploadFiles,
    handleRemovePendingFile,
    subtopicErrorMessages,
    subtopicId,
    handleUploadPendingFiles,
    setShowUploadSections
}) => {
    return (
        <div className="mt-4 bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-4">
            <p className="text-sm text-white mb-2 font-['Nunito_Sans']">Upload Documents</p>

            {pendingUploadFiles && pendingUploadFiles.length > 0 && (
                <PendingFileList pendingFiles={pendingUploadFiles} handleRemovePendingFile={handleRemovePendingFile} />
            )}

            <div
                className={`border-2 border-dashed ${isDraggingDocs ? 'border-[#BF4BF6] bg-[#F6E6FF]/10' : 'border-gray-600'}
               rounded-lg p-8 text-center transition-colors`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDocs(true);
                }}
                onDragLeave={() => setIsDraggingDocs(false)}
                onDrop={handleDrop}
            >
                <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300 font-['Nunito_Sans']">Drag or Click to upload your Documents</p>
                <p className="text-xs text-gray-400 font-['Nunito_Sans']">PDF, Word Documents max size (5 MB)</p>
                <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`document-upload-${subtopicId}`}
                />
                <label
                    htmlFor={`document-upload-${subtopicId}`}
                    className="mt-4 inline-block cursor-pointer text-sm text-[#BF4BF6] hover:text-[#D68BF9] transition-colors font-['Nunito_Sans']"
                >
                    Click to upload
                </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={setShowUploadSections}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg font-['Nunito_Sans'] hover:bg-gray-600 transition-colors text-sm">
                    Cancel
                </button>
                <button
                    onClick={handleUploadPendingFiles}
                    className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors text-sm">
                    Upload
                </button>
            </div>

            {subtopicErrorMessages[subtopicId] && (
                <p className="text-red-500 text-sm mt-2 font-['Nunito_Sans']">{subtopicErrorMessages[subtopicId]}</p>
            )}
        </div>
    );
};

export default MaterialUploadSection;