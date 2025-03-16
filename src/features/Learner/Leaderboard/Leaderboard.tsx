import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

import TopLearnersPodium from './Components/TopLearnersPodium';
import LeaderboardTable from './Components/LeaderboardTable';
import StatCard from './Components/StatCard';
import { courseCategories, initialData } from './data/mockData';
import { Trophy, Star } from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [category, setCategory] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

 
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setFilteredData(initialData[category] || initialData['all']);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeframe, category]);

 
  const getRankSuffix = (rank) => {
    if (rank % 10 === 1 && rank !== 11) return 'st';
    if (rank % 10 === 2 && rank !== 12) return 'nd';
    if (rank % 10 === 3 && rank !== 13) return 'rd';
    return 'th';
  };

  const findUserRank = () => {
    const userEntry = filteredData.find(entry => entry.isCurrentUser);
    return userEntry ? `${userEntry.rank}${getRankSuffix(userEntry.rank)}` : 'N/A';
  };

  const findUserPoints = () => {
    const userEntry = filteredData.find(entry => entry.isCurrentUser);
    return userEntry ? userEntry.points.toLocaleString() : '0';
  };

  if (error) {
    return (
      
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Error Loading Leaderboard</h2>
            <p>{error}</p>
          </div>
        </div>
      
    );
  }

  return (
   <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
         
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-[#D68BF9] mt-1">See how you rank among your peers</p>
          </div>

          {/* Top 3 Learners Podium */}
          <TopLearnersPodium isLoading={isLoading} filteredData={filteredData} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard 
              label="Your Rank" 
              value={findUserRank()} 
              Icon={Trophy} 
            />
            <StatCard 
              label="Total Points" 
              value={findUserPoints()} 
              Icon={Star} 
            />
          </div>

          {/* Full Leaderboard */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-white">Full Leaderboard</h2>
              
              {/* Course Category Filter */}
              <div className="relative">
                <div 
                  className="bg-white rounded-lg px-4 py-2 cursor-pointer flex items-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-700">
                    {courseCategories.find(c => c.id === category)?.name || 'All'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-20 w-64">
                    {courseCategories.map((cat) => (
                      <div 
                        key={cat.id}
                        className={`px-4 py-2 rounded-md cursor-pointer hover:bg-purple-50 ${category === cat.id ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                        onClick={() => {
                          setCategory(cat.id);
                          setIsFilterOpen(false);
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <LeaderboardTable 
              isLoading={isLoading} 
              filteredData={filteredData} 
            />
          </div>
        </div>
      </div>
      </Layout>
    
  );
};

export default Leaderboard;