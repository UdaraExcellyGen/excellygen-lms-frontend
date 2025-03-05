import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '../types/Badge';

interface ConfirmClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  badge: Badge | null;
}

const ConfirmClaimModal: React.FC<ConfirmClaimModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  badge 
}) => {
  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 w-full max-w-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-unbounded text-[#1B0A3F]">{badge.title}</h2>
          <button
            onClick={onClose}
            className="text-[#52007C] hover:text-[#BF4BF6] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-[#52007C] mb-6 font-nunito">
          Congratulations! You've earned this badge. Would you like to claim it now?
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
            Claim Badge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmClaimModal;