// components/SearchBar.tsx
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, onClearSearch }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 h-5 w-5" />
            </div>
            <input
                type="text"
                placeholder="Search Courses or Learners..."
                className="block w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 pl-10 pr-3 rounded-xl leading-tight focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={onSearchChange}
            />
            {searchTerm && (
                <button
                    className="absolute top-0 right-0 mt-2 mr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={onClearSearch}
                >
                    <FiX className="h-4 w-4 fill-current" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;