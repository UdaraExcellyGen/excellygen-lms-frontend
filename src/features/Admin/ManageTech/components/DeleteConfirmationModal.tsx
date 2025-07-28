// src/features/Admin/ManageTech/components/DeleteConfirmationModal.tsx
// ENTERPRISE OPTIMIZED: Instant, professional confirmation dialogs
import React, { useCallback, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  technology?: {
    name: string;
  };
}

// ENTERPRISE: Professional confirmation modal with smart states
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  technology
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

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

  // ENTERPRISE: Optimistic confirmation handling
  const handleConfirm = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onConfirm();
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error handling is done in parent component
      console.error('Delete confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm, isProcessing]);

  // ENTERPRISE: Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Confirm Delete
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
          <p className="text-gray-600 mb-4 leading-relaxed">
            Are you sure you want to delete this technology? This action cannot be undone.
          </p>

          {/* ENTERPRISE: Technology details for better context */}
          {technology && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Technology Details:</h4>
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Name:</span>
                  <span className="font-medium text-gray-900">{technology.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* ENTERPRISE: Professional warning for destructive actions */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Warning:</strong> This action cannot be undone. The technology will be permanently removed from the system.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Technology</span>
            )}
          </button>
        </div>

        {/* ENTERPRISE: Progress indicator for long operations */}
        {isProcessing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div className="h-full bg-red-500 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};