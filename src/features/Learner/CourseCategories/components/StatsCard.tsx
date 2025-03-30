import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="w-24 bg-gradient-to-b from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center p-6">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-center">
        <p className="text-sm uppercase tracking-wider text-[#52007C]/70 font-semibold mb-1">{label}</p>
        <p className="text-4xl font-bold text-[#1B0A3F]">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;