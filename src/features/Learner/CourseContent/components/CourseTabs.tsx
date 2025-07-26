// src/features/Learner/CourseContent/components/CourseTabs.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CourseTabsProps {
  activeTab: 'courses' | 'learning';
  setActiveTab: (tab: 'courses' | 'learning') => void;
  learningFilter: 'all' | 'completed' | 'ongoing';
  setLearningFilter: (filter: 'all' | 'completed' | 'ongoing') => void;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  learningFilter, 
  setLearningFilter 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4">
      {/* Tab Buttons */}
      <div className="flex gap-4">
        <button
          className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-0.5 font-nunito ${
            activeTab === 'courses'
              ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white shadow-lg hover:shadow-xl'
              : 'bg-[#F6E6FF]/70 text-[#52007C] hover:bg-[#F6E6FF] hover:shadow-md border border-[#BF4BF6]/20'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          Available Courses
        </button>
        <button
          className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-0.5 font-nunito ${
            activeTab === 'learning'
              ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white shadow-lg hover:shadow-xl'
              : 'bg-[#F6E6FF]/70 text-[#52007C] hover:bg-[#F6E6FF] hover:shadow-md border border-[#BF4BF6]/20'
          }`}
          onClick={() => setActiveTab('learning')}
        >
          My Learning
        </button>
      </div>
      
      {/* Filter Dropdown - Only show when My Learning tab is active */}
      {activeTab === 'learning' && (
        <div className="relative">
          <select
            value={learningFilter}
            onChange={(e) => setLearningFilter(e.target.value as 'all' | 'completed' | 'ongoing')}
            className="appearance-none bg-[#F6E6FF]/70 border border-[#BF4BF6]/20 rounded-xl px-4 py-3 pr-10 text-[#52007C] font-nunito font-semibold hover:bg-[#F6E6FF] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent transition-all duration-300"
          >
            <option value="all">All Courses</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52007C] pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default CourseTabs;