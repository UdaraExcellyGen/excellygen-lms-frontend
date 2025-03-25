import React from 'react';
import TopLearnerCard from './TopLearnerCard';

const TopLearnersPodium = ({ isLoading, filteredData }) => {
  return (
    <div className="relative h-auto md:h-96 mb-20 perspective-1000">
      {isLoading ? (
        <div className="flex flex-col md:flex-row justify-center items-end h-full gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-full md:w-72 h-48 md:h-64 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredData.length >= 3 ? (
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end h-full gap-4 space-y-4 md:space-y-0">
          
          <div className="w-full md:w-auto transform md:-translate-y-12 md:hover:-translate-y-16 transition-transform duration-300 order-2 md:order-1">
            <TopLearnerCard rank={2} learner={filteredData[1]} />
          </div>
          
          
          <div className="w-full md:w-auto transform translate-y-0 md:hover:-translate-y-4 transition-transform duration-300 z-10 order-1 md:order-2">
            <TopLearnerCard rank={1} learner={filteredData[0]} />
          </div>
          
          
          <div className="w-full md:w-auto transform md:-translate-y-24 md:hover:-translate-y-28 transition-transform duration-300 order-3">
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