import React from 'react';
import { Crown, Medal, Star } from 'lucide-react';

const TopLearnerCard = ({ rank, learner }) => {
  if (!learner) return null;

  const backgrounds = {
    1: 'bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00]', // Gold
    2: 'bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080]', // Silver
    3: 'bg-gradient-to-br from-[#CD7F32] via-[#B87333] to-[#A66A2E]'  // Bronze
  };
  
  const scales = {
    1: 'scale-110',
    2: 'scale-100',
    3: 'scale-95'
  };

  const icons = { 1: Crown, 2: Medal, 3: Medal };
  const Icon = icons[rank];

  return (
    <div className={`w-72 ${scales[rank]} ${backgrounds[rank]} rounded-2xl p-6 text-white relative overflow-hidden group shadow-2xl`}>
      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      
      <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      
      <div className="relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold ring-4 ring-white/30">
              {learner.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold">{learner.name}</h3>
              <p className="text-white/90">{learner.title}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <Star className="h-4 w-4 mx-auto mb-1" />
              <span className="text-sm font-bold">{learner.points.toLocaleString()}</span>
              <p className="text-xs text-white/80">points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopLearnerCard;