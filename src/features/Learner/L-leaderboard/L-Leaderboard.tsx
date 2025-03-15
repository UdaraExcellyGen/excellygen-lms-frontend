import { useState, useEffect } from 'react';
import { Layout } from './Components/Layout';
import { LeaderboardRow } from './Components/LeaderboardRow';
import { StatCard } from './Components/StatCard';
import { TopLearnersCard } from './Components/TopLearnerCard';
import { TopLearnersPodium } from './Components/TopLearnersPodium';
import { Learner } from './types/leaderboard';
import { initialData } from './data/mockData'; 

const L_Leaderboard = () => {
  const [filteredData, setFilteredData] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFilteredData(initialData);
        setError(null);
      } catch (err: any) {
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); 

 
  useEffect(() => {
    
  }, []); 

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex items-center justify-center">
          <div className="text-white text-center">
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
        <div className="max-w-7xl mx-auto px-8 space-y-8">
        
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-[#D68BF9] mt-1">See how you rank among your peers</p>
          </div>

         
          <TopLearnersPodium isLoading={isLoading} filteredData={filteredData} TopLearnersCard={TopLearnersCard}/>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard label="Your Rank" value="5th" />
            <StatCard label="Total Points" value="2,380" />
          </div>

         
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">Full Leaderboard</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredData.length > 0 ? (
              <div className="space-y-2">
                {filteredData.map((learner) => (
                  <LeaderboardRow
                    key={learner.rank}
                    rank={learner.rank}
                    learner={learner}
                    isCurrentUser={learner.isCurrentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white text-lg">No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default L_Leaderboard;