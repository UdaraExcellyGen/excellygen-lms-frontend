import React from 'react';
import { StatCardProps } from '../types/types';

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  stats,
  totalLabel,
  activeLabel,
  onClick
}) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon size={24} className="text-[#BF4BF6]" />
        <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">{title}</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2">{stats.total}</p>
          <p className="text-gray-400 font-['Nunito_Sans']">{totalLabel}</p>
        </div>
        <div>
          <p className="text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2">{stats.active}</p>
          <p className="text-gray-400 font-['Nunito_Sans']">{activeLabel}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;