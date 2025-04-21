import React from 'react';
import { Search, X } from 'lucide-react';
import { StatusFilterDropdown } from './StatusFilterDropdown';
import { FilterStatus, TechFilters as TechFiltersType } from '../types/technology.types';

interface TechFiltersProps {
  filters: TechFiltersType;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onResetFilters: () => void;
}

// Fixed the duplicate declaration by renaming the component
export const TechFilters: React.FC<TechFiltersProps> = ({
  filters,
  onSearchChange,
  onStatusChange,
  onResetFilters
}) => {
  const { searchTerm, filterStatus } = filters;
  const hasActiveFilters = searchTerm || filterStatus !== 'all';

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
            aria-label="Search technologies"
          />
        </div>
        
        {/* Status Filter Dropdown */}
        <StatusFilterDropdown 
          filterStatus={filterStatus}
          onStatusChange={onStatusChange}
        />
      </div>
      
      {/* Active filter indicators */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Search: "{searchTerm}"
              <X 
                size={14} 
                className="ml-1 cursor-pointer" 
                onClick={() => onSearchChange('')} 
                aria-label="Clear search term"
              />
            </span>
          )}
          
          {filterStatus !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              <X 
                size={14} 
                className="ml-1 cursor-pointer" 
                onClick={() => onStatusChange('all')} 
                aria-label="Clear status filter"
              />
            </span>
          )}
          
          <button 
            onClick={onResetFilters}
            className="text-sm text-[#BF4BF6] hover:underline ml-2"
            aria-label="Reset all filters"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
};