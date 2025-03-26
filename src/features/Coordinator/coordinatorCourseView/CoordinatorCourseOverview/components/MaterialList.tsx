// components/MaterialList.tsx
import React from 'react';
import { Material } from '../types';
import { FileText, PlayCircle, X } from 'lucide-react';

interface MaterialListProps {
    materials?: Material[];
    askDeleteConfirmation: (materialId: string) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, askDeleteConfirmation }) => {
    return (
        <>
            {materials?.map((material, index) => (
                <div
                    key={index}
                    className="bg-[#1B0A3F]/60 rounded-lg p-2 sm:p-4 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300"
                >
                    <div className="flex items-center min-w-0">
                        {material.type === 'document' ? (
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D68BF9] flex-shrink-0" />
                        ) : (
                            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D68BF9] flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito text-xs sm:text-sm truncate">
                                {material.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => askDeleteConfirmation(material.id)}
                        className="hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                        aria-label={`Delete material ${material.name}`}
                    >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            ))}
        </>
    );
};

export default MaterialList;