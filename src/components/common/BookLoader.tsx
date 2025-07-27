// src/components/common/BookLoader.tsx
// ENTERPRISE: Google-style progress bar (NO full-page overlay)
import React, { useEffect, useState } from 'react';
import { useLoading } from '../../contexts/LoadingContext';

interface BookLoaderProps {
  containerClassName?: string;
}

const BookLoader: React.FC<BookLoaderProps> = ({ 
  containerClassName = ""
}) => {
  const { isLoading } = useLoading();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      // ENTERPRISE: Only show after 1 second for truly slow operations (like Google)
      timer = setTimeout(() => {
        setShouldShow(true);
      }, 1000); // Increased from 500ms - most operations shouldn't need loading
    } else {
      setShouldShow(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  // ENTERPRISE: Don't show for quick operations
  if (!shouldShow) return null;

  // ENTERPRISE: Google-style progress bar (NO overlay, NO blocking)
  return (
    <>
      {/* Top progress bar like Google */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1">
        <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] animate-pulse">
          <div className="h-full bg-white/30 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Optional: Small indicator in corner (like Microsoft) */}
      <div className="fixed top-4 right-4 z-[100]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[#BF4BF6]/30 border-t-[#BF4BF6] rounded-full animate-spin"></div>
            <span className="text-xs text-gray-600 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookLoader;