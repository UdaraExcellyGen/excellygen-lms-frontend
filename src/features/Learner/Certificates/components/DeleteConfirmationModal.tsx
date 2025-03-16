import React from 'react';
import { DeleteConfirmationModalProps } from '../../../../../../../../Certificates/Certificates/types/certificates';

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-xl p-6 w-full max-w-md z-10">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Delete Certificate</h3>
          <p className="text-gray-600 mt-2">
            Are you sure you want to delete this certificate? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};