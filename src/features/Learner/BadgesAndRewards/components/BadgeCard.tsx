import React from 'react';
import { Calendar, Lock } from 'lucide-react';
import { Badge } from '../types/Badge';

interface BadgeCardProps {
  badge: Badge;
  onClaimBadge: (badge: Badge) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClaimBadge }) => {
  const Icon = badge.icon;
  const progressPercentage = (badge.currentProgress / badge.targetProgress) * 100;
  
  return (
    <div
      className={`relative group transition-all duration-500 hover:-translate-y-1
        ${badge.isUnlocked 
          ? 'hover:shadow-[0_8px_30px_rgb(191,75,246,0.2)]' 
          : 'opacity-80 hover:opacity-100'
        }`}
    >
      {/* Card Background with Gradient Border */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br p-[2px]
        ${badge.isUnlocked 
          ? 'from-[#BF4BF6] via-[#D68BF9] to-[#7A00B8] animate-gradient-shift' 
          : 'from-[#52007C]/40 to-[#34137C]/40'
        }`}
      >
        <div className="absolute inset-0 rounded-xl bg-[#1B0A3F]/95 backdrop-blur-xl" />
      </div>

      {/* Card Content */}
      <div className="relative p-6 rounded-xl">
        {/* Badge Header */}
        <div className="flex items-start gap-4">
          <div className={`relative p-4 rounded-2xl transition-transform duration-300 group-hover:scale-105
            ${badge.isUnlocked
              ? 'bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] shadow-lg shadow-[#BF4BF6]/20'
              : 'bg-[#1B0A3F] border border-[#BF4BF6]/20'
            }`}
          >
            <Icon className={`w-8 h-8 ${
              badge.isUnlocked 
                ? 'text-white animate-pulse' 
                : 'text-[#D68BF9]/40'
            }`} />
            {badge.isUnlocked && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#1B0A3F]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className={`text-xl font-bold font-unbounded mb-1 truncate
                ${badge.isUnlocked 
                  ? 'text-white' 
                  : 'text-white/50'
                }`}
              >
                {badge.title}
              </h3>
              {!badge.isUnlocked && (
                <Lock className="w-5 h-5 text-[#D68BF9]/30 ml-2 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Badge Description */}
        <p className={`mt-4 text-sm font-nunito min-h-[3rem] ${
          badge.isUnlocked ? 'text-[#D68BF9]' : 'text-[#D68BF9]/40'
        }`}>
          {badge.description}
        </p>

        {/* Progress Section */}
        <div className="mt-6 space-y-3">
          <div className="relative h-2 bg-[#1B0A3F] rounded-full overflow-hidden">
            <div className={`absolute inset-0 opacity-20 ${
              badge.isUnlocked ? 'bg-[#D68BF9]' : 'bg-white/5'
            }`} />
            <div 
              className={`h-full transition-all duration-500 
                ${badge.isUnlocked
                  ? 'bg-gradient-to-r from-[#BF4BF6] via-[#D68BF9] to-[#7A00B8] animate-pulse'
                  : 'bg-[#D68BF9]/20'
                }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm font-nunito ${
              badge.isUnlocked ? 'text-[#D68BF9]' : 'text-[#D68BF9]/40'
            }`}>
              {badge.currentProgress}/{badge.targetProgress}
            </span>
            {badge.currentProgress >= badge.targetProgress && !badge.isUnlocked && (
              <button
                onClick={() => onClaimBadge(badge)}
                className="px-6 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] 
                  text-white rounded-lg font-nunito text-sm
                  hover:from-[#D68BF9] hover:to-[#BF4BF6] 
                  transform hover:scale-105 hover:shadow-lg hover:shadow-[#BF4BF6]/20
                  transition-all duration-300 active:scale-95"
              >
                Claim Badge
              </button>
            )}
          </div>
        </div>

        {/* Achievement Date */}
        {badge.isUnlocked && badge.dateEarned && (
          <div className="mt-4 pt-4 border-t border-[#BF4BF6]/20">
            <p className="text-sm text-[#D68BF9]/60 font-nunito flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Earned {new Date(badge.dateEarned).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCard;