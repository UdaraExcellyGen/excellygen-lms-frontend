// src/pages/DiscussionForum/components/ForumActionBar.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Search, X } from 'lucide-react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { User } from '../../../../types/auth.types'; // FIXED: Changed AuthUser to User
import { CategorySelectOption } from '../types/dto';

interface ForumActionBarProps {
    user: User | null; // FIXED: Changed AuthUser to User
    onTriggerCreate: () => void;
    
    // Props for search
    searchTerm: string;
    onSearchChange: (value: string) => void;

    // Props for category filter
    categoryOptions: CategorySelectOption[];
    selectedCategory: SingleValue<CategorySelectOption>;
    onCategoryChange: (option: SingleValue<CategorySelectOption>) => void;
    isLoadingCategories: boolean;
}

const ForumActionBar: React.FC<ForumActionBarProps> = ({
    user,
    onTriggerCreate,
    searchTerm,
    onSearchChange,
    categoryOptions,
    selectedCategory,
    onCategoryChange,
    isLoadingCategories
}) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchVisible && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchVisible]);

    const selectFilterStyles: StylesConfig<CategorySelectOption, false> = {
        control: (provided, state) => ({ 
            ...provided, 
            backgroundColor: 'rgba(253, 246, 255, 0.9)', 
            border: state.isFocused ? '2px solid #BF4BF6' : '1px solid rgba(208, 160, 230, 0.5)',
            borderRadius: '9999px', 
            minHeight: '44px',
            boxShadow: state.isFocused ? '0 0 0 1px #BF4BF6' : 'none',
            '&:hover': { borderColor: '#BF4BF6' },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? '#7A00B8'
                : state.isFocused 
                ? 'rgba(191, 75, 246, 0.1)'
                : 'white',
            color: state.isSelected ? 'white' : '#1B0A3F',
            fontFamily: '"Nunito", sans-serif',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#5f0090'
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.75rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1B0A3F',
            fontFamily: '"Nunito", sans-serif',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'rgba(82, 0, 124, 0.7)',
            fontFamily: '"Nunito", sans-serif',
        }),
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-purple-300/40 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow" title={user?.name ?? 'User'}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name ?? ''} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user?.name?.charAt(0)?.toUpperCase() ?? 'A'
                    )}
                </div>

                {/* Create Thread Trigger */}
                <div 
                    onClick={onTriggerCreate}
                    className="hidden sm:flex flex-1 items-center gap-3 bg-purple-50/50 border border-purple-300/50 rounded-full px-5 py-3 text-purple-500/90 hover:border-purple-400 transition-colors cursor-pointer"
                >
                    <Edit3 size={20} className="text-purple-400" />
                    <span className="font-nunito text-sm">Start a new discussion...</span>
                </div>

                {/* Search Input (conditionally rendered) */}
                <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSearchVisible ? 'w-full' : 'w-0'}`}>
                    {isSearchVisible && (
                         <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-700/50" />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Search threads..." 
                                value={searchTerm} 
                                onChange={(e) => onSearchChange(e.target.value)} 
                                className="w-full bg-purple-50/80 border border-purple-300/50 rounded-full pl-11 pr-4 py-2.5 text-purple-900 placeholder-purple-500/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-nunito text-sm" 
                            />
                        </div>
                    )}
                </div>

                {/* Search Toggle Button */}
                <button 
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                    className="p-3 bg-purple-50/50 border border-purple-300/50 rounded-full text-purple-600 hover:bg-purple-100 transition-colors"
                    title={isSearchVisible ? "Close search" : "Search threads"}
                >
                    {isSearchVisible ? <X size={18} /> : <Search size={18} />}
                </button>

                {/* Category Filter */}
                <div className="w-full sm:w-auto sm:min-w-[180px] lg:min-w-[220px]">
                    <Select<CategorySelectOption, false>
                        instanceId="action-bar-category-filter"
                        value={selectedCategory} 
                        onChange={onCategoryChange}
                        options={categoryOptions} 
                        isLoading={isLoadingCategories}
                        isDisabled={isLoadingCategories}
                        placeholder="Categories" 
                        styles={selectFilterStyles}
                        menuPortalTarget={document.body} 
                        menuPlacement="auto" 
                    />
                </div>
            </div>
        </div>
    );
};

export default ForumActionBar;