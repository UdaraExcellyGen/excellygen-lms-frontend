
import React, { useState, ChangeEvent, DragEvent, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Errors } from '../types/CourseDetails';

interface ThumbnailUploaderProps {
  thumbnail: File | null;
  onThumbnailChange: (file: File | null) => void;
  setThumbnailError: (error: string) => void;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
}

export const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({
  thumbnail,
  onThumbnailChange,
  setThumbnailError,
  setErrors
}) => {
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);

  const handleFileProcessing = useCallback((file: File) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedImageTypes.includes(file.type)) {
      const maxSizeMB = 2;
      const maxSizeByte = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeByte) {
        setThumbnailError(`Image size should be less than ${maxSizeMB}MB.`);
        setErrors((prevErrors: Errors) => ({ ...prevErrors, thumbnail: true })); 
        onThumbnailChange(null);
        return;
      }

      onThumbnailChange(file);
      setThumbnailError('');
      setErrors((prevErrors: Errors) => ({ ...prevErrors, thumbnail: false })); 
    } else {
      setThumbnailError("Please upload a valid JPG or PNG image file.");
      setErrors((prevErrors: Errors) => ({ ...prevErrors, thumbnail: true })); 
      onThumbnailChange(null);
    }
  }, [onThumbnailChange, setErrors, setThumbnailError]);

  const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      handleFileProcessing(file);
    }
  }, [handleFileProcessing]);

  const handleThumbnailDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingThumbnail(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFileProcessing(file);
    }
  }, [handleFileProcessing]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback(() => {
    setIsDraggingThumbnail(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingThumbnail(false);
  }, []);


  return (
    <div>
      <p className="text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Thumbnail Image</p>
      <label htmlFor="thumbnail-upload" className="cursor-pointer">
        <div
          className={`border-1 border-dashed bg-[#1B0A3F]/60 rounded-lg p-1 text-center transition-colors ${isDraggingThumbnail ? 'border-[#BF4BF6] bg-[#F6E6FF]/10' : 'border-[#1B0A3F]/60'}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleThumbnailDrop}
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
        onChange={handleFileInputChange}
        className="hidden"
        id="thumbnail-upload"
      />
    </div>
  );
};