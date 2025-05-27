// components/MaterialList.tsx
import React from 'react';
import { CourseDocumentDto } from '../../../../../types/course.types';
import { FileText, X } from 'lucide-react';

interface MaterialListProps {
    materials?: CourseDocumentDto[];
    askDeleteConfirmation: (documentId: number, documentName: string) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, askDeleteConfirmation }) => {
    // Map DocumentType enum from backend string to icon
    const getIconForDocumentType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return <FileText className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />;
            case 'word': return <FileText className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />;
            default: return <FileText className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />;
        }
    };

    return (
        <ul className="space-y-3">
            {materials?.map((material) => (
                <li
                    key={material.id}
                    className="flex items-center justify-between bg-[#1B0A3F]/70 rounded-md p-3 shadow-sm hover:bg-[#1B0A3F]/90 transition-colors duration-200"
                >
                    <div className="flex items-center min-w-0 flex-grow">
                        {getIconForDocumentType(material.documentType)}
                        <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-sm font-medium truncate hover:underline transition-colors"
                            title={material.name}
                        >
                            {material.name}
                        </a>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            ({(material.fileSize / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                    </div>
                    <button
                        onClick={() => askDeleteConfirmation(material.id, material.name)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors duration-200 ml-2 flex-shrink-0"
                        aria-label={`Delete material ${material.name}`}
                    >
                        <X size={16} />
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default MaterialList;