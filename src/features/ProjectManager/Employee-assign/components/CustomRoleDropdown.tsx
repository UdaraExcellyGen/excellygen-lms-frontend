// Path: src/features/ProjectManager/Employee-assign/components/CustomRoleDropdown.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface CustomRoleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; isNeeded?: boolean }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomRoleDropdown: React.FC<CustomRoleDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select Role",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ✅ NEW: Prevent document scroll when dropdown is open, but allow dropdown internal scroll
  useEffect(() => {
    if (isOpen) {
      const preventDocumentScroll = (e: WheelEvent) => {
        // Allow scrolling within the dropdown options
        const optionsElement = optionsRef.current;
        if (optionsElement && optionsElement.contains(e.target as Node)) {
          // This is scrolling within the dropdown, allow it
          return;
        }
        
        // This is scrolling outside the dropdown, prevent it
        e.preventDefault();
        e.stopPropagation();
      };

      // Add event listener with passive: false to allow preventDefault
      document.addEventListener('wheel', preventDocumentScroll, { passive: false });
      
      return () => {
        document.removeEventListener('wheel', preventDocumentScroll);
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // ✅ NEW: Allow wheel events within the dropdown for internal scrolling
  const handleDropdownWheel = (e: React.WheelEvent) => {
    // Stop propagation to prevent the document scroll prevention from interfering
    e.stopPropagation();
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-2 py-1 rounded-lg border border-[#F6E6FF] dark:border-[#7A00B8] 
          bg-white dark:bg-[#1B0A3F] text-[#52007C] dark:text-white 
          focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] text-sm
          flex items-center justify-between min-h-[32px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#BF4BF6]'}
          ${!selectedOption ? 'text-gray-400' : ''}
        `}
      >
        <span className="truncate text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <FaChevronUp className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <FaChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div 
          ref={optionsRef}
          className="fixed bg-white dark:bg-[#1B0A3F] border border-[#F6E6FF] dark:border-[#7A00B8] rounded-lg shadow-2xl"
          style={{
            zIndex: 9999999,
            maxHeight: '200px',
            overflowY: 'auto',
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left + window.scrollX : 0,
            width: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().width : 'auto',
            minWidth: '200px'
          }}
          onWheel={handleDropdownWheel} // ✅ Allow internal scrolling
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No roles available
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left text-sm cursor-pointer transition-colors duration-150
                  hover:bg-[#F6E6FF] dark:hover:bg-[#34137C]
                  ${option.isNeeded ? 'font-medium text-red-600 dark:text-red-400' : 'text-[#52007C] dark:text-white'}
                  ${value === option.value ? 'bg-[#BF4BF6] text-white' : ''}
                `}
              >
                <span className="truncate">{option.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomRoleDropdown;