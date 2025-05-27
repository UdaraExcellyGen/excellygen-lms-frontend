// features/Coordinator/CreateNewCourse/PublishCoursePage/components/MaterialItem.tsx
import React from 'react';
// Import refined types
import { ExistingMaterialFile, SubtopicFE } from '../../../../../types/course.types'; // Adjust path
import { PlayCircle, FileText, BookCheck, X } from 'lucide-react';

// interface MaterialItemProps {
//     lessonId: number; // Need lessonId to help identify which lesson this material belongs to
//     material: ExistingMaterialFile; // Use ExistingMaterialFile
//     handleDeleteMaterial: (lessonId: number, documentId: number, documentName: string) => void;
//     // Quiz related props - keep if you implement quizzes
//     // handleViewQuiz: (quizBank: QuizBank | undefined) => void;
//     // subtopic?: SubtopicFE;
// }
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
                return <FileText className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />;
            default:
                return <FileText className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />;
        }
    };

    // const handleQuizClick = () => { /* ... if quizzes implemented ... */ };

    return (
        <div className="bg-[#1B0A3F]/60 rounded-lg p-3 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300">
            <div className="flex items-center gap-2 overflow-hidden">
                {renderMaterialIcon()}
                <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white group-hover:text-[#D68BF9] transition-colors font-nunito truncate"
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