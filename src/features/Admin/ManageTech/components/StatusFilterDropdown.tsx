import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterStatus } from '../types/technology.types';

interface StatusFilterDropdownProps {
  filterStatus: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
}

export const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  filterStatus,
  onStatusChange
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleStatusChange = (status: FilterStatus) => {
    onStatusChange(status);
    setShowDropdown(false);
  };

  const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const displayText = filterStatus === 'all' 
    ? 'All Status' 
    : capitalizeFirstLetter(filterStatus);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`px-4 py-2 border ${filterStatus !== 'all' ? 'border-[#BF4BF6]' : 'border-gray-300'} 
               rounded-lg focus:outline-none w-full md:w-40 focus:ring-1 focus:ring-[#BF4BF6] 
               font-['Nunito_Sans'] flex justify-between items-center bg-white`}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
        <span className={`${filterStatus !== 'all' ? 'text-[#BF4BF6] font-medium' : 'text-gray-700'}`}>
          {displayText}
        </span>
        <ChevronDown size={16} className={`${filterStatus !== 'all' ? 'text-[#BF4BF6]' : 'text-gray-500'}`} />
      </button>
      
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="py-1">
            <div className="px-3 py-2 border-b border-gray-200">
              <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Status Filter</span>
            </div>
            
            <div className="py-1">
              <div 
                onClick={() => handleStatusChange('all')} 
                className={`px-3 py-2 cursor-pointer ${filterStatus === 'all' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
              >
                All Status
              </div>
              <div 
                onClick={() => handleStatusChange('active')} 
                className={`px-3 py-2 cursor-pointer flex items-center ${filterStatus === 'active' ? 'bg-gray-100 text-[#BF4BF6]' : 'text-gray-900'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Active
              </div>
              <div 
                onClick={() => handleStatusChange('inactive')} 
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