// src/features/Learner/BadgesAndRewards/components/BadgeGrid.tsx
import React from 'react';
import { Search, Award } from 'lucide-react';
import { Badge } from '../types/Badge';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: Badge[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  onClaimBadge: (badge: Badge) => void;
  loading: boolean;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, searchQuery, setSearchQuery, filter, setFilter, onClaimBadge, loading }) => {
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchQuery.toLowerCase()) || badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    switch (filter) {
      case 'earned':
        return badge.isClaimed;
      case 'locked':
        return !badge.isUnlocked;
      case 'ready':
        return badge.isUnlocked && !badge.isClaimed;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-xl bg-white/90 backdrop-blur-sm border-[#BF4BF6]/20 shadow-md font-nunito">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
            <input type="text" placeholder="Search badges..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-3 pl-12 pr-4 font-nunito bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-3 font-nunito bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent">
            <option value="all">All Badges</option>
            <option value="earned">Earned</option>
            <option value="ready">Ready to Claim</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-semibold text-white font-unbounded">My Badges</h2>
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-10 h-10 border-t-2 border-b-2 border-white rounded-full animate-spin"></div></div>
        ) : filteredBadges.length === 0 ? (
          <div className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="mb-2 text-lg text-gray-300 font-nunito">No Badges Found</p>
            <p className="text-gray-400 font-nunito">
              {filter === 'ready' ? 'No badges are ready to be claimed.' :
               filter === 'earned' ? 'You haven\'t earned any badges yet.' :
               'Try a different filter or start learning to unlock badges!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBadges.map(badge => <BadgeCard key={badge.id} badge={badge} onClaimBadge={onClaimBadge} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeGrid;