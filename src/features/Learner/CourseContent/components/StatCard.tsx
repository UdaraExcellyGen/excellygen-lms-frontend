// src/features/Learner/CourseContent/components/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center p-4 md:p-6 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 rounded-xl md:rounded-2xl backdrop-blur-lg shadow-xl border border-purple-500/20 transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-400/30 hover:translate-y-[-2px]">
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 p-3 md:p-4 rounded-lg md:rounded-xl mr-4 md:mr-6 shadow-lg">
        <Icon size={20} className="text-white md:w-7 md:h-7" />
      </div>
      <div>
        <h3 className="text-purple-200 text-xs md:text-sm font-medium uppercase tracking-wider mb-0.5 md:mb-1">{label}</h3>
        <p className="text-white text-2xl md:text-4xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;