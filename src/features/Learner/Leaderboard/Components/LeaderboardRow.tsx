import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const LeaderboardRow = ({ rank, learner, isCurrentUser }) => {
  if (!learner) return null;
  
  return (
    <div className={`p-4 ${isCurrentUser ? 'bg-[#F6E6FF]' : 'bg-white'} 
      rounded-xl mb-3 transform transition-all duration-300
      hover:shadow-lg hover:scale-[1.02] cursor-pointer
      ${isCurrentUser ? 'border-2 border-[#BF4BF6]' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-8 text-center font-bold text-gray-900">
          {rank}
        </div>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center text-white font-semibold">
          {learner.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{learner.name}</h3>
            {learner.rankChange !== 0 && (
              <div className={`flex items-center ${learner.rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {learner.rankChange > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="text-xs">{Math.abs(learner.rankChange)}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{learner.title}</p>
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