// src/features/Learner/BadgesAndRewards/components/BadgeCard.tsx
import React, { useState } from 'react';
import { Calendar, CheckCircle2, Lock, Sparkles, Gift, Trophy } from 'lucide-react';
import { Badge } from '../types/Badge';

interface BadgeCardProps {
  badge: Badge;
  onClaimBadge: (badge: Badge) => void;
}

// SVG Icon Component
const SVGIcon: React.FC<{
  src: string;
  alt: string;
  className?: string;
  isLocked?: boolean;
}> = ({ src, alt, className = '', isLocked = false }) => {
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
      className={`${className} ${isLocked ? 'grayscale opacity-40' : ''} transition-all duration-300`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClaimBadge }) => {
  const progressPercentage = (badge.currentProgress / badge.targetProgress) * 100;
  const canClaim = badge.currentProgress >= badge.targetProgress && !badge.isUnlocked;
  
  const getIconBgClass = () => {
    if (badge.isUnlocked) {
      switch (badge.color) {
        case 'phlox': return 'bg-gradient-to-br from-phlox to-secondary-light';
        case 'federal-blue': return 'bg-gradient-to-br from-federal-blue to-indigo';
        case 'deep-sky-blue': return 'bg-gradient-to-br from-deep-sky-blue to-pale-azure';
        case 'status-success': return 'bg-gradient-to-br from-status-success to-green-400';
        case 'french-violet': return 'bg-gradient-to-br from-french-violet to-primary-light';
        case 'heliotrope': return 'bg-gradient-to-br from-heliotrope to-secondary-light';
        default: return 'bg-gradient-to-br from-phlox to-heliotrope';
      }
    } else if (canClaim) {
      return 'bg-gradient-to-br from-status-warning to-yellow-400';
    }
    return 'bg-gray-100';
  };

  const getProgressBarClass = () => {
    if (badge.isUnlocked) {
      return 'bg-gradient-to-r from-status-success to-green-400';
    } else if (canClaim) {
      return 'bg-gradient-to-r from-status-warning to-yellow-400';
    }
    return 'bg-gradient-to-r from-phlox to-heliotrope';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-nunito">
      <div className="p-6">
        {/* Badge Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative p-4 rounded-xl transition-all duration-300 shadow-lg ${getIconBgClass()}`}>
            <SVGIcon 
              src={badge.iconPath} 
              alt={badge.title}
              className="w-8 h-8"
              isLocked={!badge.isUnlocked && !canClaim}
            />
            
            {/* Lock Overlay */}
            {!badge.isUnlocked && !canClaim && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            )}
            
            {/* Sparkle effect for unlocked badges */}
            {badge.isUnlocked && (
              <div className="absolute -top-1 -right-1 text-yellow-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            )}
          </div>

          {/* Title and Status */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-lg ${
                badge.isUnlocked || canClaim 
                  ? 'text-russian-violet' 
                  : 'text-gray-400'
              }`}>
                {badge.title}
              </h3>
              
              {badge.isUnlocked ? (
                <div className="bg-status-success text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Earned
                </div>
              ) : canClaim ? (
                <div className="bg-status-warning text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Ready!
                </div>
              ) : (
                <div className="bg-paynes-gray text-white px-2 py-1 rounded-full text-xs font-medium">
                  Locked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 leading-relaxed h-10 overflow-hidden ${
          badge.isUnlocked || canClaim ? 'text-gray-600' : 'text-gray-400'
        }`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {badge.description}
        </p>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-indigo">Progress</span>
              <span className="text-sm font-bold text-russian-violet bg-pale-purple px-2 py-1 rounded-full">
                {badge.currentProgress}/{badge.targetProgress}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${getProgressBarClass()}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Action Button or Achievement Date */}
          {canClaim ? (
            <button
              onClick={() => onClaimBadge(badge)}
              className="w-full bg-gradient-to-r from-status-warning to-yellow-400 hover:from-yellow-500 hover:to-yellow-600 text-white py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg"
            >
              <Gift className="w-4 h-4" />
              Claim Badge
            </button>
          ) : badge.isUnlocked && badge.dateEarned ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-sm">Earned</span>
              </div>
              <span className="text-xs text-green-600">
                {new Date(badge.dateEarned).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </span>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="text-sm text-paynes-gray font-medium">
                {badge.targetProgress - badge.currentProgress} more to unlock
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;