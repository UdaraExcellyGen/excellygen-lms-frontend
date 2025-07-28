// src/features/Admin/ManageUsers/components/DeleteConfirmationModal.tsx
// ENTERPRISE OPTIMIZED: Performance optimizations, same functionality
import React, { useCallback, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  setUserToDelete: (id: string | null) => void;
  confirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = React.memo(({
  showDeleteModal,
  setShowDeleteModal,
  setUserToDelete,
  confirmDelete,
  isDeleting
}) => {
  // ENTERPRISE: Memoized handlers for performance
  const handleCancel = useCallback(() => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  }, [setShowDeleteModal, setUserToDelete]);

  const handleConfirm = useCallback(() => {
    if (!isDeleting) {
      confirmDelete();
    }
  }, [confirmDelete, isDeleting]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleCancel();
    }
  }, [handleCancel, isDeleting]);

  // ENTERPRISE: Keyboard support with cleanup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        handleCancel();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteModal, isDeleting, handleCancel]);

  if (!showDeleteModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scaleIn shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with icon */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 
              id="delete-modal-title"
              className="text-xl text-[#1B0A3F] font-['Unbounded']"
            >
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-600 font-['Nunito_Sans'] mb-6 leading-relaxed">
          Are you sure you want to delete this user? This will permanently remove their account and all associated data.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans'] transition-colors duration-200 rounded-lg hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-full font-['Nunito_Sans'] 
                     hover:bg-red-600 transition-all duration-300 flex items-center gap-2 
                     disabled:bg-red-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete User</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmationModal.displayName = 'DeleteConfirmationModal';

export default DeleteConfirmationModal;