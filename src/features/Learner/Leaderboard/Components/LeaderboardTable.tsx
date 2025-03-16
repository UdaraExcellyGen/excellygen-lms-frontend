import React from 'react';
import LeaderboardRow from './LeaderboardRow';

const LeaderboardTable = ({ isLoading, filteredData }) => {
  return (
    <>
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
    </>
  );
};

export default LeaderboardTable;