import React from 'react';
import TopLearnerCard from './TopLearnerCard';

const TopLearnersPodium = ({ isLoading, filteredData }) => {
  return (
    <div className="relative h-96 mb-20 perspective-1000">
      {isLoading ? (
        <div className="flex justify-center items-end h-full gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-72 h-64 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredData.length >= 3 ? (
        <div className="flex justify-center items-end h-full gap-4">
          {/* 2nd Place */}
          <div className="transform -translate-y-12 hover:-translate-y-16 transition-transform duration-300">
            <TopLearnerCard rank={2} learner={filteredData[1]} />
          </div>
          
          {/* 1st Place */}
          <div className="transform translate-y-0 hover:-translate-y-4 transition-transform duration-300 z-10">
            <TopLearnerCard rank={1} learner={filteredData[0]} />
          </div>
          
          {/* 3rd Place */}
          <div className="transform -translate-y-24 hover:-translate-y-28 transition-transform duration-300">
            <TopLearnerCard rank={3} learner={filteredData[2]} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-white text-lg">Not enough data to display leaderboard</p>
        </div>
      )}
      
     
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center items-end">
        <div className="relative w-full max-w-4xl h-32 bg-gradient-to-t from-[#52007C] to-transparent opacity-50 blur-lg" />
      </div>
    </div>
  );
};

export default TopLearnersPodium;