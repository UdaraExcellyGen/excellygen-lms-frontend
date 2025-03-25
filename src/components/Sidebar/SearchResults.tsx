import React from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../Sidebar/contexts/SearchContext';
import Layout from './Layout';
import { Mail, Phone, Briefcase } from 'lucide-react';

const SearchResults: React.FC = () => {
  const { searchQuery, searchResults } = useSearch();
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-gray-300">
              Showing results for "<span className="text-white font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>

        {searchResults.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium text-white mb-2">No learners found</h2>
            <p className="text-gray-300">
              Try searching by learner ID (e.g., LRN001) or name
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((learner) => (
              <div
                key={learner.id}
                className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-white/10 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {learner.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1B0A3F]">{learner.name}</h3>
                        <p className="text-[#52007C]">{learner.role}</p>
                        <p className="text-gray-500 text-sm mt-1">ID: {learner.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-[#BF4BF6]" />
                      <span className="text-sm">{learner.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-[#BF4BF6]" />
                      <span className="text-sm">{learner.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-[#BF4BF6]" />
                      <span className="text-sm">{learner.department}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {learner.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {learner.skills.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{learner.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Using Link with the new route */}
                  <Link 
                    to={`/learner/${learner.id}`}
                    className="w-full px-4 py-2.5 mt-2 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] hover:from-[#52007C] hover:to-[#A030D6] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;