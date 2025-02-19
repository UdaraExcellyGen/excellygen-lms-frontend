import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <Header 
        notifications={initialNotifications}
        coordinatorName="John Doe"
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
          onViewMore={() => navigate('/coordinator/courses')}
        />

        <StatCard
          icon={Users}
          title="Student Overview"
          stats={initialStats.students}
          totalLabel="Total Students"
          activeLabel="Active Students"
          onViewMore={() => navigate('/coordinator/students')}
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