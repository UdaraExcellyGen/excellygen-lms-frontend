import React from 'react';
import PathCard from './PathCard';
import { PathCard as PathCardType } from '../types/PathCard';

interface PathGridProps {
  paths: PathCardType[];
  onExplore: (pathTitle: string) => void;
}

const PathGrid: React.FC<PathGridProps> = ({ paths, onExplore }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paths.map((path, index) => (
        <PathCard
          key={index}
          path={path}
          onExplore={onExplore}
        />
      ))}
    </div>
  );
};

export default PathGrid;