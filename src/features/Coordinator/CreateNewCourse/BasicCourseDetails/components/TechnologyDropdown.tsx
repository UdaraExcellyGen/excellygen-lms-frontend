// components/TechnologyDropdown.tsx
import React, { useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TechnologyDto } from '../../../../../types/course.types'; // Use TechnologyDto

interface TechnologyDropdownProps {
  label: string; // Added label prop
  selectedTechnologyIds: string[];
  availableTechnologies: TechnologyDto[];
  error?: boolean;
  errorMessage?: string;
  onTechnologyChange: (techId: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const TechnologyDropdown: React.FC<TechnologyDropdownProps> = ({
  label,
  selectedTechnologyIds,
  availableTechnologies,
  error,
  errorMessage,
  onTechnologyChange,
  isOpen,
  setIsOpen,
  dropdownRef
}) => {

  const getSelectedNames = () => {
    return availableTechnologies
      .filter(tech => selectedTechnologyIds.includes(tech.id))
      .map(tech => tech.name)
      .join(', ');
  };

  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white flex justify-between items-center text-left h-10`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate pr-2">
            {selectedTechnologyIds.length > 0 ? getSelectedNames() : 'Select Technologies'}
          </span>
          {isOpen ? <ChevronUp className="text-white flex-shrink-0" size={20} /> : <ChevronDown className="text-white flex-shrink-0" size={20} />}
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-[#2a1c4a] backdrop-blur-sm ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
            <ul className="py-1" role="listbox" aria-labelledby="options-menu">
              {availableTechnologies.map(tech => (
                <li key={tech.id} className="px-3 py-2 hover:bg-[#4a3a7a] cursor-pointer text-white" role="option" aria-selected={selectedTechnologyIds.includes(tech.id)}>
                  <label className="flex items-center w-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#BF4BF6] rounded border-gray-500 bg-[#1B0A3F] focus:ring-[#BF4BF6] focus:ring-offset-0 cursor-pointer"
                      value={tech.id}
                      checked={selectedTechnologyIds.includes(tech.id)}
                      onChange={() => onTechnologyChange(tech.id)}
                    />
                    <span className="ml-3 text-white font-['Nunito_Sans'] flex-1">{tech.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
    </div>
  );
};

export default TechnologyDropdown;