import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Award, Book, Trophy } from 'lucide-react';
import { ProfileData } from '../types';

interface RewardsBadgesProps {
  profileData: ProfileData;
}

// Map for rendering icons when they aren't FC components
const iconMap = {
  'Award': Award,
  'Book': Book,
  'Trophy': Trophy
};

const RewardsBadges: React.FC<RewardsBadgesProps> = ({
  profileData
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="p-6 border-b border-[#BF4BF6]/20 bg-[#F6E6FF]/20 backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Rewards & Badges</h2>
      </div>

      {/* Badges Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 shadow-sm">
          <p className="text-sm text-[#52007C] mb-1">Total Badges</p>
          <p className="text-2xl font-bold text-[#1B0A3F]">{profileData.rewards.totalBadges}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 shadow-sm">
          <p className="text-sm text-[#52007C] mb-1">This Month</p>
          <p className="text-2xl font-bold text-[#1B0A3F]">{profileData.rewards.thisMonth}</p>
        </div>
      </div>

      {/* Scrollable Badges */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 h-8 w-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10 hover:bg-[#F6E6FF] transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-[#52007C]" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto sm:overflow-x-hidden scroll-smooth px-2 sm:px-4 pb-2"
        >
          {profileData.rewards.recentBadges.length === 0 ? (
            <div className="flex-none w-full text-center py-10">
              <p className="text-[#52007C]">No badges earned yet.</p>
            </div>
          ) : (
            profileData.rewards.recentBadges.map((badge, index) => {
              // Determine the icon to use
              let IconComponent: React.ElementType = Award;
              
              if (badge.icon) {
                // If badge has an icon as FC
                IconComponent = badge.icon;
              } else if (typeof badge.name === 'string' && badge.name in iconMap) {
                // Use from our map if the name matches
                IconComponent = iconMap[badge.name as keyof typeof iconMap];
              }
              
              return (
                <div 
                  key={badge.id || index} 
                  className="flex-none w-64 sm:w-72 md:w-64 bg-white/90 backdrop-blur-md rounded-xl p-5 text-center transform transition-transform hover:scale-105 border border-[#BF4BF6]/20 shadow-lg hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]"
                >
                  {badge.imageUrl ? (
                    <img 
                      src={badge.imageUrl} 
                      alt={badge.name} 
                      className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover shadow-lg"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(to right, ${badge.color || '#7A00B8'}, ${badge.color ? badge.color + '99' : '#BF4BF6'})` 
                      }}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <h3 className="font-medium text-[#1B0A3F] mb-2">{badge.name}</h3>
                  <p className="text-sm text-[#52007C]">{badge.description}</p>
                  {badge.earnedDate && (
                    <p className="text-xs text-gray-500 mt-3 bg-[#F6E6FF]/50 p-1 rounded-full inline-block px-3">
                      Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 h-8 w-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10 hover:bg-[#F6E6FF] transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-[#52007C]" />
        </button>
      </div>
    </div>
  );
};

export default RewardsBadges;