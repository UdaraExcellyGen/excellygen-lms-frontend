// src/components/Sidebar/SearchResults.tsx
import React from 'react';
import { useSearch } from '../../components/Sidebar/contexts/SearchContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCircle, ChevronRight, SearchX } from 'lucide-react';
import Layout from './Layout';

const SearchResultsContent: React.FC = () => {
  const { searchResults, isSearching, searchQuery, clearSearch } = useSearch();
  const navigate = useNavigate();

  const handleLinkClick = (userId: string) => {
    clearSearch();
    navigate(`/learner/profile/${userId}`);
  };

  if (!searchQuery && !isSearching) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-gray-400 p-8 text-center">
        <SearchX size={48} className="mx-auto mb-4 text-purple-300"/>
        <h3 className="text-xl font-semibold text-white">Find Learners</h3>
        <p>Start typing in the search bar to find users by name or ID.</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full mx-auto">
            <h1 className="text-3xl font-bold text-white font-unbounded mb-6">
                Search Results
                {searchQuery && <span className="text-gray-300 text-2xl"> for "{searchQuery}"</span>}
            </h1>

            {isSearching ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-white" size={40} />
                </div>
            ) : searchResults.length > 0 ? (
                // FIX: Replaced incorrect <ul> with <div>
                <div className="space-y-3">
                    {searchResults.map(user => (
                        <button 
                            key={user.id}
                            onClick={() => handleLinkClick(user.id)} 
                            className="w-full bg-[#4A247D] hover:bg-[#592d98] transition-all duration-300 transform hover:scale-[1.02] p-4 rounded-2xl flex items-center justify-between text-left shadow-lg border border-purple-400/20"
                        >
                            <div className="flex items-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-400/50" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white ring-2 ring-purple-400/50">
                                        <UserCircle strokeWidth={1} size={36} />
                                    </div>
                                )}
                                <div className="ml-4">
                                    <p className="font-bold text-white text-lg">{user.name}</p>
                                    <p className="text-sm text-purple-200">{user.jobRole || 'Learner'}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                                <ChevronRight className="text-purple-200" size={24} />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-purple-200 bg-black/20 rounded-lg">
                    <SearchX size={48} className="mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold">No Users Found</h3>
                    <p>Your search for "{searchQuery}" did not return any results.</p>
                </div>
            )}
        </div>
    </div>
  );
};

const SearchResultsPage = () => (
    <Layout>
        <SearchResultsContent />
    </Layout>
);

export default SearchResultsPage;