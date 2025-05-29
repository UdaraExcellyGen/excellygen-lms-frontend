// src/features/Learner/CourseCategories/components/PathCard.tsx
import React from 'react';
import { ArrowRight, BookOpen, Users, Clock } from 'lucide-react';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathCardProps {
  path: PathCardType;
  onExplore: (categoryId: string) => void;
}

const PathCard: React.FC<PathCardProps> = ({ path, onExplore }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col">
      {/* Card Header */}
      <div className="relative h-48 overflow-hidden bg-[#34137C] flex items-center justify-center">
        <div className="text-[#D68BF9] transform scale-150">
          {path.icon}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-xl mb-3 line-clamp-2">{path.title}</h3>
        
        <div className="text-gray-600 text-sm line-clamp-3 mb-4">
          {path.description}
        </div>
        
        <div className="mt-auto space-y-3">
          {/* Category Info */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
              {path.totalCourses} Courses
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
              {path.activeUsers.toLocaleString()} Learners
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
              {path.avgDuration}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={() => onExplore(path.id)}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2.5 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm w-full justify-center"
            >
              <span>Explore Path</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathCard;