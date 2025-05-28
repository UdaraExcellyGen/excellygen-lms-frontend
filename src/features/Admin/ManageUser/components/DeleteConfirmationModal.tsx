import React from 'react';

interface DeleteConfirmationModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  setUserToDelete: (id: string | null) => void;
  confirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  setUserToDelete,
  confirmDelete,
  isDeleting
}) => {
  if (!showDeleteModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] 
               animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scaleIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl text-[#1B0A3F] font-['Unbounded'] mb-4">Confirm Delete</h2>
        <p className="text-gray-600 font-['Nunito_Sans'] mb-6">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans'] transition-colors duration-200"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-full font-['Nunito_Sans'] 
                     hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;