import React from 'react';
import { 
  Code2, Database, Target, ClipboardList, 
  Settings, Palette, LineChart, Cloud, Shield, BookText,
  ChevronDown, Check
} from 'lucide-react';

// Available icons for the dropdown
export const availableIcons = [
  { name: 'Code2', component: Code2, label: 'Code' },
  { name: 'Database', component: Database, label: 'Database' },
  { name: 'Target', component: Target, label: 'Target' },
  { name: 'ClipboardList', component: ClipboardList, label: 'Clipboard' },
  { name: 'Settings', component: Settings, label: 'Settings' },
  { name: 'Palette', component: Palette, label: 'Design' },
  { name: 'LineChart', component: LineChart, label: 'Charts' },
  { name: 'Cloud', component: Cloud, label: 'Cloud' },
  { name: 'Shield', component: Shield, label: 'Security' },
  { name: 'BookText', component: BookText, label: 'Book' }
];

// Render icon component
export const renderIcon = (iconName: string, size: number = 24) => {
  const icon = availableIcons.find(i => i.name === iconName);
  if (icon) {
    const IconComponent = icon.component;
    return <IconComponent size={size} />;
  }
  return <Code2 size={size} />;
};

interface IconSelectorProps {
  selectedIcon: string;
  onChange: (iconName: string) => void;
  showDropdown: boolean;
  toggleDropdown: () => void;
  disabled?: boolean;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onChange,
  showDropdown,
  toggleDropdown,
  disabled = false
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Icon</label>
      <div className="mt-1 relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
          disabled={disabled}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3 text-[#BF4BF6]">
              {renderIcon(selectedIcon)}
            </div>
            <span className="block truncate">
              {availableIcons.find(icon => icon.name === selectedIcon)?.label || selectedIcon}
            </span>
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {showDropdown && (
          <ul
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
          >
            {availableIcons.map((icon) => (
              <li
                key={icon.name}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-[#F6E6FF] ${
                  selectedIcon === icon.name ? 'bg-[#F6E6FF] text-[#BF4BF6]' : 'text-gray-900'
                }`}
                onClick={() => {
                  onChange(icon.name);
                  toggleDropdown();
                }}
                role="option"
                aria-selected={selectedIcon === icon.name}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {renderIcon(icon.name, 20)}
                  </div>
                  <span className={`block truncate ${selectedIcon === icon.name ? 'font-medium' : 'font-normal'}`}>
                    {icon.label}
                  </span>
                </div>

                {selectedIcon === icon.name && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#BF4BF6]">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default IconSelector;