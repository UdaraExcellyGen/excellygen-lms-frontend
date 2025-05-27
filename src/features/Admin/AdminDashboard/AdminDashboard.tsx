import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Users, 
  Cpu, 
  Loader
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDashboardStats, getDashboardNotifications } from '../../../api/services/AdminDashboard/dashboardService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import { getQuickActions } from './data/dashboardData';

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userDetails, initialized } = useAuth();
  
  // States for dashboard data
  const [stats, setStats] = useState({
    courseCategories: { total: 0, active: 0 },
    users: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Use memoized values for better performance
  const quickActions = useMemo(() => getQuickActions(navigate), [navigate]);

  // Use a counter to avoid infinite loops
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  // Helper function to fetch user profile and update avatar
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
    // Only proceed if auth is initialized
    if (!initialized) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user data from context or local state
        let user = userDetails;
        
        // Try to get user from localStorage as fallback
        if (!user) {
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              user = JSON.parse(userData);
              setUserData(user);
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
        
        // If we have user but no avatar, fetch the profile to get the avatar
        if (user && user.id && (!user.avatar || user.avatar === undefined || user.avatar === null)) {
          await fetchUserProfile(user.id);
        }
        
        // If we still don't have user details and haven't exceeded max retries
        if (!userDetails && !user && retryCountRef.current < maxRetries) {
          console.log(`User details not yet loaded, retrying... (${retryCountRef.current + 1}/${maxRetries})`);
          retryCountRef.current += 1;
          setTimeout(fetchDashboardData, 500); // Longer delay for retry
          return;
        }
        
        // If we've exceeded max retries, continue anyway
        if (retryCountRef.current >= maxRetries) {
          console.log('Max retries reached, continuing without full user details');
        }
        
        const displayName = userDetails?.name || user?.name || "Admin";
        console.log('Proceeding with data fetch, using name:', displayName);
        
        // Fetch fresh data
        try {
          const [dashboardStats, notificationsData] = await Promise.all([
            getDashboardStats(),
            getDashboardNotifications()
          ]);
          
          console.log('Fresh data fetched:', dashboardStats);
          setStats(dashboardStats);
          setNotifications(notificationsData);
        } catch (fetchError) {
          console.error('Error in main data fetch:', fetchError);
          setError('Failed to load dashboard data. Please try again later.');
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchDashboardData outer block:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up refresh interval
    const refreshInterval = setInterval(() => {
      const fetchFreshData = async () => {
        try {
          // Refresh data in background
          console.log('Fetching fresh data in background...');
          const [dashboardStats, notificationsData] = await Promise.all([
            getDashboardStats(),
            getDashboardNotifications()
          ]);
          
          console.log('Background fetch completed:', dashboardStats);
          setStats(dashboardStats);
          setNotifications(notificationsData);
        } catch (err) {
          console.error('Error updating dashboard data in background:', err);
          // Don't show error for background updates
        }
      };
      
      fetchFreshData();
    }, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [userDetails, initialized]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div className="text-xl">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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

  // Get the user data from context or state
  const currentUserData = userDetails || userData;
  
  // Log avatar information to help debug
  const currentAvatar = userAvatar || currentUserData?.avatar;
  console.log('User avatar path:', currentAvatar);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Header Section - REMOVED overflow-hidden */}
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