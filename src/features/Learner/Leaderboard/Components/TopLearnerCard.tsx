import React from 'react';
import { Crown, Medal, Star } from 'lucide-react';

const TopLearnerCard = ({ rank, learner }) => {
  if (!learner) return null;

  // Create a user-friendly avatar from the first letters of the name if no image is provided
  const avatarText = learner.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);

  const backgrounds = {
    1: 'bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00]', // Gold
    2: 'bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080]', // Silver
    3: 'bg-gradient-to-br from-[#CD7F32] via-[#B87333] to-[#A66A2E]'  // Bronze
  };
  
  const scales = {
    1: 'md:scale-110',
    2: 'md:scale-100',
    3: 'md:scale-95'
  };

  const icons = { 1: Crown, 2: Medal, 3: Medal };
  const Icon = icons[rank];

  return (
    <div className={`w-full md:w-60 lg:w-72 ${scales[rank]} ${backgrounds[rank]} rounded-2xl p-4 md:p-6 text-white relative overflow-hidden group shadow-2xl`}>
      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      <div className="absolute -top-2 -right-2 w-10 md:w-12 h-10 md:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
        <Icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
      </div>
      
      <div className="relative z-10">
        <div className="space-y-3 md:space-y-4">
          <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2">
            
            {/* THIS IS THE CORRECTED SECTION */}
            {learner.avatar ? (
                <img src={learner.avatar} alt={learner.name} className="h-12 md:h-16 w-12 md:w-16 rounded-xl object-cover ring-2 md:ring-4 ring-white/30" />
            ) : (
                <div className="h-12 md:h-16 w-12 md:w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl font-bold ring-2 md:ring-4 ring-white/30">
                  {avatarText}
                </div>
            )}
            {/* END OF CORRECTION */}

            <div className="md:text-center">
              <h3 className="text-base md:text-xl font-bold">{learner.name}</h3>
              <p className="text-sm md:text-base text-white/90">{learner.title || 'Learner'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 pt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center mx-auto md:w-full">
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