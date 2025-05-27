import React from 'react';
import { TechCard } from './TechCard';
import { Technology, TechFilters } from '../types/technology.types';

interface TechGridProps {
  technologies: Technology[];
  filters: TechFilters;
  isTechLoading: (id: string) => boolean;
  onEdit: (tech: Technology) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onResetFilters: () => void;
}

export const TechGrid: React.FC<TechGridProps> = ({
  technologies,
  filters,
  isTechLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetFilters
}) => {
  const { searchTerm, filterStatus } = filters;
  const hasFilters = searchTerm || filterStatus !== 'all';

  if (technologies.length === 0) {
    return (
      <div className="col-span-3 text-center py-12 text-white">
        {hasFilters ? (
          <p>No technologies found matching your filters. Try adjusting your search criteria.</p>
        ) : (
          <p>No technologies available. Click "Add New Technology" to create one.</p>
        )}
        {hasFilters && (
          <button 
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-[#F6E6FF] text-[#BF4BF6] rounded-full font-['Nunito_Sans'] 
                   hover:bg-[#BF4BF6] hover:text-white transition-all duration-300"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {technologies.map((tech) => (
        <TechCard
          key={tech.id}
          technology={tech}
          isTechLoading={isTechLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};