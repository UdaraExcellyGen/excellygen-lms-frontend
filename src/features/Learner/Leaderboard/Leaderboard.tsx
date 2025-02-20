import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Award, Crown, Star, ChevronUp, ChevronDown,
  TrendingUp, Calendar, Filter, Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import Layout from '../../components/Layout';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data
  const initialData = [
    {
      rank: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      title: "Full Stack Developer",
      points: 2850,
      achievements: 15,
      completedCourses: 12,
      rankChange: 2
    },
    {
      rank: 2,
      name: "Mike Chen",
      avatar: "MC",
      title: "Software Engineer",
      points: 2720,
      achievements: 13,
      completedCourses: 10,
      rankChange: -1
    },
    {
      rank: 3,
      name: "Emma Davis",
      avatar: "ED",
      title: "Frontend Developer",
      points: 2680,
      achievements: 12,
      completedCourses: 9,
      rankChange: 1
    },
    {
      rank: 4,
      name: "Alex Turner",
      avatar: "AT",
      title: "Backend Developer",
      points: 2450,
      achievements: 11,
      completedCourses: 8,
      rankChange: 0
    },
    {
      rank: 5,
      name: "Anna Morrish",
      avatar: "AM",
      title: "Software Engineer",
      points: 2380,
      achievements: 10,
      completedCourses: 7,
      rankChange: 3,
      isCurrentUser: true
    }
  ];

  // Load and filter data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFilteredData(initialData);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeframe, category]);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(initialData);
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const filtered = initialData.filter(learner =>
      learner.name.toLowerCase().includes(searchTerm) ||
      learner.title.toLowerCase().includes(searchTerm)
    );
    setFilteredData(filtered);
  }, [searchQuery]);

  const TopLearnersCard = ({ rank, learner }) => {
    if (!learner) return null;

    const backgrounds = {
      1: 'bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00]', // Gold
      2: 'bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080]', // Silver
      3: 'bg-gradient-to-br from-[#CD7F32] via-[#B87333] to-[#A66A2E]'  // Bronze
    };
    
    const scales = {
      1: 'scale-110',
      2: 'scale-100',
      3: 'scale-95'
    };

    const translations = {
      1: 'translate-y-0',
      2: '-translate-y-12',
      3: '-translate-y-24'
    };

    const hoverTranslations = {
      1: '-translate-y-4',
      2: '-translate-y-16',
      3: '-translate-y-28'
    };

    const icons = { 1: Crown, 2: Medal, 3: Medal };
    const Icon = icons[rank];

    return (
      <div className={`w-72 ${scales[rank]} ${backgrounds[rank]} rounded-2xl p-6 text-white relative overflow-hidden group shadow-2xl`}>
        {/* Animated shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Rank indicator */}
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold ring-4 ring-white/30">
                {learner.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold">{learner.name}</h3>
                <p className="text-white/90">{learner.title}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <Star className="h-4 w-4 mx-auto mb-1" />
                <span className="text-sm font-bold">{learner.points.toLocaleString()}</span>
                <p className="text-xs text-white/80">points</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <Trophy className="h-4 w-4 mx-auto mb-1" />
                <span className="text-sm font-bold">{learner.achievements}</span>
                <p className="text-xs text-white/80">achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LeaderboardRow = ({ rank, learner, isCurrentUser }) => {
    if (!learner) return null;
    
    return (
      <div className={`p-4 ${isCurrentUser ? 'bg-[#F6E6FF]' : 'bg-white'} 
        rounded-xl mb-3 transform transition-all duration-300
        hover:shadow-lg hover:scale-[1.02] cursor-pointer
        ${isCurrentUser ? 'border-2 border-[#BF4BF6]' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-8 text-center font-bold text-gray-900">
            {rank}
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center text-white font-semibold">
            {learner.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{learner.name}</h3>
              {learner.rankChange !== 0 && (
                <div className={`flex items-center ${learner.rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {learner.rankChange > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span className="text-xs">{Math.abs(learner.rankChange)}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">{learner.title}</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center group">
              <p className="text-sm text-gray-500">Points</p>
              <p className="font-semibold text-gray-900 group-hover:text-[#BF4BF6] transition-colors">
                {learner.points.toLocaleString()}
              </p>
            </div>
            <div className="text-center group">
              <p className="text-sm text-gray-500">Achievements</p>
              <p className="font-semibold text-gray-900 group-hover:text-[#BF4BF6] transition-colors">
                {learner.achievements}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-[#D68BF9] mt-1">See how you rank among your peers</p>
          </div>

          {/* Top 3 Learners Podium */}
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
                  <TopLearnersCard rank={2} learner={filteredData[1]} />
                </div>
                
                {/* 1st Place */}
                <div className="transform translate-y-0 hover:-translate-y-4 transition-transform duration-300 z-10">
                  <TopLearnersCard rank={1} learner={filteredData[0]} />
                </div>
                
                {/* 3rd Place */}
                <div className="transform -translate-y-24 hover:-translate-y-28 transition-transform duration-300">
                  <TopLearnersCard rank={3} learner={filteredData[2]} />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-white text-lg">Not enough data to display leaderboard</p>
              </div>
            )}
            
            {/* Decorative Podium Platform */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center items-end">
              <div className="relative w-full max-w-4xl h-32 bg-gradient-to-t from-[#52007C] to-transparent opacity-50 blur-lg" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Your Rank', value: '5th', icon: Trophy, trend: '+3' },
              { label: 'Total Points', value: '2,380', icon: Star, trend: '+150' },
              { label: 'Achievements', value: '10', icon: Award, trend: '+2' }
            ].map((stat, index) => (
              <div key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    index === 0 ? 'bg-[#F6E6FF]' : 'bg-gray-100'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      index === 0 ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  {stat.trend} this week
                </div>
              </div>
            ))}
          </div>

          {/* Full Leaderboard */}
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

export default Leaderboard;