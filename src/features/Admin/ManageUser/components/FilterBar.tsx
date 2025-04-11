import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
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
  isFetchingFilteredData: boolean;
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
  isFetchingFilteredData
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={filterState.searchTerm}
            onChange={(e) => setFilterState({...filterState, searchTerm: e.target.value})}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <button
            onClick={() => setShowRoleFilter(!showRoleFilter)}
            className={`px-4 py-2 border ${filterState.selectedRoles.length > 0 ? 'border-[#BF4BF6]' : 'border-gray-300'} 
                   rounded-lg focus:outline-none w-full focus:ring-1 focus:ring-[#BF4BF6] 
                   font-['Nunito_Sans'] flex justify-between items-center bg-white`}
            aria-expanded={showRoleFilter}
            aria-haspopup="listbox"
          >
            <span className={`${filterState.selectedRoles.length > 0 ? 'text-[#BF4BF6] font-medium' : 'text-gray-700'}`}>
              {filterState.selectedRoles.length === 0 ? 'All Roles' : `${filterState.selectedRoles.length} selected`}
            </span>
            <ChevronDown size={16} className={`${filterState.selectedRoles.length > 0 ? 'text-[#BF4BF6]' : 'text-gray-500'}`} />
          </button>
          
          {showRoleFilter && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Role Filter</span>
                  <button 
                    onClick={() => setFilterState({...filterState, selectedRoles: []})} 
                    className="text-xs text-[#BF4BF6] font-medium"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="max-h-56 overflow-y-auto py-1">
                  {['admin', 'coordinator', 'learner', 'project_manager'].map((role) => (
                    <div key={role} className="relative flex items-start px-3 py-2">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id={`filter-role-${role}`}
                          checked={filterState.selectedRoles.includes(role)}
                          onChange={(e) => handleRoleChange(role, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={`filter-role-${role}`}
                          className="text-gray-900 font-['Nunito_Sans']"
                        >
                          {formatRoleName(role)}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusFilter(!showStatusFilter)}
            className={`px-4 py-2 border ${filterState.filterStatus !== 'all' ? 'border-[#BF4BF6]' : 'border-gray-300'} 
                   rounded-lg focus:outline-none w-full focus:ring-1 focus:ring-[#BF4BF6] 
                   font-['Nunito_Sans'] flex justify-between items-center bg-white`}
            aria-expanded={showStatusFilter}
            aria-haspopup="listbox"
          >
            <span className={`${filterState.filterStatus !== 'all' ? 'text-[#BF4BF6] font-medium' : 'text-gray-700'}`}>
              {filterState.filterStatus === 'all' 
                ? 'All Status' 
                : filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}
            </span>
            <ChevronDown size={16} className={`${filterState.filterStatus !== 'all' ? 'text-[#BF4BF6]' : 'text-gray-500'}`} />
          </button>
          
          {showStatusFilter && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-200">
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Status Filter</span>
                </div>
                
                <div className="py-1">
                  <div 
                    onClick={() => {
                      setFilterState({...filterState, filterStatus: 'all'});
                      setShowStatusFilter(false);
                    }} 
                    className={`px-3 py-2 cursor-pointer ${filterState.filterStatus === 'all' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
                  >
                    All Status
                  </div>
                  <div 
                    onClick={() => {
                      setFilterState({...filterState, filterStatus: 'active'});
                      setShowStatusFilter(false);
                    }} 
                    className={`px-3 py-2 cursor-pointer flex items-center ${filterState.filterStatus === 'active' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Active
                  </div>
                  <div 
                    onClick={() => {
                      setFilterState({...filterState, filterStatus: 'inactive'});
                      setShowStatusFilter(false);
                    }} 
                    className={`px-3 py-2 cursor-pointer flex items-center ${filterState.filterStatus === 'inactive' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                    Inactive
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Active filter tags */}
      {(debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') && (
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {debouncedSearchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Search: "{debouncedSearchTerm}"
              <X size={14} className="ml-1 cursor-pointer" onClick={() => setFilterState({...filterState, searchTerm: ''})} />
            </span>
          )}
          
          {filterState.selectedRoles.map(role => (
            <span key={role} className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getRoleColor(role)}`}>
              {formatRoleName(role)}
              <X 
                size={14} 
                className="ml-1 cursor-pointer" 
                onClick={() => handleRoleChange(role, false)} 
              />
            </span>
          ))}
          
          {filterState.filterStatus !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Status: {filterState.filterStatus.charAt(0).toUpperCase() + filterState.filterStatus.slice(1)}
              <X 
                size={14} 
                className="ml-1 cursor-pointer" 
                onClick={() => setFilterState({...filterState, filterStatus: 'all'})} 
              />
            </span>
          )}
          
          <button 
            onClick={resetFilters}
            className="text-sm text-[#BF4BF6] hover:underline ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isFetchingFilteredData && (
        <div className="flex justify-center items-center py-2 mt-4">
          <div className="flex items-center text-gray-500 text-sm">
            <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-gray-500 rounded-full"></div>
            Updating results...
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;