// src/features/Coordinator/CreateNewCourse/BasicCourseDetails/components/ConfirmationDialog.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Leave",
  cancelText = "Stay",
}) => {
  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-6 rounded-2xl">
      
      {/* Dialog Box (No changes needed here) */}
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all m-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;