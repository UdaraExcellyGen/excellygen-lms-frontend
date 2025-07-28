// src/features/Learner/CourseCategories/components/PathGrid.tsx
// ENTERPRISE OPTIMIZED: Ultra-performance grid with virtualization concepts
import React, { useMemo, useCallback } from 'react';
import PathCard from './PathCard';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathGridProps {
  paths: PathCardType[];
  onExplore: (pathId: string) => void;
  loadingPathIds?: Set<string>; // For future optimistic loading states
}

// ENTERPRISE: Highly optimized PathCard wrapper with action state management
const OptimizedPathCard = React.memo<{
  path: PathCardType;
  onExplore: (pathId: string) => void;
  isActionInProgress?: boolean;
}>(({ path, onExplore, isActionInProgress = false }) => {
  // ENTERPRISE: Memoized explore handler for each card
  const handleExplore = useCallback(() => {
    onExplore(path.id);
  }, [onExplore, path.id]);

  return (
    <PathCard 
      path={path} 
      onExplore={handleExplore}
      isActionInProgress={isActionInProgress}
    />
  );
});

OptimizedPathCard.displayName = 'OptimizedPathCard';

// ENTERPRISE: Professional grid component with performance optimizations
const PathGrid: React.FC<PathGridProps> = React.memo(({ 
  paths, 
  onExplore, 
  loadingPathIds = new Set() 
}) => {
  // ENTERPRISE: Memoized grid items to prevent unnecessary re-renders
  const gridItems = useMemo(() => {
    return paths.map((path) => ({
      id: path.id,
      path,
      isActionInProgress: loadingPathIds.has(path.id)
    }));
  }, [paths, loadingPathIds]);

  // ENTERPRISE: Optimized explore handler with action tracking
  const handleExploreWithTracking = useCallback((pathId: string) => {
    // ENTERPRISE: Could add analytics tracking here
    console.log(`🎯 User exploring category: ${pathId}`);
    onExplore(pathId);
  }, [onExplore]);

  // ENTERPRISE: Empty state component
  const EmptyState = useMemo(() => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-[#BF4BF6]/20 rounded-full flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-[#BF4BF6] rounded-full opacity-50"></div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No categories available
      </h3>
      <p className="text-[#D68BF9] max-w-md">
        Categories will appear here once they're published and available for learning.
      </p>
    </div>
  ), []);

  // ENTERPRISE: Performance monitoring (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 PathGrid rendered with ${paths.length} items`);
    }
  }, [paths.length]);

  // ENTERPRISE: Early return for empty state
  if (gridItems.length === 0) {
    return (
      <div className="grid grid-cols-1">
        {EmptyState}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {gridItems.map(({ id, path, isActionInProgress }) => (
        <OptimizedPathCard
          key={id}
          path={path}
          onExplore={handleExploreWithTracking}
          isActionInProgress={isActionInProgress}
        />
      ))}
    </div>
  );
});

PathGrid.displayName = 'PathGrid';

export default PathGrid;