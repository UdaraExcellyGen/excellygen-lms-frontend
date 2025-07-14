// src/features/Learner/BadgesAndRewards/components/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, gradient }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:shadow-xl transition-all duration-300 font-nunito">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-medium text-[#52007C] text-sm uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold mt-1 text-[#1B0A3F]">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;