import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles, Gift, Trophy, HelpCircle } from 'lucide-react';
import { Badge } from '../types/Badge';

interface BadgeCardProps {
  badge: Badge;
  onClaimBadge: (badge: Badge) => void;
}

const SVGIcon: React.FC<{ src: string; alt: string; className?: string; isLocked?: boolean; }> = ({ src, alt, className = '', isLocked = false }) => {
  const [imageError, setImageError] = useState(false);
  if (imageError) {
    return <div className={`flex items-center justify-center ${className}`}><Trophy className="w-full h-full text-gray-400" /></div>;
  }
  // This grayscale class is what makes the icon ash-colored when locked
  return <img src={src} alt={alt} className={`${className} ${isLocked ? 'grayscale' : ''} transition-all duration-300`} onError={() => setImageError(true)} loading="lazy" />;
};

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClaimBadge }) => {
  const progressPercentage = badge.targetProgress > 0 ? (badge.currentProgress / badge.targetProgress) * 100 : 0;
  const canClaim = badge.isUnlocked && !badge.isClaimed;
  const isLocked = !badge.isUnlocked;

  const getIconBgClass = () => {
    if (badge.isClaimed) return `bg-gradient-to-br ${badge.color}-gradient-start to-${badge.color}-gradient-end`; // Example for custom colors
    if (canClaim) return 'bg-gradient-to-br from-status-warning to-yellow-400 animate-pulse';
    // When locked, use a neutral background to make the grayscale icon stand out
    return 'bg-gray-200'; 
  };

  const getProgressBarClass = () => {
    if (badge.isClaimed) return 'bg-gradient-to-r from-status-success to-green-400';
    if (canClaim) return 'bg-gradient-to-r from-status-warning to-yellow-400';
    return 'bg-gradient-to-r from-phlox to-heliotrope';
  };

  return (
    <div className="relative font-nunito transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl">
      {isLocked && badge.howToEarn && (
        <div className="absolute top-2 right-2 group z-10">
          <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            {badge.howToEarn}
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative p-4 rounded-xl transition-all duration-300 shadow-lg ${getIconBgClass()}`}>
            {/* The SVGIcon will now correctly handle the grayscale effect */}
            <SVGIcon src={badge.iconPath} alt={badge.title} className="w-8 h-8" isLocked={isLocked} />
            
            {/* The Lock icon overlay has been removed */}

            {badge.isClaimed && (
              <div className="absolute -top-1 -right-1 text-yellow-400"><Sparkles className="w-4 h-4 animate-pulse" /></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-lg ${!isLocked ? 'text-russian-violet' : 'text-gray-500'}`}>{badge.title}</h3>
              {badge.isClaimed ? (
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full bg-status-success"><CheckCircle2 className="w-3 h-3" />Earned</div>
              ) : canClaim ? (
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full bg-status-warning animate-pulse"><Gift className="w-3 h-3" />Ready!</div>
              ) : (
                <div className="px-2 py-1 text-xs font-medium text-white rounded-full bg-paynes-gray">Locked</div>
              )}
            </div>
          </div>
        </div>
        <p className={`text-sm mb-4 leading-relaxed h-10 overflow-hidden ${!isLocked ? 'text-gray-600' : 'text-gray-400'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{badge.description}</p>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo">Progress</span>
              <span className="px-2 py-1 text-sm font-bold rounded-full text-russian-violet bg-pale-purple">{badge.currentProgress}/{badge.targetProgress}</span>
            </div>
            <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
              <div className={`h-full rounded-full transition-all duration-700 ${getProgressBarClass()}`} style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
            </div>
          </div>
          {canClaim ? (
            <button onClick={() => onClaimBadge(badge)} className="flex items-center justify-center w-full gap-2 py-2 font-medium text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-status-warning to-yellow-400 hover:from-yellow-500 hover:to-yellow-600 rounded-lg hover:-translate-y-0.5"><Gift className="w-4 h-4" />Claim Badge</button>
          ) : badge.isClaimed && badge.dateEarned ? (
            <div className="p-3 text-center border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center justify-center gap-2 mb-1 text-green-700"><Calendar className="w-4 h-4" /><span className="text-sm font-medium">Earned</span></div>
              <span className="text-xs text-green-600">{new Date(badge.dateEarned).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          ) : (
            <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50"><span className="text-sm font-medium text-paynes-gray">{badge.targetProgress - badge.currentProgress > 0 ? `${badge.targetProgress - badge.currentProgress} more to unlock` : 'Keep learning!'}</span></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;