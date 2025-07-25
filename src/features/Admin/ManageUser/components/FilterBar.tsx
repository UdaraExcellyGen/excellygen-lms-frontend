import React from 'react';
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

const FilterBar: React.FC<FilterBarProps> = ({
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
  const availableRoles = [
    { value: 'Admin', display: 'Admin' },
    { value: 'Learner', display: 'Learner' },
    { value: 'CourseCoordinator', display: 'Course Coordinator' },
    { value: 'ProjectManager', display: 'Project Manager' }
  ];

  if (isSuperAdmin) {
    availableRoles.push({ value: 'SuperAdmin', display: 'Super Admin' });
  }

  const isRoleSelected = (role: string) => {
    return filterState.selectedRoles.some(selectedRole => 
      selectedRole.toLowerCase() === role.toLowerCase()
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* --- CHANGE IS HERE --- */}
      {/* Grid layout changed to 5 columns. Search bar takes 3, filters take 1 each. */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Search bar now spans 3 columns for extra width */}
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={filterState.searchTerm}
            onChange={(e) => setFilterState({...filterState, searchTerm: e.target.value})}
            className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative md:col-span-1">
          <button
            onClick={() => {
              setShowRoleFilter(!showRoleFilter);
              if (showStatusFilter) setShowStatusFilter(false);
            }}
            className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] flex justify-between items-center text-left"
            aria-expanded={showRoleFilter}
            aria-haspopup="listbox"
          >
            <span className={filterState.selectedRoles.length > 0 ? 'font-semibold text-[#BF4BF6]' : 'text-[#52007C]'}>
              {filterState.selectedRoles.length === 0 ? 'All Roles' : `${filterState.selectedRoles.length} selected`}
            </span>
            <svg className="fill-current h-4 w-4 text-[#BF4BF6] transition-transform" style={{ transform: showRoleFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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
                    onClick={() => {
                        setFilterState({...filterState, selectedRoles: []});
                        setShowRoleFilter(false);
                    }} 
                    className="text-xs text-[#BF4BF6] font-medium hover:underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="max-h-56 overflow-y-auto py-1">
                  {availableRoles.map((role) => (
                    <label key={role.value} htmlFor={`filter-role-${role.value}`} className="flex items-start px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id={`filter-role-${role.value}`}
                          checked={isRoleSelected(role.value)}
                          onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
                        />
                      </div>
                      <div className="ml-3 text-sm text-gray-900">
                          {role.display}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative md:col-span-1">
          <button
            onClick={() => {
              setShowStatusFilter(!showStatusFilter);
              if (showRoleFilter) setShowRoleFilter(false);
            }}
            className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] flex justify-between items-center"
            aria-expanded={showStatusFilter}
            aria-haspopup="listbox"
          >
            <span className={filterState.filterStatus !== 'all' ? 'font-semibold text-[#BF4BF6]' : 'text-[#52007C]'}>
              {filterState.filterStatus === 'all' 
                ? 'All Statuses' 
                : `Status: ${filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}`}
            </span>
             <svg className="fill-current h-4 w-4 text-[#BF4BF6] transition-transform" style={{ transform: showStatusFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </button>
          
          {showStatusFilter && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="py-1">
                <div 
                  onClick={() => { setFilterState({...filterState, filterStatus: 'all'}); setShowStatusFilter(false); }} 
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${filterState.filterStatus === 'all' ? 'font-semibold text-[#BF4BF6]' : 'text-gray-900'}`}
                >
                  All Statuses
                </div>
                <div 
                  onClick={() => { setFilterState({...filterState, filterStatus: 'active'}); setShowStatusFilter(false); }} 
                  className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-100 ${filterState.filterStatus === 'active' ? 'font-semibold text-[#BF4BF6]' : 'text-gray-900'}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Active
                </div>
                <div 
                  onClick={() => { setFilterState({...filterState, filterStatus: 'inactive'}); setShowStatusFilter(false); }} 
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
      
      {/* Active filter tags */}
      {(debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') && (
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {debouncedSearchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F6E6FF] text-[#52007C]">
              Search: "{debouncedSearchTerm}"
              <X size={14} className="ml-1.5 cursor-pointer hover:text-red-500" onClick={() => setFilterState({...filterState, searchTerm: ''})} />
            </span>
          )}
          
          {filterState.selectedRoles.map(role => (
            <span key={role} className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getRoleColor(role)}`}>
              {formatRoleName(role)}
              <X 
                size={14} 
                className="ml-1.5 cursor-pointer hover:text-red-500"
                onClick={() => handleRoleChange(role, false)} 
              />
            </span>
          ))}
          
          {filterState.filterStatus !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F6E6FF] text-[#52007C]">
              Status: {filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}
              <X 
                size={14} 
                className="ml-1.5 cursor-pointer hover:text-red-500"
                onClick={() => setFilterState({...filterState, filterStatus: 'all'})} 
              />
            </span>
          )}
          
          <button 
            onClick={resetFilters}
            className="text-sm text-[#BF4BF6] hover:underline ml-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;