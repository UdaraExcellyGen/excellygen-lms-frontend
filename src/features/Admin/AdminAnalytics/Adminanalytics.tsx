import React from 'react';
import Header from './Components/Header';
import Enrollment from './Components/Enrolmentchart';
import Userdistribution from './Components/Userdistribution';
import Courseavailability from './Components/Courseavailability';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-[#BF4BF6]/20 shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div>
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">Analytics</h1>
              <p className="text-gray-500 font-['Nunito_Sans']">Analytics of Enrollments and Courses</p>
            </div>
          </div>
        </div>
        
        {/* Enrollment Chart */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden">
          <Enrollment />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Availability Chart */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden">
            <Courseavailability />
          </div>
          
          {/* User Distribution Chart */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden">
            <Userdistribution />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;