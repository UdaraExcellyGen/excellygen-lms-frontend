// src/features/Learner/CourseCategories/components/StatsOverview.tsx
import React from 'react';
import StatsCard from './StatsCard'; // Ensure this is the correct StatsCard
import { BookOpen, Users } from 'lucide-react'; // Ensure icons are imported

interface StatsOverviewProps {
  totalCoursesOverall: number; // ADDED: Dynamic prop for total courses
  totalActiveLearnersOverall: number; // ADDED: Dynamic prop for total active learners
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  totalCoursesOverall, 
  totalActiveLearnersOverall 
}) => {
  // Define statsData internally using the passed props
  const statsData = [
    { 
      icon: BookOpen, 
      label: 'Total Courses', 
      value: `${totalCoursesOverall}+` // DYNAMIC: Use prop
    },
    { 
      icon: Users, 
      label: 'Active Learners', 
      value: `${totalActiveLearnersOverall.toLocaleString()}+` // DYNAMIC: Use prop and format
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {statsData.map((stat, index) => (
        <StatsCard
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