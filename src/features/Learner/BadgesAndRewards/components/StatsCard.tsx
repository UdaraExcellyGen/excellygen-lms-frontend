import React from 'react';
import { BadgeStat } from '../types/Badge';

interface StatsCardProps {
  stat: BadgeStat;
}

const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const { icon: Icon, label, value, color } = stat;
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:border-[#BF4BF6]/40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-[#52007C] font-nunito font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#1B0A3F] mt-1 font-unbounded">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;