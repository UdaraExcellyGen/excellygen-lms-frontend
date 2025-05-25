// src/features/Learner/CourseContent/components/StatsOverview.tsx
import React from 'react';
import StatCard from './StatCard';
import { BookOpen, Users, Clock } from 'lucide-react'; 

interface StatsOverviewProps {
  availableCoursesCount: number;
  enrolledCoursesCount: number;
  totalCategoryDuration: string;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  availableCoursesCount, 
  enrolledCoursesCount,
  totalCategoryDuration 
}) => {
  const statsData = [
    { 
      icon: BookOpen, 
      label: 'Available Courses', 
      value: `${availableCoursesCount}` 
    },
    { 
      icon: Users, 
      label: 'Enrolled Courses', 
      value: `${enrolledCoursesCount}` 
    },
    { 
      icon: Clock, 
      label: 'Total Duration', 
      value: totalCategoryDuration
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-12">
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