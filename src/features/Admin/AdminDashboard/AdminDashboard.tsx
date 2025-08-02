// src/features/Admin/AdminDashboard/AdminDashboard.tsx
// ENTERPRISE OPTIMIZED: Real-time dashboard with instant stats updates
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Cpu, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getDashboardData, 
  clearDashboardCache, 
  refreshDashboardStats,
  setRealTimeMode,
  getDashboardCacheStatus
} from '../../../api/services/AdminDashboard/dashboardService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import { getQuickActions } from './data/dashboardData';
import { Notification } from './types/types';
import { User } from '../../../types/auth.types';
import { DashboardSkeleton, DashboardError } from './components/SkeletonComponents';
import { dashboardEvents } from '../../../utils/dashboardEvents';

// ENTERPRISE: Performance monitoring interface
interface DashboardMetrics {
  loadTime: number;
  cacheHits: number;
  errorCount: number;
  lastRefresh: number;
  eventCount: number;
  realTimeUpdates: number;
}

// ENTERPRISE: Optimized dashboard state management
interface DashboardState {
  stats: {
    courseCategories: { total: number; active: number };
    users: { total: number; active: number };
    technologies: { total: number; active: number };
  };
  notifications: Notification[];
  userAvatar: string | null;
  userData: User | null;
  initialLoadComplete: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: number;
  metrics: DashboardMetrics;
  pendingUpdates: string[]; // Track what's being updated
}

// ENTERPRISE: Smart retry logic with exponential backoff
class RetryManager {
  private retryCount = 0;
  private maxRetries = 3;
  private baseDelay = 1000;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onError?: (error: any, attempt: number) => void
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error) {
        if (onError) onError(error, attempt);
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = this.baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  reset() {
    this.retryCount = 0;
  }
}

