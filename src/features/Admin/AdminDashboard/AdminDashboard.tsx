// src/features/Admin/AdminDashboard/AdminDashboard.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX like Google/Microsoft
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Users,
  Cpu,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDashboardData } from '../../../api/services/AdminDashboard/dashboardService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import { getQuickActions } from './data/dashboardData';
import { Notification } from './types/types';
import { User } from '../../../types/auth.types';

// ENTERPRISE: Professional skeleton loader for instant loading experience
const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
      
      {/* Header Skeleton */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg">
        <div className="p-4 sm:p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gray-200"></div>
              <div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="h-12 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div>
                <div className="h-12 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
          <div className="h-6 bg-white/20 rounded w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Error state with professional styling
const ErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void;
  onRefresh: () => void;
}> = ({ error, onRetry, onRefresh }) => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
    <div className="bg-white/90 backdrop-blur-md rounded-xl border border-red-200 shadow-lg text-center max-w-lg p-8">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="font-semibold text-xl mb-3 text-[#1B0A3F]">Dashboard Error</h2>
      <p className="text-gray-700 mb-6">{error}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        <button
          onClick={onRefresh}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Main AdminDashboard Component - Optimized for instant loading
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: userDetails } = useAuth();

  // ENTERPRISE: States for dashboard data with optimistic updates
  const [stats, setStats] = useState({
    courseCategories: { total: 0, active: 0 },
    users: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [backgroundRefreshCount, setBackgroundRefreshCount] = useState(0);

  // ENTERPRISE: Memoized quick actions for performance
  const quickActions = useMemo(() => getQuickActions(navigate), [navigate]);

  // ENTERPRISE: Smart user profile fetching with caching
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log(`⚡ Fetching user profile for user ${userId}...`);
      const userProfile = await getUserProfile(userId);

      if (userProfile && userProfile.avatar) {
        console.log(`✅ Avatar loaded: ${userProfile.avatar}`);
        setUserAvatar(userProfile.avatar);
        return userProfile.avatar;
      } else {
        console.log("ℹ️ No avatar found in user profile");
      }
      return null;
    } catch (error) {
      console.warn('Warning: Could not fetch user avatar:', error);
      return null;
    }
  }, []);

  // ENTERPRISE: Optimistic dashboard data fetching
  const fetchDashboardData = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        console.log('🔄 Loading dashboard data...');
        setError(null);
      }

      // ENTERPRISE: Handle user data optimistically
      let user: User | null = userDetails;
      
      if (!user) {
        try {
          const storedUserData = localStorage.getItem('user');
          if (storedUserData) {
            user = JSON.parse(storedUserData);
            setUserData(user);
          }
        } catch (error) {
          console.warn('Warning: Could not parse stored user data:', error);
        }
      }

      // ENTERPRISE: Fetch avatar only if needed
      if (user && user.id && (!user.avatar || user.avatar === undefined || user.avatar === null)) {
        await fetchUserProfile(user.id);
      }

      // ENTERPRISE: Fetch dashboard data with error handling
      const { stats: dashboardStats, notifications: notificationsData } = await getDashboardData();

      // ENTERPRISE: Optimistic updates
      setStats(dashboardStats);
      setNotifications(notificationsData);
      setError(null);

      if (!isBackgroundRefresh) {
        setInitialLoadComplete(true);
        console.log('✅ Dashboard data loaded successfully');
      } else {
        setBackgroundRefreshCount(prev => prev + 1);
        console.log(`🔄 Background refresh #${backgroundRefreshCount + 1} completed`);
      }

    } catch (err: any) {
      console.error('❌ Dashboard data fetch failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data. Please check your connection.';
      
      if (!isBackgroundRefresh) {
        setError(errorMessage);
        setInitialLoadComplete(true);
      } else {
        // ENTERPRISE: Silent background failures don't update UI
        console.warn('Background refresh failed, keeping existing data');
      }
    }
  }, [userDetails, fetchUserProfile, backgroundRefreshCount]);

  // ENTERPRISE: Initial load effect
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // ENTERPRISE: Smart background refresh with longer intervals
  useEffect(() => {
    // ENTERPRISE: Background refresh every 5 minutes (less aggressive than before)
    const refreshInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 300000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // ENTERPRISE: Retry handlers
  const handleRetry = useCallback(() => {
    setError(null);
    setInitialLoadComplete(false);
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // ENTERPRISE: Error state with professional styling
  if (initialLoadComplete && error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={handleRetry}
        onRefresh={handleRefresh}
      />
    );
  }

  // ENTERPRISE: Instant skeleton loading during initial load
  if (!initialLoadComplete) {
    return <DashboardSkeleton />;
  }

  // ENTERPRISE: Prepare user data for display
  const currentUserData = userDetails || userData;
  const currentAvatar = userAvatar || currentUserData?.avatar;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        
        {/* ENTERPRISE: Header Section with enhanced glass morphism */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300 relative z-50">
          <Header
            notifications={notifications}
            adminName={currentUserData?.name || "Admin"}
            role="System Administrator"
            avatar={currentAvatar || null}
          />
        </div>

        {/* ENTERPRISE: Stats Grid with enhanced hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:z-20">
            <StatCard
              icon={Book}
              title="Course Category Management"
              stats={stats.courseCategories}
              totalLabel="Total Course Categories"
              activeLabel="Active Course Categories"
            />
          </div>

          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:z-20">
            <StatCard
              icon={Users}
              title="User Management"
              stats={stats.users}
              totalLabel="Total Users"
              activeLabel="Active Users"
            />
          </div>

          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:z-20">
            <StatCard
              icon={Cpu}
              title="Technology Management"
              stats={stats.technologies}
              totalLabel="Total Technologies"
              activeLabel="Active Technologies"
            />
          </div>
        </div>

        {/* ENTERPRISE: Quick Actions Section with professional glass theme */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#BF4BF6] to-[#D68BF9] rounded-full"></div>
            <h2 className="text-white text-xl font-['Unbounded'] font-bold">Quick Actions</h2>
            
            {/* ENTERPRISE: Background refresh indicator */}
            {backgroundRefreshCount > 0 && (
              <div className="ml-auto flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/80">Live</span>
              </div>
            )}
          </div>

          {/* ENTERPRISE: Enhanced Quick Actions Grid */}
          <QuickActionsGrid actions={quickActions} />
        </div>

        {/* ENTERPRISE: Subtle background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#BF4BF6]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#D68BF9]/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;