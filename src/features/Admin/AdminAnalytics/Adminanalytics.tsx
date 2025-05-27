import React, { useState } from 'react';
import { 
  ArrowLeft, BarChart3, PieChart, LineChart, 
  RefreshCw, Calendar, Users, Book, Filter, 
  ChevronDown, Clock, Download
} from 'lucide-react';
import Enrollment from './Components/Enrolmentchart';
import Userdistribution from './Components/Userdistribution';
import Courseavailability from './Components/Courseavailability';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated analytics summary data
  const analyticsData = {
    totalUsers: 458,
    totalCourses: 67,
    totalEnrollments: 1284,
    activeUsers: 312,
    completionRate: 68,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleBackClick = () => {
    // Using window.history instead of react-router-dom
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/20 text-white border border-[#D68BF9]/30 rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#D68BF9]/50"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
                <option value="allTime">All Time</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D68BF9]" />
            </div>
            <button
              onClick={handleRefresh}
              className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4 shadow-inner">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-semibold text-[#1B0A3F]">{analyticsData.totalUsers}</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4 shadow-inner">
              <Book size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-xl font-semibold text-[#1B0A3F]">{analyticsData.totalCourses}</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4 shadow-inner">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrollments</p>
              <p className="text-xl font-semibold text-[#1B0A3F]">{analyticsData.totalEnrollments}</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4 shadow-inner">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-semibold text-[#1B0A3F]">{analyticsData.activeUsers}</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4 shadow-inner">
              <PieChart size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-xl font-semibold text-[#1B0A3F]">{analyticsData.completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Enrollment Chart */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-xl font-bold text-[#1B0A3F]">Enrollment Analytics</h2>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <span className="text-sm text-gray-500">Filter:</span>
                <button className="px-3 py-1 text-sm bg-[#F6E6FF] text-[#BF4BF6] rounded-full hover:bg-[#BF4BF6] hover:text-white transition-colors">
                  Courses
                </button>
                <button className="px-3 py-1 text-sm bg-white text-gray-500 rounded-full hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-colors">
                  Categories
                </button>
              </div>
            </div>
            <Enrollment />
          </div>
        </div>
        
        {/* Course Availability and User Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1B0A3F]">Course Availability</h2>
                <button className="p-2 text-[#BF4BF6] hover:bg-[#F6E6FF] rounded-full transition-colors">
                  <Filter size={16} />
                </button>
              </div>
              <Courseavailability />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1B0A3F]">User Distribution</h2>
                <button className="p-2 text-[#BF4BF6] hover:bg-[#F6E6FF] rounded-full transition-colors">
                  <Filter size={16} />
                </button>
              </div>
              <Userdistribution />
            </div>
          </div>
        </div>
        
        {/* Additional Analytics Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1B0A3F]">Performance Metrics</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-[#F6E6FF] text-[#BF4BF6] rounded-full hover:bg-[#BF4BF6] hover:text-white transition-colors">
                  Weekly
                </button>
                <button className="px-3 py-1 text-sm bg-white text-gray-500 rounded-full hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-colors">
                  Monthly
                </button>
                <button className="px-3 py-1 text-sm bg-white text-gray-500 rounded-full hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-colors">
                  Yearly
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold text-[#52007C]">Course Completion</h3>
                <div className="mt-2 flex items-end">
                  <span className="text-3xl font-bold text-[#1B0A3F]">72%</span>
                  <span className="ml-2 text-xs text-green-600 flex items-center">
                    +4.2%
                  </span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] h-2.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold text-[#52007C]">Avg. Session Duration</h3>
                <div className="mt-2 flex items-end">
                  <span className="text-3xl font-bold text-[#1B0A3F]">48m</span>
                  <span className="ml-2 text-xs text-green-600 flex items-center">
                    +2.5%
                  </span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold text-[#52007C]">Learner Satisfaction</h3>
                <div className="mt-2 flex items-end">
                  <span className="text-3xl font-bold text-[#1B0A3F]">4.7</span>
                  <span className="ml-2 text-xs text-red-500 flex items-center">
                    -0.2
                  </span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] h-2.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;