// ENTERPRISE: Main AdminDashboard component with real-time updates
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: userDetails } = useAuth();
  const retryManager = useRef(new RetryManager());
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>(); // For debouncing dashboard updates
  const eventCountRef = useRef(0);

  // ENTERPRISE: Consolidated state management
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    stats: {
      courseCategories: { total: 0, active: 0 },
      users: { total: 0, active: 0 },
      technologies: { total: 0, active: 0 }
    },
    notifications: [],
    userAvatar: null,
    userData: null,
    initialLoadComplete: false,
    error: null,
    refreshing: false,
    lastUpdated: 0,
    pendingUpdates: [],
    metrics: {
      loadTime: 0,
      cacheHits: 0,
      errorCount: 0,
      lastRefresh: 0,
      eventCount: 0,
      realTimeUpdates: 0
    }
  });

  // ENTERPRISE: Memoized quick actions for performance
  const quickActions = useMemo(() => getQuickActions(navigate), [navigate]);

  // ENTERPRISE: Optimized user profile fetching with caching
  const fetchUserProfile = useCallback(async (userId: string): Promise<string | null> => {
    try {
      console.log(`⚡ Fetching user profile for avatar: ${userId}`);
      const userProfile = await getUserProfile(userId);

      if (userProfile?.avatar) {
        console.log(`✅ Avatar found: ${userProfile.avatar}`);
        return userProfile.avatar;
      }
      
      console.log("📭 No avatar found in profile");
      return null;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }, []);

  // ENTERPRISE: Smart dashboard data fetching with real-time support
  const fetchDashboardData = useCallback(async (isRefresh = false, triggeredBy = 'manual') => {
    const startTime = performance.now();
    
    try {
      console.log(`🔄 ${isRefresh ? 'Refreshing' : 'Loading'} dashboard data (triggered by: ${triggeredBy})...`);
      
      if (isRefresh) {
        setDashboardState(prev => ({ 
          ...prev, 
          refreshing: true,
          pendingUpdates: [...prev.pendingUpdates, triggeredBy]
        }));
      }

      // ENTERPRISE: Get user data with fallback
      let user: User | null = userDetails;
      if (!user) {
        try {
          const storedUserData = localStorage.getItem('user');
          if (storedUserData) {
            user = JSON.parse(storedUserData);
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }

      // ENTERPRISE: Parallel data fetching for better performance
      const [dashboardResult, avatarResult] = await Promise.allSettled([
        retryManager.current.executeWithRetry(
          () => getDashboardData(),
          (error, attempt) => console.warn(`Dashboard fetch attempt ${attempt} failed:`, error)
        ),
        user?.id && (!user.avatar || user.avatar === null) 
          ? fetchUserProfile(user.id) 
          : Promise.resolve(null)
      ]);

      const loadTime = performance.now() - startTime;

      // ENTERPRISE: Process results with optimistic updates
      setDashboardState(prev => {
        const newState = { ...prev };

        // Update dashboard data
        if (dashboardResult.status === 'fulfilled') {
          newState.stats = dashboardResult.value.stats;
          newState.notifications = dashboardResult.value.notifications;
          newState.error = null;
          newState.lastUpdated = Date.now();
          
          // Increment real-time updates if this was triggered by an event
          if (isRefresh && triggeredBy !== 'manual' && triggeredBy !== 'interval') {
            newState.metrics.realTimeUpdates++;
          }
        } else {
          console.error('Dashboard data fetch failed:', dashboardResult.reason);
          if (!isRefresh) {
            newState.error = 'Failed to load dashboard data. Please try again.';
          }
          newState.metrics.errorCount++;
        }

        // Update avatar
        if (avatarResult.status === 'fulfilled' && avatarResult.value) {
          newState.userAvatar = avatarResult.value;
        }

        // Update user data
        if (user && !prev.userData) {
          newState.userData = user;
        }

        // Update metrics
        newState.metrics = {
          ...prev.metrics,
          loadTime,
          lastRefresh: Date.now(),
          eventCount: eventCountRef.current
        };

        // Mark as initialized
        if (!prev.initialLoadComplete) {
          newState.initialLoadComplete = true;
        }

        // Clear pending updates
        newState.refreshing = false;
        newState.pendingUpdates = prev.pendingUpdates.filter(update => update !== triggeredBy);

        return newState;
      });

      console.log(`✅ Dashboard data ${isRefresh ? 'refreshed' : 'loaded'} in ${loadTime.toFixed(2)}ms (${triggeredBy})`);

    } catch (error: any) {
      console.error('❌ Critical dashboard error:', error);
      
      setDashboardState(prev => ({
        ...prev,
        error: 'Failed to load dashboard data. Please try again.',
        refreshing: false,
        initialLoadComplete: true,
        pendingUpdates: prev.pendingUpdates.filter(update => update !== triggeredBy),
        metrics: {
          ...prev.metrics,
          errorCount: prev.metrics.errorCount + 1,
          loadTime: performance.now() - startTime
        }
      }));
    }
  }, [userDetails, fetchUserProfile]);

  // ENTERPRISE: Smart refresh mechanism with real-time feedback
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual dashboard refresh triggered');
    clearDashboardCache();
    retryManager.current.reset();
    fetchDashboardData(true, 'manual-refresh');
  }, [fetchDashboardData]);

  // ENTERPRISE: Retry with exponential backoff
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying dashboard load...');
    setDashboardState(prev => ({ 
      ...prev, 
      error: null, 
      initialLoadComplete: false 
    }));
    clearDashboardCache();
    retryManager.current.reset();
    fetchDashboardData(false, 'retry');
  }, [fetchDashboardData]);

  // ENTERPRISE: Enhanced real-time event handling
  const handleDashboardEvent = useCallback((event: any) => {
    eventCountRef.current++;
    
    console.log(`🎯 Dashboard received real-time event: ${event.type}`, event.payload);
    
    // ENTERPRISE: Immediate visual feedback for specific events
    setDashboardState(prev => ({
      ...prev,
      pendingUpdates: [...prev.pendingUpdates, event.type]
    }));
    
    // ENTERPRISE: Debounced refresh to prevent multiple rapid updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log(`🔄 Refreshing dashboard due to: ${event.type}`);
      fetchDashboardData(true, event.type);
    }, 300); // 300ms debounce - faster than before for better real-time feel
  }, [fetchDashboardData]);

  // ENTERPRISE: Initialize real-time mode and event listeners
  useEffect(() => {
    // Enable real-time mode for calculated stats
    setRealTimeMode(true);
    
    // Initial load
    fetchDashboardData(false, 'initial-load');

    // ENTERPRISE: Smart background refresh every 3 minutes (reduced from 5)
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Background dashboard refresh');
      fetchDashboardData(true, 'background-interval');
    }, 180000); // 3 minutes

    // ENTERPRISE: Listen for real-time data changes with enhanced event handling
    const unsubscribeFromEvents = dashboardEvents.subscribeToMultiple([
      'user-status-changed',
      'user-created', 
      'user-deleted',
      'category-status-changed',
      'category-created',
      'category-deleted',
      'tech-status-changed',
      'tech-created',
      'tech-deleted',
      'dashboard-refresh-needed'
    ], handleDashboardEvent);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      unsubscribeFromEvents();
    };
  }, [fetchDashboardData, handleDashboardEvent]);

  // ENTERPRISE: Handle critical errors with professional UI
  if (dashboardState.initialLoadComplete && dashboardState.error) {
    return <DashboardError error={dashboardState.error} onRetry={handleRetry} />;
  }

  // ENTERPRISE: Show skeleton during initial load for instant perceived performance
  if (!dashboardState.initialLoadComplete) {
    return <DashboardSkeleton />;
  }

  // ENTERPRISE: Optimized data access
  const { stats, notifications, userAvatar, userData, refreshing, pendingUpdates, lastUpdated, metrics } = dashboardState;
  const currentUserData = userDetails || userData;
  const currentAvatar = userAvatar || currentUserData?.avatar;

  // ENTERPRISE: Determine if any stats are being updated
  const hasUpdatingStats = pendingUpdates.length > 0;

  // ENTERPRISE: Main dashboard render with optimized components
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        
        {/* ENTERPRISE: Header with professional loading states */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg relative z-50">
          <Header
            notifications={notifications}
            adminName={currentUserData?.name || "Admin"}
            role="System Administrator"
            avatar={currentAvatar || null}
          />
          
          {/* ENTERPRISE: Real-time update indicator */}
          {(refreshing || hasUpdatingStats) && (
            <div className="absolute top-0 left-0 right-0 h-1">
              <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] animate-pulse">
                <div className="h-full bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          )}
          
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default relative">
            <StatCard
              icon={Users}
              title="User Management"
              stats={stats.users}
              totalLabel="Total Users"
              activeLabel="Active Users"
              isRefreshing={pendingUpdates.some(update => update.includes('user'))}
            />
            {/* Real-time update indicator */}
            {pendingUpdates.some(update => update.includes('user')) && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default relative">
            <StatCard
              icon={Book}
              title="Course Category Management"
              stats={stats.courseCategories}
              totalLabel="Total Course Categories"
              activeLabel="Active Course Categories"
              isRefreshing={pendingUpdates.some(update => update.includes('category'))}
            />
            {/* Real-time update indicator */}
            {pendingUpdates.some(update => update.includes('category')) && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default relative">
            <StatCard
              icon={Cpu}
              title="Technology Management"
              stats={stats.technologies}
              totalLabel="Total Technologies"
              activeLabel="Active Technologies"
              isRefreshing={pendingUpdates.some(update => update.includes('tech'))}
            />
            {/* Real-time update indicator */}
            {pendingUpdates.some(update => update.includes('tech')) && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* ENTERPRISE: Quick Actions with optimized performance */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
              <h2 className="text-white text-xl font-['Unbounded'] font-bold">Quick Actions</h2>
            </div>
            
            
          </div>

          <MemoizedQuickActionsGrid actions={quickActions} />
        </div>

        {/* ENTERPRISE: Real-time metrics for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-white/50 text-xs space-y-1">
            <div>
              Load: {metrics.loadTime.toFixed(0)}ms | 
              Errors: {metrics.errorCount} | 
              Events: {metrics.eventCount} | 
              Real-time Updates: {metrics.realTimeUpdates}
            </div>
            <div>
              Last refresh: {new Date(metrics.lastRefresh).toLocaleTimeString()} | 
              Cache: {getDashboardCacheStatus().hasStatsCache ? 'Active' : 'Empty'}
            </div>
            {pendingUpdates.length > 0 && (
              <div>Pending updates: {pendingUpdates.join(', ')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ENTERPRISE: Memoized components for optimal performance
const MemoizedQuickActionsGrid = React.memo(QuickActionsGrid);

export default AdminDashboard;