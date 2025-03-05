import React from 'react';
import { Badge } from '../types/Badge';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: Badge[];
  onClaimBadge: (badge: Badge) => void;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, onClaimBadge }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges.map(badge => (
        <BadgeCard 
          key={badge.id} 
          badge={badge} 
          onClaimBadge={onClaimBadge} 
        />
      ))}
    </div>
  );
};

export default BadgeGrid;