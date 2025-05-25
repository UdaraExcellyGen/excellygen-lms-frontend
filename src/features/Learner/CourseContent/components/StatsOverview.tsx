// src/features/Learner/CourseContent/components/StatsOverview.tsx
import React from 'react';
import StatCard from './StatCard';
import { BookOpen, Users, Clock } from 'lucide-react'; 
// Removed statsData import because it's passed as props directly
// import { statsData } from '../data/statsData';

interface StatsOverviewProps {
  availableCoursesCount: number;
  enrolledCoursesCount: number;
  averageCourseDurationOverall: string; // ADDED: Prop for dynamic overall average duration
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  availableCoursesCount, 
  enrolledCoursesCount,
  averageCourseDurationOverall // Destructure the new prop
}) => {
  // Define statsData internally using the passed props
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
      label: 'Avg. Duration', 
      value: averageCourseDurationOverall // DYNAMIC: Use the passed prop
    }
  ];
  
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