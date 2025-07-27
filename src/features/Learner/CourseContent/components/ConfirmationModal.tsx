// src/features/Learner/CourseContent/components/ConfirmationModal.tsx
// ENTERPRISE OPTIMIZED: Professional confirmation modal matching ManageCourseCategory style
import React, { useCallback, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  courseName: string;
  isProcessing?: boolean;
  message?: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
}

// ENTERPRISE: Professional confirmation modal with enhanced UX
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  courseName,
  isProcessing = false,
  message,
  confirmButtonText = 'Confirm',
  isDestructive = true
}) => {
  // ENTERPRISE: Smart escape key handling
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isProcessing) {
      onClose();
    }
  }, [onClose, isProcessing]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // ENTERPRISE: Click outside to close (when not processing)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  }, [onClose, isProcessing]);

  const handleConfirm = useCallback(() => {
    if (!isProcessing) {
      onConfirm();
    }
  }, [onConfirm, isProcessing]);

  // ENTERPRISE: Don't render if not open
  if (!isOpen) return null;

  // ENTERPRISE: Smart button styling based on action type
  const getButtonStyles = () => {
    if (isDestructive) {
      return "bg-red-500 hover:bg-red-600 text-white shadow-sm";
    }
    return "bg-[#BF4BF6] hover:bg-[#A845E8] text-white shadow-sm";
  };

  const defaultMessage = isDestructive 
    ? `Are you sure you want to unenroll from "${courseName}"? This action cannot be undone.`
    : `Are you sure you want to proceed with "${courseName}"?`;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            )}
            <h3 
              id="modal-title"
              className="text-xl font-semibold text-gray-900 font-nunito"
            >
              {title}
            </h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 leading-relaxed font-nunito">
            {message || defaultMessage}
          </p>

          {/* ENTERPRISE: Course info for better context */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2 font-nunito">Course Details:</h4>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Course Name:</span>
                <span className="font-medium font-nunito">{courseName}</span>
              </div>
            </div>
          </div>

          {/* ENTERPRISE: Professional warning for destructive actions */}
          {isDestructive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 font-nunito">
                  <strong>Warning:</strong> Unenrolling will remove your progress and access to this course.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-nunito"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-nunito ${getButtonStyles()}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmButtonText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;