// Path: src/features/ProjectManager/Employee-assign/components/MultiSelect.tsx

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown } from 'react-icons/fa';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  darkMode: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ value, onChange, options, darkMode, buttonRef }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            window.addEventListener('resize', updateDropdownPosition);
            window.addEventListener('scroll', updateDropdownPosition);
            const handleClickOutside = (event: any) => {
                if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target) &&
                    buttonRef.current && !buttonRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                window.removeEventListener('resize', updateDropdownPosition);
                window.removeEventListener('scroll', updateDropdownPosition);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, buttonRef]);

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleSkillToggle = (skill: string) => {
        const newValue = value.includes(skill)
            ? value.filter(s => s !== skill)
            : [...value, skill];
        onChange(newValue);
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative isolation-isolate" ref={selectRef}>
            <button
                ref={buttonRef}
                onClick={handleButtonClick}
                className="px-4 py-2 rounded-lg border border-[#F6E6FF] dark:border-[#7A00B8]
                bg-white dark:bg-[#1B0A3F] text-[#52007C] dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] min-w-[200px]
                flex items-center justify-between relative z-10"
            >
                <span className="truncate">
                    {value.length === 0 ? 'Select Employee Technologies' : `${value.length} technology(s) selected`}
                </span>
                <FaChevronDown className="ml-2 w-4 h-4" />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        paddingRight: '1rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: darkMode ? '#7A00B8 #34137C' : '#D68BF9 #F6E6FF',
                    }}
                    className="z-[9999] bg-white dark:bg-[#34137C] rounded-lg shadow-lg
                  border border-[#F6E6FF] dark:border-[#7A00B8]" // Combined className attributes
                >
                    <div className="sticky top-0 bg-white dark:bg-[#34137C] p-2 border-b border-[#F6E6FF] dark:border-[#7A00B8]
                      flex justify-between items-center shadow-sm">
                        <span className="text-sm font-medium text-[#52007C] dark:text-white">
                            Selected: {value.length}
                        </span>
                        {value.length > 0 && (
                            <button
                                onClick={clearSelection}
                                className="text-sm text-[#BF4BF6] hover:text-[#7A00B8] dark:text-[#D68BF9]
                             dark:hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="p-1">
                        {options.map((skill) => (
                            <div
                                key={skill}
                                className="flex items-center px-4 py-2 hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F]
                             cursor-pointer rounded-md"
                                onClick={() => handleSkillToggle(skill)}
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(skill)}
                                    onChange={() => { }} // Kept empty onChange as it's controlled by div click
                                    className="mr-2"
                                />
                                <span className="text-[#52007C] dark:text-white">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MultiSelect;