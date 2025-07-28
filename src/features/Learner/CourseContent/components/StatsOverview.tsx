// src/features/Learner/CourseContent/components/StatsOverview.tsx
import React from 'react';
import { Award, CheckCircle2, Clock } from 'lucide-react'; 

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1 font-nunito">Available Courses</h3>
            <div className="flex items-baseline">
              <p className="text-[#1B0A3F] text-3xl font-bold font-nunito">{availableCoursesCount}</p>
              <span className="text-[#BF4BF6] text-xl font-bold ml-1">+</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1 font-nunito">Enrolled Courses</h3>
            <div className="flex items-baseline">
              <p className="text-[#1B0A3F] text-3xl font-bold font-nunito">{enrolledCoursesCount}</p>
              <span className="text-[#BF4BF6] text-xl font-bold ml-1">+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1 font-nunito">Total Duration</h3>
            <div className="flex items-baseline">
              <p className="text-[#1B0A3F] text-3xl font-bold font-nunito">{totalCategoryDuration.replace('h', '')}</p>
              <span className="text-[#52007C] text-lg font-bold ml-1">h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;