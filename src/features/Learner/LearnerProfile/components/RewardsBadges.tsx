import React from 'react';
import { ProfileData } from '../types';
import { Award } from 'lucide-react';

const RewardsBadges: React.FC<{ profileData: ProfileData }> = ({ profileData }) => {
  const { totalBadges, recentBadges } = profileData.rewards;

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Achievements</h3>
        <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{totalBadges}</p>
            <p className="text-xs text-gray-500 font-medium">Badges Earned</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentBadges.length > 0 ? (
          recentBadges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center p-2 group" title={`${badge.title}: ${badge.description}`}>
                <div className="w-20 h-20 mb-3 rounded-full bg-gray-100 flex items-center justify-center transform transition-transform group-hover:scale-110 border-4 border-white shadow-md">
                    <img src={badge.iconPath} alt={badge.title} className="w-12 h-12"/>
                </div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{badge.title}</p>
                <p className="text-xs text-gray-500">{new Date(badge.dateEarned!).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <Award size={32} className="mx-auto mb-2"/>
            <p>No badges have been earned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsBadges;