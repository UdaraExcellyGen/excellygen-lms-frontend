import React from 'react';

interface CourseTabsProps {
  activeTab: 'courses' | 'learning';
  setActiveTab: (tab: 'courses' | 'learning') => void;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center gap-4">
      <button
        className={`px-8 py-3 rounded-lg font-nunito text-lg transition-all duration-300
          ${activeTab === 'courses'
            ? 'bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white shadow-lg'
            : 'bg-[#F6E6FF]/50 text-[#52007C] hover:bg-[#F6E6FF]'}`}
        onClick={() => setActiveTab('courses')}
      >
        Available Courses
      </button>
      <button
        className={`px-8 py-3 rounded-lg font-nunito text-lg transition-all duration-300
          ${activeTab === 'learning'
            ? 'bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white shadow-lg'
            : 'bg-[#F6E6FF]/50 text-[#52007C] hover:bg-[#F6E6FF]'}`}
        onClick={() => setActiveTab('learning')}
      >
        My Learning
      </button>
    </div>
  );
};

export default CourseTabs;