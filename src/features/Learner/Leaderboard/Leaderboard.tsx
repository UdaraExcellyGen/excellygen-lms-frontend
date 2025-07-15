import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';

import Layout from '../../../components/Sidebar/Layout';
import TopLearnersPodium from './Components/TopLearnersPodium';
import LeaderboardTable from './Components/LeaderboardTable';
import StatCard from './Components/StatCard';
// CORRECTED IMPORT PATH:
import { getLeaderboardData } from '../../../api/services/Learner/leaderboardService'; 
import { LeaderboardEntry } from './types/leaderboard';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<string>('N/A');
  const [userPoints, setUserPoints] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getLeaderboardData();
        setLeaderboardData(data.entries);

        if (data.currentUserRank) {
          const rank = data.currentUserRank.rank;
          const suffix = (rank % 10 === 1 && rank !== 11) ? 'st'
                       : (rank % 10 === 2 && rank !== 12) ? 'nd'
                       : (rank % 10 === 3 && rank !== 13) ? 'rd'
                       : 'th';
          setUserRank(`${rank}${suffix}`);
          setUserPoints(data.currentUserRank.points.toLocaleString());
        } else {
          setUserRank('N/A');
          setUserPoints('0');
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex items-center justify-center">
          <div className="text-white text-center bg-black/20 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-2">Error Loading Leaderboard</h2>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
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

          <TopLearnersPodium isLoading={isLoading} filteredData={leaderboardData} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard 
              label="Your Rank" 
              value={userRank} 
              Icon={Trophy} 
            />
            <StatCard 
              label="Total Points" 
              value={userPoints} 
              Icon={Star} 
            />
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Full Leaderboard</h2>
            </div>
            
            <LeaderboardTable 
              isLoading={isLoading} 
              filteredData={leaderboardData} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;