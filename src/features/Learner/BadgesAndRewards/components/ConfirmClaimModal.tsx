import React, { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Badge } from '../types/Badge';

interface ConfirmClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  badge: Badge | null;
  isClaiming: boolean;
}

const SVGIcon: React.FC<{ src: string; alt: string; className?: string; }> = ({ src, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  if (imageError) {
    return <div className={`flex items-center justify-center ${className}`}><Trophy className="w-full h-full text-gray-400" /></div>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setImageError(true)} loading="lazy" />;
};

const ConfirmClaimModal: React.FC<ConfirmClaimModalProps> = ({ isOpen, onClose, onConfirm, badge, isClaiming }) => {
  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md font-nunito animate-modalEnter bg-white/98 backdrop-blur-md rounded-xl shadow-2xl">
        <div className="relative p-6 text-center bg-gradient-to-br from-pale-purple to-heliotrope/30">
          <button onClick={onClose} disabled={isClaiming} className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"><X className="w-5 h-5" /></button>
          <div className="inline-flex p-4 mb-4 bg-white rounded-full shadow-lg"><SVGIcon src={badge.iconPath} alt={badge.title} className="w-12 h-12" /></div>
          <h2 className="mb-2 text-xl font-bold text-russian-violet">🎉 Congratulations!</h2>
          <p className="font-medium text-indigo">You've earned the <strong>{badge.title}</strong> badge!</p>
        </div>
        <div className="p-6">
          <div className="p-4 mb-6 border rounded-lg bg-pale-purple border-phlox/20"><p className="font-medium text-center text-indigo">"{badge.description}"</p></div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isClaiming} className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed">Claim Later</button>
            <button onClick={onConfirm} disabled={isClaiming} className="flex-2 flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-phlox to-french-violet hover:from-secondary-light hover:to-phlox rounded-lg hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed">
              {isClaiming ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : <Trophy size={18} />}
              {isClaiming ? 'Claiming...' : 'Claim Badge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmClaimModal;