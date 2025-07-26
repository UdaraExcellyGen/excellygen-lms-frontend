import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Users,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDashboardData } from '../../../api/services/AdminDashboard/dashboardService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import { getQuickActions } from './data/dashboardData';
// FIXED: Import Notification from local types instead of common types
import { Notification } from './types/types';
import { User } from '../../../types/auth.types';

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: userDetails } = useAuth();

  // States for dashboard data
  const [stats, setStats] = useState({
    courseCategories: { total: 0, active: 0 },
    users: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  // Use memoized values for better performance
  const quickActions = useMemo(() => getQuickActions(navigate), [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log(`Fetching user profile for user ${userId} to get avatar...`);
      const userProfile = await getUserProfile(userId);

      if (userProfile && userProfile.avatar) {
        console.log(`Found avatar in profile: ${userProfile.avatar}`);
        setUserAvatar(userProfile.avatar);
        return userProfile.avatar;
      } else {
        console.log("User profile doesn't contain an avatar URL");
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile for avatar:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Starting dashboard data fetch...');

        let user: User | null = userDetails;

        // Try to get user from localStorage as fallback
        if (!user) {
          try {
            const storedUserData = localStorage.getItem('user');
            if (storedUserData) {
              user = JSON.parse(storedUserData);
              setUserData(user);
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }

        if (user && user.id && (!user.avatar || user.avatar === undefined || user.avatar === null)) {
          await fetchUserProfile(user.id);
        }

        const { stats: dashboardStats, notifications: notificationsData } = await getDashboardData();

        console.log('Dashboard data fetched successfully');
        setStats(dashboardStats);
        setNotifications(notificationsData);
        setError(null);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = 'Failed to load dashboard data. Please try again later.';
        setError(errorMessage);
      } finally {
        setIsInitialized(true);
        console.log('Dashboard initialization completed');
      }
    };

    fetchDashboardData();

    const refreshInterval = setInterval(() => {
      // Background refresh without showing loading
      getDashboardData().then(({ stats: dashboardStats, notifications: notificationsData }) => {
        console.log('Background dashboard refresh completed');
        setStats(dashboardStats);
        setNotifications(notificationsData);
      }).catch(err => {
        console.error('Background refresh failed:', err);
      });
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, [userDetails]);

  if (isInitialized && error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg text-red-700 px-6 py-4 max-w-lg">
          <p className="font-semibold text-lg mb-2 text-[#1B0A3F]">Error Loading Dashboard</p>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const currentUserData = userDetails || userData;
  const currentAvatar = userAvatar || currentUserData?.avatar;

  console.log('Current user data:', currentUserData);
  console.log('Current avatar:', currentAvatar);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg relative z-50">
          <Header
            notifications={notifications}
            adminName={currentUserData?.name || "Admin"}
            role="System Administrator"
            avatar={currentAvatar || null}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={Book}
              title="Course Category Management"
              stats={stats.courseCategories}
              totalLabel="Total Course Categories"
              activeLabel="Active Course Categories"
            />
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={Users}
              title="User Management"
              stats={stats.users}
              totalLabel="Total Users"
              activeLabel="Active Users"
            />
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={Cpu}
              title="Technology Management"
              stats={stats.technologies}
              totalLabel="Total Technologies"
              activeLabel="Active Technologies"
            />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
            <h2 className="text-white text-xl font-['Unbounded'] font-bold">Quick Actions</h2>
          </div>

          {/* Quick Actions Grid */}
          <QuickActionsGrid actions={quickActions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;