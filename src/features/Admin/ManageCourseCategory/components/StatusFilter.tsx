// src/features/Admin/ManageCourseCategory/components/StatusFilter.tsx
// ENTERPRISE OPTIMIZED: Professional status filtering with instant responsiveness
import React, { useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Check, Filter } from 'lucide-react';

interface StatusFilterProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  showStatusFilter: boolean;
  setShowStatusFilter: (show: boolean) => void;
  disabled?: boolean;
}

// ENTERPRISE: Professional status options with visual indicators
const statusOptions = [
  { 
    value: 'all', 
    label: 'All Categories', 
    icon: null, 
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    description: 'Show all categories'
  },
  { 
    value: 'active', 
    label: 'Active', 
    icon: '●', 
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    description: 'Currently available categories'
  },
  { 
    value: 'inactive', 
    label: 'Inactive', 
    icon: '●', 
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    description: 'Temporarily disabled categories'
  },
  { 
    value: 'deleted', 
    label: 'Deleted', 
    icon: '●', 
    color: 'text-red-600',
    bg: 'bg-red-50',
    description: 'Categories in trash (30 days)'
  }
];

// ENTERPRISE: Professional status filter with smart interactions
const StatusFilter: React.FC<StatusFilterProps> = ({
  filterStatus,
  setFilterStatus,
  showStatusFilter,
  setShowStatusFilter,
  disabled = false
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ENTERPRISE: Smart click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowStatusFilter(false);
    }
  }, [setShowStatusFilter]);

  useEffect(() => {
    if (showStatusFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStatusFilter, handleClickOutside]);

  // ENTERPRISE: Keyboard navigation support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowStatusFilter(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowStatusFilter(!showStatusFilter);
    }
  }, [showStatusFilter, setShowStatusFilter]);

  const handleStatusSelect = useCallback((status: string) => {
    setFilterStatus(status);
    setShowStatusFilter(false);
  }, [setFilterStatus, setShowStatusFilter]);

  const currentStatus = statusOptions.find(option => option.value === filterStatus);
  const isFiltered = filterStatus !== 'all';

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Status
      </label>
      
      {/* ENTERPRISE: Professional trigger button with status indicator */}
      <button
        onClick={() => setShowStatusFilter(!showStatusFilter)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] 
          font-medium flex justify-between items-center transition-all duration-200 text-left
          ${disabled 
            ? 'bg-gray-50 cursor-not-allowed opacity-50' 
            : 'bg-white hover:border-[#BF4BF6]/50 cursor-pointer'
          }
          ${isFiltered 
            ? 'border-[#BF4BF6] text-[#BF4BF6] shadow-sm' 
            : 'border-gray-300 text-gray-700'
          }
        `}
        aria-expanded={showStatusFilter}
        aria-haspopup="listbox"
        role="combobox"
      >
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {currentStatus?.icon && (
              <span className={`text-sm ${currentStatus.color}`}>
                {currentStatus.icon}
              </span>
            )}
            <Filter className={`h-4 w-4 ${isFiltered ? 'text-[#BF4BF6]' : 'text-gray-400'}`} />
          </div>
          
          {/* Status label */}
          <div className="flex-1">
            <span className="block">
              {currentStatus?.label || 'Select Status'}
            </span>
            {isFiltered && (
              <span className="text-xs text-gray-500 block">
                {currentStatus?.description}
              </span>
            )}
          </div>
        </div>
        
        {/* Chevron */}
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            showStatusFilter ? 'rotate-180' : ''
          } ${isFiltered ? 'text-[#BF4BF6]' : 'text-gray-400'}`}
        />
      </button>
      
      {/* ENTERPRISE: Professional dropdown with enhanced options */}
      {showStatusFilter && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter Options</span>
            </div>
          </div>
          
          {/* Options */}
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-150
                  ${filterStatus === option.value 
                    ? `${option.bg} ${option.color} border-l-4 border-current` 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
                role="option"
                aria-selected={filterStatus === option.value}
              >
                <div className="flex items-center gap-3">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className={`text-sm ${option.color}`}>
                        {option.icon}
                      </span>
                    )}
                  </div>
                  
                  {/* Option details */}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {filterStatus === option.value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Select a status to filter categories
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilter;