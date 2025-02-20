import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { courses, activities, weeklyTimeData } from './data/mockData';
import LearnerHeaderImage from '../../../assets/LearnerHeader.svg';

const LearnerDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Top row with welcome and date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Calendar className="text-white w-6 h-6" />
                </div>
                <div className="text-white">
                  <p className="text-sm text-white/70">Welcome back</p>
                  <h2 className="text-lg font-medium">20 Jan 2024, Monday</h2>
                </div>
              </div>
            </div>
            
            {/* Profile and Illustration Section */}
            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
                <div className="w-full md:w-auto z-10">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-unbounded mb-2">Anna Morrish</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <p className="text-[#D68BF9] px-3 py-1 bg-white/5 rounded-full text-sm">Software Engineer</p>
                      <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
                      
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        className="bg-[#BF4BF6] hover:bg-[#A030D6] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium text-sm group"
                      >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Generate CV
                      </button>
                      <button 
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium text-sm"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Illustration */}
                <div className="md:ml-auto">
                  <img 
                    src={LearnerHeaderImage}
                    alt="Developer illustration" 
                    className="h-40 md:h-52 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Courses Section */}
            <ActiveCourses courses={courses} />

            {/* Recent Activities Section */}
            <RecentActivities activities={activities} />

            {/* Learning Activity Chart */}
            <LearningActivityChart data={weeklyTimeData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearnerDashboard;