import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';

const BookLoader: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-2xl max-w-sm mx-4">
        {/* Book Animation */}
        <div className="relative">
          <div className="w-16 h-20 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] rounded-lg shadow-lg transform animate-pulse">
            {/* Book pages */}
            <div className="absolute top-2 left-2 right-2 bottom-2 bg-white rounded-md">
              <div className="h-full w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-md relative overflow-hidden">
                {/* Page lines */}
                <div className="absolute top-2 left-2 right-2 space-y-1">
                  <div className="h-0.5 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-0.5 bg-gray-300 rounded animate-pulse delay-100"></div>
                  <div className="h-0.5 bg-gray-300 rounded animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
            
            {/* Book spine */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#52007C] rounded-l-lg"></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#D68BF9] rounded-full animate-bounce"></div>
          <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-[#BF4BF6] rounded-full animate-bounce delay-300"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-unbounded font-semibold text-[#1B0A3F] mb-2">
            Loading...
          </h3>
          <p className="text-gray-600 font-nunito text-sm">
            Please wait while we prepare your content
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] rounded-full animate-pulse"></div>
        </div>

        {/* Spinning Loader as Backup */}
        <div className="w-8 h-8 border-3 border-purple-200 border-t-[#BF4BF6] rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default BookLoader;