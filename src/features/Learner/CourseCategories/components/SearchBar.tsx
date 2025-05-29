import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md mb-12">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
          <input
            type="text"
            placeholder="Search course category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-4 py-3 text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;