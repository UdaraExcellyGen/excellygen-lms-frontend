// src/features/Learner/CourseContent/components/ConfirmationModal.tsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  courseName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  courseName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl border-2 border-red-200 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-nunito">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 font-medium font-nunito text-center">
            Are you sure you want to unenroll from
          </p>
          <p className="font-bold text-gray-900 text-center text-lg mt-2 font-nunito">
            "{courseName}"?
          </p>
          <p className="text-sm text-red-600 mt-3 text-center font-nunito bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ Your progress will be permanently lost and cannot be recovered.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold font-nunito border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-nunito"
          >
            Unenroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;