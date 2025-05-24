

// components/TechnologyDropdown.tsx 
import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

// Expect options as { id: string, name: string }
interface TechnologyOption {
  id: string;
  name: string;
}

interface TechnologyDropdownProps {
  selectedTechnologyIds: string[]; // Expecting IDs now
  availableTechnologies: TechnologyOption[]; // Updated type
  error?: boolean;
  errorMessage?: string; // Specific error message
  onTechnologyChange: (techId: string) => void; // Pass ID on change
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const TechnologyDropdown: React.FC<TechnologyDropdownProps> = ({
  selectedTechnologyIds,
  availableTechnologies,
  error,
  errorMessage, // Receive the error message
  onTechnologyChange,
  isOpen,
  setIsOpen,
  dropdownRef
}) => {

    // Function to get names of selected technologies for display
    const getSelectedNames = () => {
        return availableTechnologies
            .filter(tech => selectedTechnologyIds.includes(tech.id))
            .map(tech => tech.name)
            .join(', ');
    };

  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Technologies *</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white flex justify-between items-center text-left h-10`} // Ensure minimum height
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox" // Use listbox for accessibility
          aria-expanded={isOpen}
        >
            <span className="truncate pr-2"> {/* Added truncate for long selections */}
             {selectedTechnologyIds.length > 0 ? getSelectedNames() : 'Select Technologies'}
             </span>
           {isOpen ? <ChevronUp className="text-white flex-shrink-0" size={20} /> : <ChevronDown className="text-white flex-shrink-0" size={20} />} {/* Use flex-shrink-0 */}
        </button>
         {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-[#2a1c4a] backdrop-blur-sm ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto"> {/* Adjusted bg for better visibility */}
            <ul className="py-1" role="listbox" aria-labelledby="options-menu"> {/* Use ul/li and listbox role */}
              {availableTechnologies.map(tech => (
                <li key={tech.id} className="px-3 py-2 hover:bg-[#4a3a7a] cursor-pointer text-white" role="option" aria-selected={selectedTechnologyIds.includes(tech.id)}> {/* Adjusted hover bg */}
                   <label className="flex items-center w-full cursor-pointer"> {/* Changed inline-flex to flex */}
                     <input
                       type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#BF4BF6] rounded border-gray-500 bg-[#1B0A3F] focus:ring-[#BF4BF6] focus:ring-offset-0 cursor-pointer" // Added bg and adjusted border/focus
                       value={tech.id}
                       checked={selectedTechnologyIds.includes(tech.id)}
                       onChange={() => onTechnologyChange(tech.id)} // Pass ID on change
                     />
                     <span className="ml-3 text-white font-['Nunito_Sans'] flex-1">{tech.name}</span> {/* Use flex-1 for text */}
                   </label>
                 </li>
              ))}
             </ul>
          </div>
        )}
      </div>
      {/* Use the specific errorMessage */}
       {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
     </div>
  );
};

export default TechnologyDropdown;