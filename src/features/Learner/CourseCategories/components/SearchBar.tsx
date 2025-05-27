import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D68BF9]" />
          <input
            type="text"
            placeholder="Search course category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-[#BF4BF6]/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#D68BF9]/70 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;