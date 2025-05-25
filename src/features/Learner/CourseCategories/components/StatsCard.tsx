// src/features/Learner/CourseCategories/components/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center p-6 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 rounded-2xl backdrop-blur-lg shadow-xl border border-purple-500/20 transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-400/30 hover:translate-y-[-2px]">
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-xl mr-6 shadow-lg">
        <Icon size={28} className="text-white" />
      </div>
      <div>
        <h3 className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-1">{label}</h3>
        <div className="flex items-baseline">
          <p className="text-white text-4xl font-bold">{value.replace('+', '')}</p>
          {value.includes('+') && <span className="text-purple-300 text-2xl font-bold ml-1">+</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;