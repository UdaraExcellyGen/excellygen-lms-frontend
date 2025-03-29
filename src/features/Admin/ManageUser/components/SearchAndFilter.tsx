import React from 'react';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="coordinator">Coordinator</option>
          <option value="learner">Learner</option>
          <option value="project_manager">Project Manager</option>
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilter;