// src/features/Learner/BadgesAndRewards/components/StatsOverview.tsx
import React from 'react';
import { Award, CheckCircle2, Star, Clock } from 'lucide-react';
import { Badge } from '../types/Badge';
import StatsCard from './StatsCard';

interface StatsOverviewProps {
  badges: Badge[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ badges }) => {
  const earnedBadges = badges.filter(b => b.isUnlocked);
  const readyToClaim = badges.filter(b => !b.isUnlocked && b.currentProgress >= b.targetProgress);

  const stats = [
    { 
      icon: Award, 
      label: 'Total Badges', 
      value: badges.length.toString(),
      gradient: 'from-phlox to-french-violet'
    },
    { 
      icon: CheckCircle2, 
      label: 'Badges Earned', 
      value: earnedBadges.length.toString(),
      gradient: 'from-heliotrope to-phlox'
    },
    { 
      icon: Star, 
      label: 'Ready to Claim', 
      value: readyToClaim.length.toString(),
      gradient: 'from-federal-blue to-indigo'
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      value: badges.filter(b => !b.isUnlocked && b.currentProgress < b.targetProgress).length.toString(),
      gradient: 'from-french-violet to-indigo'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <StatsCard 
          key={index} 
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          gradient={stat.gradient}
        />
      ))}
    </div>
  );
};

export default StatsOverview;