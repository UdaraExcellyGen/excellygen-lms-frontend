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
  
  // Use memoized values for better performance
  const quickActions = useMemo(() => getQuickActions(navigate), [navigate]);

  // Function to get cached data if available
  const getCachedData = (key: string) => {
    try {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        
        // Check if cache is less than 5 minutes old (300000 ms)
        if (Date.now() - timestamp < 300000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving cached ${key}:`, error);
      return null;
    }
  };

  // Function to cache data
  const cacheData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  };

  // Helper function to fetch user profile and update avatar
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log(`Fetching user profile for user ${userId} to get avatar...`);
      const userProfile = await getUserProfile(userId);
      
      if (userProfile && userProfile.avatar) {
        console.log(`Found avatar in profile: ${userProfile.avatar}`);
        
        // Update user in localStorage with avatar
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.avatar = userProfile.avatar;
          localStorage.setItem('user', JSON.stringify(user));
          console.log("Updated user in localStorage with avatar URL");
          return userProfile.avatar;
        }
      } else {
        console.log("User profile doesn't contain an avatar URL");
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile for avatar:', error);
      return null;
    }
  };

  // Use a counter to avoid infinite loops
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    // Only proceed if auth is initialized
    if (!initialized) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user data directly from localStorage if not available in context
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        
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
        
        // Try to get cached data first for instant loading
        const cachedStats = getCachedData('dashboardStats');
        const cachedNotifications = getCachedData('dashboardNotifications');
        
        if (cachedStats && cachedNotifications) {
          // Use cached data if available
          console.log('Using cached data:', cachedStats);
          setStats(cachedStats);
          setNotifications(cachedNotifications);
          setLoading(false);
          
          // Fetch fresh data in background
          setTimeout(() => fetchFreshData(), 100);
        } else {
          // Fetch data if no cache available
          console.log('No cached data available, fetching fresh data...');
          try {
            const [dashboardStats, notificationsData] = await Promise.all([
              getDashboardStats(),
              getDashboardNotifications()
            ]);
            
            console.log('Fresh data fetched:', dashboardStats);
            setStats(dashboardStats);
            setNotifications(notificationsData);
            
            // Cache the fresh data
            cacheData('dashboardStats', dashboardStats);
            cacheData('dashboardNotifications', notificationsData);
          } catch (fetchError) {
            console.error('Error in main data fetch:', fetchError);
            setError('Failed to load dashboard data. Please try again later.');
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error in fetchDashboardData outer block:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    const fetchFreshData = async () => {
      try {
        // Refresh data in background after showing cached data
        console.log('Fetching fresh data in background...');
        const [dashboardStats, notificationsData] = await Promise.all([
          getDashboardStats(),
          getDashboardNotifications()
        ]);
        
        console.log('Background fetch completed:', dashboardStats);
        setStats(dashboardStats);
        setNotifications(notificationsData);
        
        // Update cache with fresh data
        cacheData('dashboardStats', dashboardStats);
        cacheData('dashboardNotifications', notificationsData);
      } catch (err) {
        console.error('Error updating dashboard data in background:', err);
        // Don't show error for background updates
      }
    };

    fetchDashboardData();
    
    // Force refresh data every 5 minutes to keep dashboard up to date
    const refreshInterval = setInterval(fetchFreshData, 300000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [userDetails, initialized]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
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
      <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <p className="font-semibold text-lg mb-2">Error Loading Dashboard</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Retrieve user data directly from localStorage as backup
  const getUserData = () => {
    if (userDetails) {
      console.log("Using user details from context:", userDetails);
      return userDetails;
    }
    
    try {
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      console.log("Using user data from localStorage:", parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };
  
  const userData = getUserData();
  
  // Log avatar information to help debug
  console.log('User avatar path:', userData?.avatar);

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <Header
        notifications={notifications}
        adminName={userData?.name || "Admin"}
        role="System Administrator"
        avatar={userData?.avatar || null}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
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
      <div className="bg-[#34137C] bg-opacity-80 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
          <h2 className="text-white text-xl font-['Unbounded'] font-bold">Quick Actions</h2>
        </div>

        {/* Quick Actions Grid */}
        <QuickActionsGrid actions={quickActions} />
      </div>
    </div>
  );
};

export default AdminDashboard;