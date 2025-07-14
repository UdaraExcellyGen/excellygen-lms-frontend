// src/features/Learner/BadgesAndRewards/components/ConfirmClaimModal.tsx
import React, { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Badge } from '../types/Badge';

interface ConfirmClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  badge: Badge | null;
}

// SVG Icon Component
const SVGIcon: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Trophy className="text-gray-400 w-full h-full" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

const ConfirmClaimModal: React.FC<ConfirmClaimModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  badge 
}) => {
  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/98 backdrop-blur-md w-full max-w-md rounded-xl shadow-2xl font-nunito animate-modalEnter">
        
        {/* Modal Header */}
        <div className="relative p-6 text-center bg-gradient-to-br from-pale-purple to-heliotrope/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="inline-flex p-4 bg-white rounded-full shadow-lg mb-4">
            <SVGIcon 
              src={badge.iconPath} 
              alt={badge.title}
              className="w-12 h-12"
            />
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-russian-violet">
            🎉 Congratulations!
          </h2>
          <p className="font-medium text-indigo">
            You've earned the <strong>{badge.title}</strong> badge!
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="p-4 rounded-lg mb-6 bg-pale-purple border border-phlox/20">
            <p className="text-center font-medium text-indigo">
              "{badge.description}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Claim Later
            </button>
            <button
              onClick={onConfirm}
              className="flex-2 bg-gradient-to-r from-phlox to-french-violet hover:from-secondary-light hover:to-phlox text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg transform hover:-translate-y-0.5"
            >
              <Trophy size={18} />
              Claim Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmClaimModal;