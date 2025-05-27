// src/features/Learner/CourseCategories/components/PathCard.tsx
import React from 'react';
import { ArrowRight, BookOpen, Users, Clock } from 'lucide-react'; 
import { PathCard as PathCardType } from '../types/PathCard';

interface PathCardProps {
  path: PathCardType;
  onExplore: (categoryId: string) => void; // Expects categoryId for navigation
}

const PathCard: React.FC<PathCardProps> = ({ path, onExplore }) => {
  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl p-6 relative min-h-[400px] transition-all duration-300 border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl hover:bg-white/15">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] rounded-xl shadow-md">
          {path.icon} {/* Render the ReactNode icon */}
        </div>
        <div>
          <h3 className="text-xl text-white font-unbounded font-bold">
            {path.title}
          </h3>
        </div>
      </div>

      <p className="text-[#D68BF9] mb-6">
        {path.description}
      </p>

      <div className="space-y-3 mb-16">
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <BookOpen className="h-4 w-4 text-[#BF4BF6]" />
          <span>{path.totalCourses} Courses</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="h-4 w-4 text-[#BF4BF6]" />
          <span>{path.activeUsers.toLocaleString()} Active Learners</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="h-4 w-4 text-[#BF4BF6]" />
          <span>{path.avgDuration}</span>
        </div>
      </div>

      <button
        onClick={() => onExplore(path.id)}
        className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white rounded-lg
                   hover:from-[#A845E8] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>Explore Path</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default PathCard;