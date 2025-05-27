import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusFilterProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  showStatusFilter: boolean;
  setShowStatusFilter: (show: boolean) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  filterStatus,
  setFilterStatus,
  showStatusFilter,
  setShowStatusFilter
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowStatusFilter(!showStatusFilter)}
        className={`px-4 py-2 border ${filterStatus !== 'all' ? 'border-[#BF4BF6]' : 'border-gray-300'} 
                rounded-lg focus:outline-none w-full focus:ring-1 focus:ring-[#BF4BF6] 
                font-['Nunito_Sans'] flex justify-between items-center bg-white`}
        aria-expanded={showStatusFilter}
        aria-haspopup="listbox"
      >
        <span className={`${filterStatus !== 'all' ? 'text-[#BF4BF6] font-medium' : 'text-gray-700'}`}>
          {filterStatus === 'all' 
            ? 'All Status' 
            : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
        </span>
        <ChevronDown size={16} className={`${filterStatus !== 'all' ? 'text-[#BF4BF6]' : 'text-gray-500'}`} />
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
                  setFilterStatus('all');
                  setShowStatusFilter(false);
                }} 
                className={`px-3 py-2 cursor-pointer ${filterStatus === 'all' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
              >
                All Status
              </div>
              <div 
                onClick={() => {
                  setFilterStatus('active');
                  setShowStatusFilter(false);
                }} 
                className={`px-3 py-2 cursor-pointer flex items-center ${filterStatus === 'active' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Active
              </div>
              <div 
                onClick={() => {
                  setFilterStatus('inactive');
                  setShowStatusFilter(false);
                }} 
                className={`px-3 py-2 cursor-pointer flex items-center ${filterStatus === 'inactive' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                Inactive
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilter;