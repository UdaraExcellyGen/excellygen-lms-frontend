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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 my-6 md:my-10">
      <div className="flex items-center p-4 md:p-6 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 rounded-xl md:rounded-2xl backdrop-blur-lg shadow-xl border border-purple-500/20 transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-400/30 hover:translate-y-[-2px]">
        <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 p-3 md:p-4 rounded-lg md:rounded-xl mr-4 md:mr-6 shadow-lg">
          <BookOpen size={20} className="text-white md:w-7 md:h-7" />
        </div>
        <div>
          <h3 className="text-purple-200 text-xs md:text-sm font-medium uppercase tracking-wider mb-0.5 md:mb-1">TOTAL COURSES</h3>
          <div className="flex items-baseline">
            <p className="text-white text-2xl md:text-4xl font-bold">{totalCoursesOverall}</p>
            <span className="text-purple-300 text-xl md:text-2xl font-bold ml-1">+</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center p-4 md:p-6 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 rounded-xl md:rounded-2xl backdrop-blur-lg shadow-xl border border-purple-500/20 transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-400/30 hover:translate-y-[-2px]">
        <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 p-3 md:p-4 rounded-lg md:rounded-xl mr-4 md:mr-6 shadow-lg">
          <Users size={20} className="text-white md:w-7 md:h-7" />
        </div>
        <div>
          <h3 className="text-purple-200 text-xs md:text-sm font-medium uppercase tracking-wider mb-0.5 md:mb-1">ACTIVE LEARNERS</h3>
          <div className="flex items-baseline">
            <p className="text-white text-2xl md:text-4xl font-bold">{totalActiveLearnersOverall}</p>
            <span className="text-purple-300 text-xl md:text-2xl font-bold ml-1">+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;