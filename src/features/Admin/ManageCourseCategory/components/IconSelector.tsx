// src/features/Admin/ManageCourseCategory/components/IconSelector.tsx
// ENTERPRISE OPTIMIZED: Instant, professional icon selection
import React, { useCallback, useRef, useEffect } from 'react';
import { 
  Code2, Database, Target, ClipboardList, 
  Settings, Palette, LineChart, Cloud, Shield, BookText,
  ChevronDown, Check, Search
} from 'lucide-react';

// ENTERPRISE: Comprehensive icon library for professional categories
export const availableIcons = [
  { name: 'Code2', component: Code2, label: 'Programming', category: 'Tech' },
  { name: 'Database', component: Database, label: 'Database', category: 'Tech' },
  { name: 'Target', component: Target, label: 'Goals & Strategy', category: 'Business' },
  { name: 'ClipboardList', component: ClipboardList, label: 'Documentation', category: 'Management' },
  { name: 'Settings', component: Settings, label: 'Configuration', category: 'Tech' },
  { name: 'Palette', component: Palette, label: 'Design & Creative', category: 'Creative' },
  { name: 'LineChart', component: LineChart, label: 'Analytics & Data', category: 'Business' },
  { name: 'Cloud', component: Cloud, label: 'Cloud Computing', category: 'Tech' },
  { name: 'Shield', component: Shield, label: 'Security', category: 'Tech' },
  { name: 'BookText', component: BookText, label: 'Learning Materials', category: 'Education' }
];

// ENTERPRISE: Smart icon rendering with fallback
export const renderIcon = (iconName: string, size: number = 24) => {
  const icon = availableIcons.find(i => i.name === iconName);
  if (icon) {
    const IconComponent = icon.component;
    return <IconComponent size={size} />;
  }
  return <Code2 size={size} />; // Professional fallback
};

interface IconSelectorProps {
  selectedIcon: string;
  onChange: (iconName: string) => void;
  showDropdown: boolean;
  toggleDropdown: () => void;
  disabled?: boolean;
}

// ENTERPRISE: Professional icon selector with search and categories
const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onChange,
  showDropdown,
  toggleDropdown,
  disabled = false
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  // ENTERPRISE: Smart click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      toggleDropdown();
    }
  }, [toggleDropdown]);

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, handleClickOutside]);

  // ENTERPRISE: Smart filtering with search and categories
  const filteredIcons = React.useMemo(() => {
    let filtered = availableIcons;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(icon => icon.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(icon => 
        icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // ENTERPRISE: Get unique categories for filter
  const categories = React.useMemo(() => {
    const cats = ['All', ...new Set(availableIcons.map(icon => icon.category))];
    return cats;
  }, []);

  const selectedIconData = availableIcons.find(icon => icon.name === selectedIcon);

  const handleIconSelect = useCallback((iconName: string) => {
    onChange(iconName);
    toggleDropdown();
    setSearchTerm(''); // Reset search
  }, [onChange, toggleDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category Icon
      </label>
      
      {/* ENTERPRISE: Professional trigger button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-[#BF4BF6]">
            {renderIcon(selectedIcon, 20)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block truncate font-medium text-gray-900">
              {selectedIconData?.label || selectedIcon}
            </span>
            <span className="block truncate text-sm text-gray-500">
              {selectedIconData?.category || 'Custom'}
            </span>
          </div>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`} 
          />
        </span>
      </button>

      {/* ENTERPRISE: Professional dropdown with search and categories */}
      {showDropdown && (
        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-80 rounded-lg border border-gray-200 overflow-hidden">
          {/* Search and Filter Header */}
          <div className="p-3 border-b border-gray-100 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#BF4BF6] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Icons Grid */}
          <div className="max-h-60 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-2 gap-1 p-2">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 ${
                      selectedIcon === icon.name
                        ? 'bg-[#BF4BF6]/10 text-[#BF4BF6] border border-[#BF4BF6]/20'
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                    role="option"
                    aria-selected={selectedIcon === icon.name}
                  >
                    <div className="flex-shrink-0">
                      {renderIcon(icon.name, 18)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {icon.label}
                        </span>
                        {selectedIcon === icon.name && (
                          <Check className="h-4 w-4 text-[#BF4BF6] flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 truncate block">
                        {icon.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No icons found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {filteredIcons.length} of {availableIcons.length} icons
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;