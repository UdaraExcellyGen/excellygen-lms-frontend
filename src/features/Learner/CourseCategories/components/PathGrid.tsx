// components/PathGrid.tsx - Optimized version
import React from 'react';
import PathCard from './PathCard';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathGridProps {
  paths: PathCardType[];
  onExplore: (pathId: string) => void;
}

// 🚀 OPTIMIZATION: Memoized PathCard component
const MemoizedPathCard = React.memo<{
  path: PathCardType;
  onExplore: (pathId: string) => void;
}>(({ path, onExplore }) => (
  <PathCard 
    path={path} 
    onExplore={onExplore}
  />
));

MemoizedPathCard.displayName = 'MemoizedPathCard';

const PathGrid: React.FC<PathGridProps> = ({ paths, onExplore }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {paths.map((path) => (
        <MemoizedPathCard
          key={path.id}
          path={path}
          onExplore={onExplore}
        />
      ))}
    </div>
  );
};

// 🚀 OPTIMIZATION: Memoize the entire PathGrid component
export default React.memo(PathGrid);