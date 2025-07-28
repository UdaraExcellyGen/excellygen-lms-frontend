import React from 'react';
import { StatCardProps } from '../types/types';

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  stats,
  totalLabel,
  activeLabel,
   inactiveLabel,
  onClick
}) => {
  return (
    <div
      className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#F6E6FF]">
          <Icon size={24} className="text-[#BF4BF6]" />
        </div>
        <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">{title}</h2>
      </div>
      
      <div className="space-y-6 flex-grow">
        <div>
          <p className="text-4xl text-[#52007C] font-['Unbounded'] mb-2">{stats.total}</p>
          <p className="text-gray-500 font-['Nunito_Sans']">{totalLabel}</p>
        </div>
        <div>
          <p className="text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2">{stats.active}</p>
          <p className="text-gray-500 font-['Nunito_Sans']">{activeLabel}</p>
        </div>
        {stats.inactive !== undefined && inactiveLabel && (
          <div>
            <p className="text-4xl text-gray-500 font-['Unbounded'] mb-2">{stats.inactive}</p>
            <p className="text-gray-500 font-['Nunito_Sans']">{inactiveLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;