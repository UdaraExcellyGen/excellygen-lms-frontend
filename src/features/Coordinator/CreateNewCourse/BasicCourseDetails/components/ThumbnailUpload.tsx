// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/ThumbnailUpload.tsx
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ThumbnailUploadProps {
    thumbnail: File | null;
    error?: boolean;
    errorMessage?: string;
    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
    onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
    thumbnail,
    error,
    errorMessage,
    isDragging,
    setIsDragging,
    onFileInputChange,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave
}) => {
    return (
        <div>
            <p className="text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Thumbnail Image</p>
            <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <div
                    className={`border-1 border-dashed bg-[#1B0A3F]/60 rounded-lg p-1 text-center transition-colors ${isDragging ? 'border-[#BF4BF6] bg-[#F6E6FF]/10' : 'border-[#1B0A3F]/60'}`}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {thumbnail ? (
                        <img
                            src={URL.createObjectURL(thumbnail)}
                            alt="Course thumbnail"
                            className="w-full h-60 object-cover rounded-lg"
                        />
                        
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center">
                            <ImageIcon size={40} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 font-['Nunito_Sans']">Drag and drop image here</p>
                            <p className="text-sm text-gray-500 font-['Nunito_Sans']">or</p>
                            <p className="text-sm text-gray-500 font-['Nunito_Sans']">Click to Browse</p>
                            <p className="text-xs text-gray-400 font-['Nunito_Sans']">PNG, JPG, Max 2MB size</p>
                        </div>
                    )}
                </div>
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
                id="thumbnail-upload"
            />
            {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
        </div>
    );
};

export default ThumbnailUpload;