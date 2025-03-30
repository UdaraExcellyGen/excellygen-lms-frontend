import React from 'react';
import { BookOpen, Users, Clock } from 'lucide-react';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathCardProps {
  path: PathCardType;
  onExplore: (pathTitle: string) => void;
}

const PathCard: React.FC<PathCardProps> = ({ path, onExplore }) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 relative min-h-[400px] transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-[#1B0A3F] rounded-xl">
          {path.icon}
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
        <div className="flex items-center gap-2 text-gray-300">
          <BookOpen className="h-4 w-4" />
          <span>{path.totalCourses} Courses</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="h-4 w-4" />
          <span>{path.activeUsers.toLocaleString()} Active Learners</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="h-4 w-4" />
          <span>{path.avgDuration}</span>
        </div>
      </div>

      <button
        onClick={() => onExplore(path.title)}
        className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg disabled:opacity-50"
      >
        Explore Path
      </button>
    </div>
  );
};

export default PathCard;