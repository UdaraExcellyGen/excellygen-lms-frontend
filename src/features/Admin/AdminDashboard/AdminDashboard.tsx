import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Cpu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; // Import auth context

// Import components
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';

// Import data
import {
  initialNotifications,
  initialStats,
  getQuickActions
} from './data/dashboardData';

const AdminDashboard: React.FC = () => {
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
        adminName={user.name || "Admin Name"}
        role="System Administrator"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <StatCard
          icon={Book}
          title="Course Category Management"
          stats={initialStats.coordinators}
          totalLabel="Total Course Categories"
          activeLabel="Active Course Categories"
          onViewMore={() => navigate('/admin/course-categories')}
        />

        <StatCard
          icon={Users}
          title="User Management"
          stats={initialStats.users}
          totalLabel="Total Users"
          activeLabel="Active Users"
          onViewMore={() => navigate('/admin/manage-users')}
        />

        <StatCard
          icon={Cpu}
          title="Technology Management"
          stats={initialStats.technologies}
          totalLabel="Total Technologies"
          activeLabel="Active Technologies"
          onViewMore={() => navigate('/admin/manage-tech')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid
        actions={getQuickActions(navigate)}
      />
    </div>
  );
};

export default AdminDashboard;