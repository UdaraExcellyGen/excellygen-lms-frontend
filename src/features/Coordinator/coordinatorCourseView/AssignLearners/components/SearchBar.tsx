// features/Mainfolder/AssignLearners/components/SearchBar.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, onClearSearch }) => {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} color="#586574" /> {/* Timberwolf */}
            </div>
            <input
                type="text"
                placeholder="Search learners by name..."
                className="block w-full pl-11 pr-4 py-3 border border-timberwolf-200 rounded-xl text-gunmetal placeholder-timberwolf focus:outline-none focus:ring-french-violet focus:border-french-violet sm:text-sm font-secondary"
                value={searchTerm}
                onChange={onSearchChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {searchTerm && (
                    <button
                        onClick={onClearSearch}
                        className="focus:outline-none text-timberwolf hover:text-gunmetal"
                    >
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;