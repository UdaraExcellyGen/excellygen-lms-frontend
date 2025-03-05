
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Errors } from '../types/CourseDetails'; 

interface TechnologyDropdownProps {
  label: string;
  selectedTechnologies: string[];
  availableTechnologies: string[];
  onTechnologyChange: (tech: string) => void;
  errors: Errors; 
}


export const TechnologyDropdown: React.FC<TechnologyDropdownProps> = ({
  label,
  selectedTechnologies,
  availableTechnologies,
  onTechnologyChange,
  errors,
}) => {
  const [isTechnologiesDropdownOpen, setIsTechnologiesDropdownOpen] = useState<boolean>(false);
  const technologiesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
        setIsTechnologiesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label>
      <div className="relative" ref={technologiesDropdownRef}>
        <button
          type="button"
          className={`w-full p-2 border ${errors.technologies ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white flex justify-between items-center`}
          onClick={() => setIsTechnologiesDropdownOpen(!isTechnologiesDropdownOpen)}
          aria-haspopup="true"
          aria-expanded={isTechnologiesDropdownOpen}
        >
          {selectedTechnologies.length > 0 ? selectedTechnologies.join('   ,  ') : 'Select Technologies'}
          {isTechnologiesDropdownOpen ? <ChevronUp className="text-[#ffffff]" size={15} /> : <ChevronDown className="text-white" size={20} />}
        </button>
        {isTechnologiesDropdownOpen && (
          <div className="mt-1 w-full rounded-md shadow-lg bg-[#F6E6FF]/50 backdrop-blur-sm ring-1 ring-black ring-opacity-5 focus:outline-none" style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {availableTechnologies.map(tech => (
                <div key={tech} className="px-4 py-2 hover:bg-[#8e8d8d] cursor-pointer" role="menuitem">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#BF4BF6] rounded border-gray-300 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
                      value={tech}
                      checked={selectedTechnologies.includes(tech)}
                      onChange={() => onTechnologyChange(tech)}
                    />
                    <span className="ml-2 text-white font-['Nunito_Sans']">{tech}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {errors.technologies && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Please select at least one technology.</p>}
    </div>
  );
};