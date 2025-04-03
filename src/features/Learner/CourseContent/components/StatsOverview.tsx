import React from 'react';
import StatCard from './StatCard';
import { getStatsData } from '../data/statsData';

interface StatsOverviewProps {
  availableCoursesCount: number;
  enrolledCoursesCount: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  availableCoursesCount, 
  enrolledCoursesCount 
}) => {
  const statsData = getStatsData(availableCoursesCount, enrolledCoursesCount);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
};

export default StatsOverview;