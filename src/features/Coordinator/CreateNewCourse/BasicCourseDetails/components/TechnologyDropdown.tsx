// components/ui/TechnologyDropdown.tsx
import React, { useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TechnologyDropdownProps {
    selectedTechnologies: string[];
    availableTechnologies: string[];
    error?: boolean;
    onTechnologyChange: (tech: string) => void;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    dropdownRef: React.RefObject<HTMLDivElement>;
}

const TechnologyDropdown: React.FC<TechnologyDropdownProps> = ({
    selectedTechnologies,
    availableTechnologies,
    error,
    onTechnologyChange,
    isOpen,
    setIsOpen,
    dropdownRef
}) => {
    return (
        <div>
            <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Technologies</label>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white flex justify-between items-center`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {selectedTechnologies.length > 0 ? selectedTechnologies.join('   ,  ') : 'Select Technologies'}
                    {isOpen ? <ChevronUp className="text-[#ffffff]" size={15} /> : <ChevronDown className="text-white" size={20} />}
                </button>
                {isOpen && (
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
            {error && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Please select at least one technology.</p>}
        </div>
    );
};

export default TechnologyDropdown;