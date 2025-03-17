
import React from 'react';
import { FileText, X } from 'lucide-react';

interface PendingFileListProps {
    pendingFiles: File[];
    handleRemovePendingFile: (fileName: string) => void;
}

const PendingFileList: React.FC<PendingFileListProps> = ({ pendingFiles, handleRemovePendingFile }) => {
    return (
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
    );
};

export default PendingFileList;