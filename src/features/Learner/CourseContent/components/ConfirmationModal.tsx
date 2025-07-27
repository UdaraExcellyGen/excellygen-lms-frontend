// src/features/Learner/CourseContent/components/ConfirmationModal.tsx
// ENTERPRISE OPTIMIZED: Lightning-fast modal with instant responsiveness
import React, { useEffect, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  courseName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = React.memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  courseName 
}) => {
  // ENTERPRISE: Optimized keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  }, [onClose, onConfirm]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // ENTERPRISE: Instant backdrop click handling
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // ENTERPRISE: Memoized event handlers for better performance
  const handleConfirmClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  }, [onConfirm]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-md rounded-xl border-2 border-red-200 p-6 shadow-2xl animate-in zoom-in-95 duration-200 transform-gpu">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-nunito">{title}</h2>
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 font-medium font-nunito text-center">
            Are you sure you want to unenroll from
          </p>
          <p className="font-bold text-gray-900 text-center text-lg mt-2 font-nunito break-words">
            "{courseName}"?
          </p>
          <div className="text-sm text-red-600 mt-3 text-center font-nunito bg-red-50 p-3 rounded-lg border border-red-200">
            <span className="block">⚠️ Your progress will be permanently lost</span>
            <span className="block">and cannot be recovered.</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCloseClick}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-150 font-semibold font-nunito border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transform-gpu"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-150 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-nunito focus:outline-none focus:ring-2 focus:ring-red-300 transform-gpu"
          >
            Unenroll
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;