// src/features/Learner/CourseCategories/components/PathCard.tsx
// ENTERPRISE OPTIMIZED: Instant responsive interactions, professional UX
import React, { useCallback, useRef } from 'react';
import { ArrowRight, BookOpen, Users, Clock, Loader2 } from 'lucide-react';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathCardProps {
  path: PathCardType;
  onExplore: (categoryId: string) => void;
  isActionInProgress?: boolean; // For future loading states
}

// ENTERPRISE: Optimized card component with instant interactions
const PathCard: React.FC<PathCardProps> = React.memo(({ 
  path, 
  onExplore, 
  isActionInProgress = false 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  // ENTERPRISE: Memoized handlers for optimal performance
  const handleExplore = useCallback(() => {
    if (!isActionInProgress) {
      onExplore(path.id);
    }
  }, [onExplore, path.id, isActionInProgress]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // ENTERPRISE: Keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isActionInProgress) {
      e.preventDefault();
      handleExplore();
    }
  }, [handleExplore, isActionInProgress]);

  return (
    <div 
      ref={cardRef}
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col group cursor-pointer transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleExplore}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Explore ${path.title} category`}
    >
      {/* Card Header with Icon */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#34137C] to-[#52007C] flex items-center justify-center">
        <div className={`text-[#D68BF9] transform transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}>
          {path.icon}
        </div>
        
        {/* ENTERPRISE: Subtle overlay on hover */}
        <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
      
      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-xl mb-3 line-clamp-2 group-hover:text-[#BF4BF6] transition-colors duration-200">
          {path.title}
        </h3>
        
        <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
          {path.description}
        </div>
        
        <div className="mt-auto space-y-4">
          {/* ENTERPRISE: Enhanced category statistics */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-700 group-hover:text-[#BF4BF6] transition-colors">
              <BookOpen className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium">{path.totalCourses}</span>
              <span className="ml-1">Course{path.totalCourses !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-700 group-hover:text-[#BF4BF6] transition-colors">
              <Users className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium">{path.activeUsers.toLocaleString()}</span>
              <span className="ml-1">Learner{path.activeUsers !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-700 group-hover:text-[#BF4BF6] transition-colors">
              <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium">{path.avgDuration}</span>
            </div>
          </div>
          
          {/* ENTERPRISE: Professional action button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExplore();
              }}
              disabled={isActionInProgress}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                transition-all duration-200 transform
                ${isActionInProgress 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white shadow-sm hover:shadow-md active:scale-95'
                }
              `}
              aria-label={`Explore ${path.title} courses`}
            >
              {isActionInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Explore Path</span>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
                    isHovered ? 'translate-x-1' : ''
                  }`} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PathCard.displayName = 'PathCard';

export default PathCard;