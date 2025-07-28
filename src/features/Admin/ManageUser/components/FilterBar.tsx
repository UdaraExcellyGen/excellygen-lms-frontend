// src/features/Admin/ManageUsers/components/FilterBar.tsx
// ENTERPRISE OPTIMIZED: Performance optimizations, same functionality
import React, { useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filterState: FilterState;
  debouncedSearchTerm: string;
  showRoleFilter: boolean;
  showStatusFilter: boolean;
  setShowRoleFilter: (value: boolean) => void;
  setShowStatusFilter: (value: boolean) => void;
  setFilterState: (value: React.SetStateAction<FilterState>) => void;
  handleRoleChange: (role: string, isChecked: boolean) => void;
  resetFilters: () => void;
  formatRoleName: (role: string) => string;
  getRoleColor: (role: string) => string;
  isSuperAdmin?: boolean;
}

// ENTERPRISE: Memoized role option component for performance
const RoleOption: React.FC<{
  role: { value: string; display: string };
  isSelected: boolean;
  onRoleChange: (role: string, isChecked: boolean) => void;
}> = React.memo(({ role, isSelected, onRoleChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onRoleChange(role.value, e.target.checked);
  }, [role.value, onRoleChange]);

  return (
    <label 
      htmlFor={`filter-role-${role.value}`} 
      className="flex items-start px-3 py-2 cursor-pointer hover:bg-gray-50"
    >
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={`filter-role-${role.value}`}
          checked={isSelected}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
        />
      </div>
      <div className="ml-3 text-sm text-gray-900">
        {role.display}
      </div>
    </label>
  );
});

RoleOption.displayName = 'RoleOption';

