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
  error: string | null;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  onClaimBadge,
  loading,
  error
}) => {
  // Filter badges
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'earned':
        return badge.isUnlocked;
      case 'locked':
        return !badge.isUnlocked && badge.currentProgress < badge.targetProgress;
      case 'ready':
        return !badge.isUnlocked && badge.currentProgress >= badge.targetProgress;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md font-nunito">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-4 py-3 text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl px-4 py-3 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
          >
            <option value="all">All Badges</option>
            <option value="earned">Earned Badges</option>
            <option value="ready">Ready to Claim</option>
            <option value="locked">Locked Badges</option>
          </select>
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white font-unbounded mb-6">My Badges</h2>
        
        {loading && badges.length === 0 && !error ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : !loading && !error && filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-2 font-nunito">No badges found</p>
            <p className="text-gray-400 font-nunito">
              {filter === 'ready' 
                ? 'No badges are ready to claim yet'
                : filter === 'earned' 
                ? 'You haven\'t earned any badges yet'
                : 'Start learning to earn your first badge!'}
            </p>
          </div>
        ) : filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map(badge => (
              <BadgeCard 
                key={badge.id} 
                badge={badge} 
                onClaimBadge={onClaimBadge} 
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BadgeGrid;