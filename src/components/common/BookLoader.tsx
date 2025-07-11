import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';

interface BookLoaderProps {
  containerClassName?: string;
}

const BookLoader: React.FC<BookLoaderProps> = ({ 
  containerClassName = "" 
}) => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-sm ${containerClassName}`}>
      <div className="bg-white rounded-lg p-4 shadow-lg border">
        {/* Pure CSS spinner - 0KB, no external dependencies */}
        <div className="w-6 h-6 mx-auto mb-2 border-2 border-gray-200 border-t-[#52007C] rounded-full animate-spin"></div>
        <p className="text-xs text-gray-600 text-center">Loading...</p>
      </div>
    </div>
  );
};

export default BookLoader;