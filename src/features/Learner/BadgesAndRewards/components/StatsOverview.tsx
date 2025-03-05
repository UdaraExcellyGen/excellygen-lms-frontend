import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { Badge, BadgeStat } from '../types/Badge';
import StatsCard from './StatsCard';

interface StatsOverviewProps {
  badges: Badge[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ badges }) => {
  const stats: BadgeStat[] = [
    { 
      icon: Trophy, 
      label: 'Total Badges', 
      value: badges.length,
      color: 'from-amber-400 to-amber-600'
    },
    { 
      icon: Award, 
      label: 'Badges Earned', 
      value: `${badges.filter(b => b.isUnlocked).length}/${badges.length}`,
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} />
      ))}
    </div>
  );
};

export default StatsOverview;