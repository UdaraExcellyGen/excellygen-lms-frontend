// src/features/Learner/CourseCategories/components/SearchBar.tsx
// ENTERPRISE OPTIMIZED: Professional search with instant responsiveness
import React, { useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// ENTERPRISE: Professional search component with advanced UX patterns
const SearchBar: React.FC<SearchBarProps> = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search course category...",
  disabled = false 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // ENTERPRISE: Optimized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  }, [setSearchQuery]);

  // ENTERPRISE: Quick clear functionality
  const handleClear = useCallback(() => {
    setSearchQuery('');
    inputRef.current?.focus();
  }, [setSearchQuery]);

  // ENTERPRISE: Focus management
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // ENTERPRISE: Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape to clear search
    if (e.key === 'Escape') {
      if (searchQuery) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
    
    // Ctrl/Cmd + K to focus search (common pattern)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, [searchQuery, handleClear]);

  // ENTERPRISE: Global keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search from anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const hasSearchQuery = searchQuery.length > 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md mb-12">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          {/* ENTERPRISE: Enhanced search input with visual feedback */}
          <div className={`
            relative transition-all duration-200
            ${isFocused ? 'ring-2 ring-[#BF4BF6] ring-opacity-50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <Search className={`
              absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200
              ${isFocused ? 'text-[#BF4BF6]' : 'text-[#52007C]'}
              ${disabled ? 'text-gray-400' : ''}
            `} />
            
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={`
                w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-12 py-3 
                text-[#1B0A3F] placeholder-[#52007C]/60 font-nunito
                transition-all duration-200 outline-none
                ${isFocused 
                  ? 'border-[#BF4BF6] bg-[#F6E6FF]/70 shadow-sm' 
                  : 'hover:border-[#BF4BF6]/40 hover:bg-[#F6E6FF]/60'
                }
                ${disabled 
                  ? 'cursor-not-allowed bg-gray-100 border-gray-200' 
                  : ''
                }
              `}
              aria-label="Search course categories"
              autoComplete="off"
              spellCheck="false"
            />
            
            {/* ENTERPRISE: Clear button for better UX */}
            {hasSearchQuery && !disabled && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#52007C]/60 hover:text-[#BF4BF6] hover:bg-[#BF4BF6]/10 transition-all duration-200"
                aria-label="Clear search"
                tabIndex={-1} // Keep focus on input
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* ENTERPRISE: Subtle helper text */}
          <div className="flex justify-between items-center mt-2 text-xs text-[#52007C]/60">
            <span>
              {hasSearchQuery 
                ? `Searching for "${searchQuery}"` 
                : 'Start typing to search categories...'
              }
            </span>
            <span className="hidden sm:block">
              Press Ctrl+K to focus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;