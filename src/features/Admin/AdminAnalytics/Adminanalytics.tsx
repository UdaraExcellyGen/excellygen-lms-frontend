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
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      {/* --- START: CONTAINER WITH CONSISTENT PADDING --- */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        
        {/* --- START: ELEGANT & PROFESSIONAL HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 mr-2 text-[#D68BF9] hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-white font-['Unbounded']">Admin Analytics</h1>
                <p className="text-white/80 font-['Nunito_Sans'] mt-1">Gain a Clear View with the Admin Insights Dashboard.</p>
            </div>
          </div>
        </div>
        {/* --- END: ELEGANT & PROFESSIONAL HEADER --- */}

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
      {/* --- END: CONTAINER --- */}
    </div>
  );
};

export default AdminAnalytics;