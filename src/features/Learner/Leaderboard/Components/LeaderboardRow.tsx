import React from 'react';

const LeaderboardRow = ({ rank, learner, isCurrentUser }) => {
  if (!learner) return null;
  
  // Create a user-friendly avatar from the first letters of the name if no image is provided
  const avatarText = learner.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className={`p-4 ${isCurrentUser ? 'bg-[#F6E6FF]' : 'bg-white'} 
      rounded-xl mb-3 transform transition-all duration-300
      hover:shadow-lg hover:scale-[1.02] cursor-pointer
      ${isCurrentUser ? 'border-2 border-[#BF4BF6]' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-8 text-center font-bold text-gray-900">
          {rank}
        </div>
        
        {learner.avatar ? (
          <img src={learner.avatar} alt={learner.name} className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center text-white font-semibold">
            {avatarText}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{learner.name}</h3>
          </div>
          <p className="text-sm text-gray-500">{learner.title || 'Learner'}</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center group">
            <p className="text-sm text-gray-500">Points</p>
            <p className="font-semibold text-gray-900 group-hover:text-[#BF4BF6] transition-colors">
              {learner.points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow;