import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import Header from './components/Header';
import StatCard from './components/StatCard';
import NotificationCard from './components/NotificationCard';
import QuickActionsGrid from './components/QuickActionsGrid';

import { 
  initialNotifications, 
  initialStats, 
  getQuickActions 
} from './data/dashboardData';

const CourseCoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentRole } = useAuth(); // Use auth context

  // If user data is not available in auth context, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-[#52007C] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header Section - Pass user data from auth context */}
      <Header 
        notifications={initialNotifications}
        coordinatorName={user.name || "Course Coordinator"}
        role="Course Coordinator"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <StatCard
          icon={BookOpen}
          title="Course Management"
          stats={initialStats.courses}
          totalLabel="Total Courses"
          activeLabel="Active Courses"
          onViewMore={() => navigate('/coordinator/course-display-page')}
        />

        <StatCard
          icon={Users}
          title="Student Overview"
          stats={initialStats.students}
          totalLabel="Total Students"
          activeLabel="Enrolled Students"
          onViewMore={() => navigate('/coordinator/learner-list')}
        />

        <NotificationCard 
          notifications={initialNotifications}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid 
        actions={getQuickActions(navigate)} 
      />
    </div>
  );
};

export default CourseCoordinatorDashboard;