// ENTERPRISE: Memoized filter tag component
const FilterTag: React.FC<{
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}> = React.memo(({ label, value, onRemove, className = '' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${className}`}>
    {label}: {value}
    <X 
      size={14} 
      className="ml-1.5 cursor-pointer hover:text-red-500 transition-colors"
      onClick={onRemove} 
    />
  </span>
));

FilterTag.displayName = 'FilterTag';

const FilterBar: React.FC<FilterBarProps> = React.memo(({
  filterState,
  debouncedSearchTerm,
  showRoleFilter,
  showStatusFilter,
  setShowRoleFilter,
  setShowStatusFilter,
  setFilterState,
  handleRoleChange,
  resetFilters,
  formatRoleName,
  getRoleColor,
  isSuperAdmin = false
}) => {
  // ENTERPRISE: Memoized available roles
  const availableRoles = useMemo(() => {
    const baseRoles = [
      { value: 'Admin', display: 'Admin' },
      { value: 'Learner', display: 'Learner' },
      { value: 'CourseCoordinator', display: 'Course Coordinator' },
      { value: 'ProjectManager', display: 'Project Manager' }
    ];

    if (isSuperAdmin) {
      baseRoles.push({ value: 'SuperAdmin', display: 'Super Admin' });
    }

    return baseRoles;
  }, [isSuperAdmin]);

  // ENTERPRISE: Memoized role selection check
  const isRoleSelected = useCallback((role: string) => {
    return filterState.selectedRoles.some(selectedRole => 
      selectedRole.toLowerCase() === role.toLowerCase()
    );
  }, [filterState.selectedRoles]);

  // ENTERPRISE: Optimized event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState(prev => ({ ...prev, searchTerm: e.target.value }));
  }, [setFilterState]);

  const handleRoleFilterToggle = useCallback(() => {
    setShowRoleFilter(!showRoleFilter);
    if (showStatusFilter) setShowStatusFilter(false);
  }, [showRoleFilter, showStatusFilter, setShowRoleFilter, setShowStatusFilter]);

  const handleStatusFilterToggle = useCallback(() => {
    setShowStatusFilter(!showStatusFilter);
    if (showRoleFilter) setShowRoleFilter(false);
  }, [showStatusFilter, showRoleFilter, setShowStatusFilter, setShowRoleFilter]);

  const handleRoleReset = useCallback(() => {
    setFilterState(prev => ({ ...prev, selectedRoles: [] }));
    setShowRoleFilter(false);
  }, [setFilterState, setShowRoleFilter]);

  const handleStatusSelect = useCallback((status: string) => {
    setFilterState(prev => ({ ...prev, filterStatus: status }));
    setShowStatusFilter(false);
  }, [setFilterState, setShowStatusFilter]);

  // ENTERPRISE: Memoized filter tag removal handlers
  const handleRemoveSearchTerm = useCallback(() => {
    setFilterState(prev => ({ ...prev, searchTerm: '' }));
  }, [setFilterState]);

  const handleRemoveRole = useCallback((role: string) => {
    handleRoleChange(role, false);
  }, [handleRoleChange]);

  const handleRemoveStatus = useCallback(() => {
    setFilterState(prev => ({ ...prev, filterStatus: 'all' }));
  }, [setFilterState]);

  // ENTERPRISE: Memoized active filters check
  const hasActiveFilters = useMemo(() => 
    debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all',
    [debouncedSearchTerm, filterState.selectedRoles.length, filterState.filterStatus]
  );

  // ENTERPRISE: Memoized role filter label
  const roleFilterLabel = useMemo(() => {
    if (filterState.selectedRoles.length === 0) return 'All Roles';
    return `${filterState.selectedRoles.length} selected`;
  }, [filterState.selectedRoles.length]);

  // ENTERPRISE: Memoized status filter label
  const statusFilterLabel = useMemo(() => {
    if (filterState.filterStatus === 'all') return 'All Statuses';
    return `Status: ${filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}`;
  }, [filterState.filterStatus]);

  return (
    <div className="w-full space-y-4">
      {/* Filter Controls */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Search bar - spans 3 columns */}
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={filterState.searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative md:col-span-1">
          <button
            onClick={handleRoleFilterToggle}
            className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] flex justify-between items-center text-left"
            aria-expanded={showRoleFilter}
            aria-haspopup="listbox"
          >
            <span className={filterState.selectedRoles.length > 0 ? 'font-semibold text-[#BF4BF6]' : 'text-[#52007C]'}>
              {roleFilterLabel}
            </span>
            <svg 
              className="fill-current h-4 w-4 text-[#BF4BF6] transition-transform" 
              style={{ transform: showRoleFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </button>
          
          {showRoleFilter && (
            <div 
              className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Filter by Role</span>
                  <button 
                    onClick={handleRoleReset} 
                    className="text-xs text-[#BF4BF6] font-medium hover:underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="max-h-56 overflow-y-auto py-1">
                  {availableRoles.map((role) => (
                    <RoleOption
                      key={role.value}
                      role={role}
                      isSelected={isRoleSelected(role.value)}
                      onRoleChange={handleRoleChange}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative md:col-span-1">
          <button
            onClick={handleStatusFilterToggle}
            className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] flex justify-between items-center"
            aria-expanded={showStatusFilter}
            aria-haspopup="listbox"
          >
            <span className={filterState.filterStatus !== 'all' ? 'font-semibold text-[#BF4BF6]' : 'text-[#52007C]'}>
              {statusFilterLabel}
            </span>
            <svg 
              className="fill-current h-4 w-4 text-[#BF4BF6] transition-transform" 
              style={{ transform: showStatusFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </button>
          
          {showStatusFilter && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="py-1">
                <div 
                  onClick={() => handleStatusSelect('all')} 
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${filterState.filterStatus === 'all' ? 'font-semibold text-[#BF4BF6]' : 'text-gray-900'}`}
                >
                  All Statuses
                </div>
                <div 
                  onClick={() => handleStatusSelect('active')} 
                  className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-100 ${filterState.filterStatus === 'active' ? 'font-semibold text-[#BF4BF6]' : 'text-gray-900'}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Active
                </div>
                <div 
                  onClick={() => handleStatusSelect('inactive')} 
                  className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-100 ${filterState.filterStatus === 'inactive' ? 'font-semibold text-[#BF4BF6]' : 'text-gray-900'}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                  Inactive
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ENTERPRISE: Active filter tags with optimized rendering */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {debouncedSearchTerm && (
            <FilterTag
              label="Search"
              value={`"${debouncedSearchTerm}"`}
              onRemove={handleRemoveSearchTerm}
              className="bg-[#F6E6FF] text-[#52007C]"
            />
          )}
          
          {filterState.selectedRoles.map(role => (
            <FilterTag
              key={role}
              label={formatRoleName(role)}
              value=""
              onRemove={() => handleRemoveRole(role)}
              className={getRoleColor(role)}
            />
          ))}
          
          {filterState.filterStatus !== 'all' && (
            <FilterTag
              label="Status"
              value={filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}
              onRemove={handleRemoveStatus}
              className="bg-[#F6E6FF] text-[#52007C]"
            />
          )}
          
          <button 
            onClick={resetFilters}
            className="text-sm text-[#BF4BF6] hover:underline ml-2 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;