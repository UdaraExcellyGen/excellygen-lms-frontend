import React from 'react';
import EnrollmentChart from './Components/Enrolmentchart';
import UserDistribution from './Components/Userdistribution';
import CourseAvailability from './Components/Courseavailability';
import KpiCards from './Components/KpiCards';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
        
        {/* --- START: NEW HEADER TO MATCH YOUR IMAGE --- */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-200/30 shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              aria-label="Go back to dashboard"
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div>
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">Admin Analytics</h1>
              <p className="text-gray-500 font-['Nunito_Sans']">Gain a Clear View with the Admin Insights Dashboard. </p>
            </div>
          </div>
        </div>
        {/* --- END: NEW HEADER --- */}

        {/* KPI Cards (No changes here) */}
        <KpiCards />
        
        {/* Enrollment Chart Card (No changes here) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-purple-200/30 shadow-lg overflow-hidden">
          <EnrollmentChart />
        </div>
        
        {/* User Distribution Card (No changes here) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-purple-200/30 shadow-lg overflow-hidden">
          <UserDistribution />
        </div>

        {/* Course Availability Card (No changes here) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-purple-200/30 shadow-lg overflow-hidden">
          <CourseAvailability />
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;