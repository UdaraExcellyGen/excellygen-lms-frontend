import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfileData } from '../types';

interface RewardsBadgesProps {
  profileData: ProfileData;
}

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
    <div className="p-4 md:p-8 border-b">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Rewards & Badges</h2>
      </div>

      {/* Scrollable Badges */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 h-8 w-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
        >
          <ChevronLeft className="h-5 w-5 text-[#52007C]" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto sm:overflow-x-hidden scroll-smooth px-2 sm:px-4 pb-2"
        >
          {profileData.rewards.recentBadges.map((badge, index) => (
            <div key={index} className="flex-none w-64 sm:w-72 md:w-64 bg-[#F6E6FF] rounded-xl p-4 md:p-6 text-center transform transition-transform hover:scale-105">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: badge.color }}
              >
                <badge.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-medium text-[#1B0A3F] mb-2">{badge.name}</h3>
              <p className="text-sm text-[#52007C]">{badge.description}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 h-8 w-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
        >
          <ChevronRight className="h-5 w-5 text-[#52007C]" />
        </button>
      </div>
    </div>
  );
};

export default RewardsBadges;