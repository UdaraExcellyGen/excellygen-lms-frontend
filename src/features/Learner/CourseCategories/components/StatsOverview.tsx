// src/features/Learner/CourseCategories/components/StatsOverview.tsx
import React from 'react';
import { BookOpen, Users } from 'lucide-react';

interface StatsOverviewProps {
  totalCoursesOverall: number;
  totalActiveLearnersOverall: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  totalCoursesOverall, 
  totalActiveLearnersOverall 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-white/85 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1">Total Courses</h3>
            <div className="flex items-baseline">
              <p className="text-[#1B0A3F] text-3xl font-bold">{totalCoursesOverall}</p>
              <span className="text-[#BF4BF6] text-xl font-bold ml-1">+</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/85 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1">Active Learners</h3>
            <div className="flex items-baseline">
              <p className="text-[#1B0A3F] text-3xl font-bold">{totalActiveLearnersOverall.toLocaleString()}</p>
              <span className="text-[#BF4BF6] text-xl font-bold ml-1">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;