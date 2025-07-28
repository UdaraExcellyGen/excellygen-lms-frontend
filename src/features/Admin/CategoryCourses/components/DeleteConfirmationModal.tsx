// src/features/Admin/CategoryCourses/components/DeleteConfirmationModal.tsx
// ENTERPRISE OPTIMIZED: Instant, professional confirmation dialogs
import React, { useCallback, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  message?: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
}

// ENTERPRISE: Professional confirmation modal with smart states
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmButtonText = 'Delete',
  isDestructive = true
}) => {
  // ENTERPRISE: Smart escape key handling
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      onClose();
    }
  }, [onClose, isDeleting]);

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
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  }, [onClose, isDeleting]);

  const handleConfirm = useCallback(() => {
    if (!isDeleting) {
      onConfirm();
    }
  }, [onConfirm, isDeleting]);

  // ENTERPRISE: Don't render if not open
  if (!isOpen) return null;

  // ENTERPRISE: Smart button styling based on action type
  const getButtonStyles = () => {
    if (isDestructive) {
      return "bg-red-500 hover:bg-red-600 text-white shadow-sm";
    }
    return "bg-[#BF4BF6] hover:bg-[#A845E8] text-white shadow-sm";
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl transform transition-all animate-scaleIn"
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
              className="text-xl font-bold text-[#1B0A3F] font-['Unbounded']"
            >
              {title}
            </h3>
          </div>
          {!isDeleting && (
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
          <p className="text-gray-600 font-['Nunito_Sans'] leading-relaxed mb-4">
            {message}
          </p>

          {/* ENTERPRISE: Professional warning for destructive actions */}
          {isDestructive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans'] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`px-6 py-2 rounded-full font-['Nunito_Sans'] font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Deleting...</span>
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

export default DeleteConfirmationModal;