import React from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 w-full max-w-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-unbounded text-[#1B0A3F]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#52007C] hover:text-[#BF4BF6] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-[#52007C] mb-6 font-nunito">
          Are you sure you want to unenroll from{' '}
          <span className="font-medium">{courseName}</span>? 
          Your progress will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-[#52007C] rounded-lg hover:bg-gray-200 transition-colors font-nunito"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito"
          >
            Confirm Unenroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;