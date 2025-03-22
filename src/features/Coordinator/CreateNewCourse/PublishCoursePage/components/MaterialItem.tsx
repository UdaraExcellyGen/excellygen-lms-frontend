// features/createNewCourse/components/MaterialItem.tsx
import React from 'react';
import {  QuizBank, MaterialFile, Subtopic } from '../../../contexts/CourseContext';
import {
    PlayCircle,
    FileText,
    BookCheck,
    X
} from 'lucide-react';
interface MaterialItemProps {
    material: MaterialFile;
    handleDeleteMaterial: (materialId: string) => void;
    handleViewQuiz: (quizBank: QuizBank | undefined) => void;
    subtopic?: Subtopic; // Optional, for quiz context if needed
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material, handleDeleteMaterial, handleViewQuiz, subtopic }) => {
    const renderMaterialIcon = () => {
        switch (material.type) {
            case 'document':
                return <FileText className="w-5 h-5 mr-3 text-[#D68BF9]" />;
            case 'video':
                return <PlayCircle className="w-5 h-5 mr-3 text-[#D68BF9]" />;
            case 'quiz':
                return <BookCheck className="w-5 h-5 mr-3 text-[#D68BF9]" />;
            default:
                return <FileText className="w-5 h-5 mr-3 text-[#D68BF9]" />;
        }
    };

    const handleQuizClick = () => {
        if (material.type === 'quiz' && subtopic?.quizBank) {
            handleViewQuiz(subtopic.quizBank);
        } else if (material.type === 'quiz') {
            console.warn(`No quiz bank for material: ${material.name || 'Unnamed Quiz'}`);
        }
    };


    return (
        <div className="bg-[#1B0A3F]/60 rounded-lg p-4 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300">
            <div className="flex items-center">
                {renderMaterialIcon()}
                {material.type === 'quiz' ? (
                    <button
                        onClick={handleQuizClick}
                        className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito text-left flex items-center gap-1"
                        style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        {material.name || "Unnamed Quiz"}
                    </button>
                ) : (
                    <p className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito">
                        {material.name}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Delete material ${material.name}`}
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
            </div>
        </div>
    );
};

export default MaterialItem;