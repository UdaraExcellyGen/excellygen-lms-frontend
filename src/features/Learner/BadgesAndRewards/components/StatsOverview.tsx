// src/features/Learner/BadgesAndRewards/components/StatsOverview.tsx
import React from 'react';
import { Award, CheckCircle2, Star, Clock } from 'lucide-react';
import { Badge } from '../types/Badge';
import StatsCard from './StatsCard';

interface StatsOverviewProps {
  badges: Badge[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ badges }) => {
  const earnedBadges = badges.filter(b => b.isClaimed);
  const readyToClaim = badges.filter(b => b.isUnlocked && !b.isClaimed);
  const inProgress = badges.filter(b => !b.isUnlocked);

  const stats = [
    { 
      icon: Award, 
      label: 'Total Badges', 
      value: badges.length,
      gradient: 'from-phlox to-french-violet'
    },
    { 
      icon: CheckCircle2, 
      label: 'Badges Earned', 
      value: earnedBadges.length,
      gradient: 'from-heliotrope to-phlox'
    },
    { 
      icon: Star, 
      label: 'Ready to Claim', 
      value: readyToClaim.length,
      gradient: 'from-federal-blue to-indigo'
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      value: inProgress.length,
      gradient: 'from-deep-sky-blue to-pale-azure'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
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