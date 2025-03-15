import React, { ReactNode } from 'react';  
import { Trophy, Star, LucideProps } from 'lucide-react'; 

interface StatCardProps {
  label: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  type IconType = (props: LucideProps) => ReactNode;

  const iconMap: { [key: string]: IconType } = {
    "Your Rank": Trophy,
    "Total Points": Star
  };

  const IconComponent: IconType = iconMap[label] || Star; 

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#F6E6FF]">
          <IconComponent className="h-6 w-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
};