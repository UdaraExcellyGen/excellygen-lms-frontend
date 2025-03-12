import React from 'react';
import { StatCardProps } from '../types/types';

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  stats,
  totalLabel,
  activeLabel,
  onViewMore
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={24} className="text-[#BF4BF6]" />
        <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">{title}</h2>
      </div>
      
      <div className="space-y-6 mb-6">
        <div>
          <p className="text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2">{stats.total}</p>
          <p className="text-gray-400 font-['Nunito_Sans']">{totalLabel}</p>
        </div>
        <div>
          <p className="text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2">{stats.active}</p>
          <p className="text-gray-400 font-['Nunito_Sans']">{activeLabel}</p>
        </div>
      </div>
      
      <button 
        onClick={onViewMore}
        className="w-full py-3 px-6 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-['Nunito_Sans'] shadow-lg active:scale-95 inline-flex items-center justify-center gap-2"
      >
        <span>View More</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default StatCard;