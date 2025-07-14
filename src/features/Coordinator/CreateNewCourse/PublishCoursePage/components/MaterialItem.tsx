// features/Coordinator/CreateNewCourse/PublishCoursePage/components/MaterialItem.tsx
import React from 'react';
// Import refined types
import { ExistingMaterialFile, SubtopicFE } from '../../../../../types/course.types'; // Adjust path
import { FileText, X } from 'lucide-react';

interface MaterialItemProps {
    lessonId: number;
    material: ExistingMaterialFile;
    handleDeleteMaterial: (lessonId: number, documentId: number, documentName: string) => void;
}

const MaterialItem: React.FC<MaterialItemProps> = ({
    lessonId,
    material,
    handleDeleteMaterial,
    // handleViewQuiz,
    // subtopic
}) => {
    const renderMaterialIcon = () => {
        // For now, only documents. Expand for video/quiz later.
        switch (material.documentType) {
            case 'PDF':
                return <FileText className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />;
            case 'Word':
                return <FileText className="w-5 h-5 mr-3 text-black flex-shrink-0" />;
            default:
                return <FileText className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />;
        }
    };


    return (
        <div className="border border-[#52007C] rounded-lg p-3 flex items-center justify-between group hover:border border-[#52007C] transition-all duration-300">
            <div className="flex items-center gap-2 overflow-hidden">
                {renderMaterialIcon()}
                <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1B0A3F] group-hover:text-[#1B0A3F]/80 transition-colors font-nunito truncate"
                    title={material.name}
                >
                    {material.name}
                </a>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    ({(material.fileSize / (1024 * 1024)).toFixed(2)} MB)
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleDeleteMaterial(lessonId, material.id, material.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label={`Delete material ${material.name}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MaterialItem;