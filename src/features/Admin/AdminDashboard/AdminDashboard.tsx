import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Cpu } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <Header
        notifications={initialNotifications}
        adminName={currentUser?.name || "Admin Name"}
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
          onViewMore={() => navigate('/admin/view-categories')}
        />

        <StatCard
          icon={Users}
          title="User Management"
          stats={initialStats.users}
          totalLabel="Total Users"
          activeLabel="Active Users"
          onViewMore={() => navigate('/admin/view-users')}
        />

        <StatCard
          icon={Cpu}
          title="Technology Management"
          stats={initialStats.technologies}
          totalLabel="Total Technologies"
          activeLabel="Active Technologies"
          onViewMore={() => navigate('/admin/view-techs')}
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