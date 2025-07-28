// src/features/Learner/LearnerDashboard/LearnerDashboard.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX like Google/Microsoft
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calendar, FileText, Users, ChevronDown, Check } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/auth.types';
import { Course, Activity, DailyLearningTime } from './types/types';
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { getEnrolledCoursesForLearner, getLearnerCourseDetails } from '../../../api/services/Course/learnerCourseService';
import { getRecentlyAccessedCourseIds } from '../../../api/services/Course/courseAccessService';
import { getRecentActivities } from '../../../api/services/LearnerDashboard/learnerActivitiesService';
import { getWeeklyActivity } from '../../../api/services/LearnerDashboard/learnerOverallStatsService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';

// ENTERPRISE: Professional skeleton loaders for instant perceived performance
const WelcomeSkeleton: React.FC = React.memo(() => (
  <div className="animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 border-b border-white/10 pb-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-white/20"></div>
        <div>
          <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
          <div className="h-5 bg-white/20 rounded w-32"></div>
        </div>
      </div>
      <div className="h-8 bg-white/20 rounded w-32"></div>
    </div>
    
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
        <div className="w-full z-10">
          <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <div className="h-6 bg-white/20 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// ENTERPRISE: Smart caching and request deduplication
class DashboardCache {
  private cache = new Map<string, { data: any; timestamp: number; expiry: number }>();
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.DEFAULT_TTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const dashboardCache = new DashboardCache();
const activeRequests = new Map<string, Promise<any>>();

// ENTERPRISE: Professional request deduplication
function dedupedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`⚡ Deduped dashboard request: ${key}`);
    return activeRequests.get(key)!;
  }

  const promise = requestFn().finally(() => {
    setTimeout(() => {
      activeRequests.delete(key);
    }, 1000);
  });

  activeRequests.set(key, promise);
  return promise;
}

// ENTERPRISE: Optimized main component with instant loading
const LearnerDashboard: React.FC = () => {
  const { user, currentRole, selectRole, navigateToRoleSelection } = useAuth();
  
  // ENTERPRISE: Date state optimization
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  
  // ENTERPRISE: Dropdown state optimization
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // ENTERPRISE: Replace blocking loading with instant loading pattern
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [coursesInitialLoadComplete, setCoursesInitialLoadComplete] = useState(false);

  const [learningActivity, setLearningActivity] = useState<DailyLearningTime[]>([]);
  const [activityInitialLoadComplete, setActivityInitialLoadComplete] = useState(false);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesInitialLoadComplete, setActivitiesInitialLoadComplete] = useState(false);

  const [userJobRole, setUserJobRole] = useState<string>('Learner');
  const [roleInitialLoadComplete, setRoleInitialLoadComplete] = useState(false);

  // ENTERPRISE: Header initial load state
  const [headerInitialLoadComplete, setHeaderInitialLoadComplete] = useState(false);

  // ENTERPRISE: Optimized user profile fetching with smart caching
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    const cacheKey = `user_profile_${user.id}`;
    const cachedProfile = dashboardCache.get(cacheKey);
    
    if (cachedProfile) {
      setUserJobRole(cachedProfile.jobRole || 'Learner');
      setRoleInitialLoadComplete(true);
      return;
    }

    return dedupedRequest(cacheKey, async () => {
      try {
        const profile = await getUserProfile(user.id);
        if (profile && profile.jobRole) {
          setUserJobRole(profile.jobRole);
          dashboardCache.set(cacheKey, profile);
        }
      } catch (error) {
        console.error("Failed to fetch user job role for dashboard:", error);
        // Keep default 'Learner' role on error
      } finally {
        setRoleInitialLoadComplete(true);
      }
    });
  }, [user?.id]);

  // ENTERPRISE: Optimized active courses fetching with smart caching
  const fetchActiveCourses = useCallback(async () => {
    const cacheKey = `active_courses_${user?.id}`;
    const cachedCourses = dashboardCache.get<Course[]>(cacheKey);
    
    if (cachedCourses) {
      setActiveCourses(cachedCourses);
      setCoursesInitialLoadComplete(true);
      return;
    }

    return dedupedRequest(cacheKey, async () => {
      try {
        const allEnrolledCourses = await getEnrolledCoursesForLearner();
        
        if (!allEnrolledCourses || allEnrolledCourses.length === 0) {
          setActiveCourses([]);
          dashboardCache.set(cacheKey, [], 1 * 60 * 1000); // 1 minute cache for empty results
          setCoursesInitialLoadComplete(true);
          return;
        }

        const recentIds = getRecentlyAccessedCourseIds();

        const sortedCourses = [...allEnrolledCourses].sort((a, b) => {
          const indexA = recentIds.indexOf(a.id);
          const indexB = recentIds.indexOf(b.id);
          const sortA = indexA === -1 ? Infinity : indexA;
          const sortB = indexB === -1 ? Infinity : indexB;
          return sortA - sortB;
        });
        
        const topThreeCourses = sortedCourses.slice(0, 3);

        const detailedCoursePromises = topThreeCourses.map(course =>
          getLearnerCourseDetails(course.id)
        );

        const detailedCourses = await Promise.all(detailedCoursePromises);

        const formattedActiveCourses: Course[] = detailedCourses.map(course => ({
          id: course.id,
          title: course.title,
          progress: course.progressPercentage,
        }));

        setActiveCourses(formattedActiveCourses);
        dashboardCache.set(cacheKey, formattedActiveCourses);
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error("Failed to fetch active courses:", error);
          setActiveCourses([]);
        }
      } finally {
        setCoursesInitialLoadComplete(true);
      }
    });
  }, [user?.id]);

  // ENTERPRISE: Optimized learning activity fetching with smart caching
  const fetchLearningActivity = useCallback(async () => {
    const cacheKey = `learning_activity_${user?.id}`;
    const cachedActivity = dashboardCache.get<DailyLearningTime[]>(cacheKey);
    
    if (cachedActivity) {
      setLearningActivity(cachedActivity);
      setActivityInitialLoadComplete(true);
      return;
    }

    return dedupedRequest(cacheKey, async () => {
      try {
        const weeklyData = await getWeeklyActivity();
        setLearningActivity(weeklyData);
        dashboardCache.set(cacheKey, weeklyData, 1 * 60 * 1000); // 1 minute cache for activity data
      } catch (error) {
        console.error("Failed to fetch learning activity", error);
        setLearningActivity([]);
      } finally {
        setActivityInitialLoadComplete(true);
      }
    });
  }, [user?.id]);

  // ENTERPRISE: Optimized recent activities fetching with smart caching
  const fetchRecentActivities = useCallback(async () => {
    const cacheKey = `recent_activities_${user?.id}`;
    const cachedActivities = dashboardCache.get<Activity[]>(cacheKey);
    
    if (cachedActivities) {
      setRecentActivities(cachedActivities);
      setActivitiesInitialLoadComplete(true);
      return;
    }

    return dedupedRequest(cacheKey, async () => {
      try {
        const activities = await getRecentActivities();
        setRecentActivities(activities);
        dashboardCache.set(cacheKey, activities, 30 * 1000); // 30 seconds cache for recent activities
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error("Failed to fetch recent activities:", error);
          setRecentActivities([]);
        }
      } finally {
        setActivitiesInitialLoadComplete(true);
      }
    });
  }, [user?.id]);

  // ENTERPRISE: Optimized main data fetching effect
  useEffect(() => {
    const controller = new AbortController();

    if (user?.id) {
      // ENTERPRISE: Instant header load
      setHeaderInitialLoadComplete(true);
      
      // ENTERPRISE: Parallel data fetching for better performance
      Promise.all([
        fetchUserProfile(),
        fetchActiveCourses(),
        fetchLearningActivity(),
        fetchRecentActivities()
      ]).catch(error => {
        console.warn('Some dashboard data failed to load:', error);
      });
    }

    return () => {
      controller.abort();
    };
  }, [user, fetchUserProfile, fetchActiveCourses, fetchLearningActivity, fetchRecentActivities]);

  // ENTERPRISE: Optimized date effect with memoization
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    setCurrentDate(formattedDate);
    setCurrentDay(day);
  }, []);

  // ENTERPRISE: Optimized dropdown click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // ENTERPRISE: Optimized callbacks with useCallback
  const toggleDropdown = useCallback(() => setDropdownOpen(!dropdownOpen), [dropdownOpen]);

  const formatRoleName = useCallback((role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  }, []);

  const handleSwitchRole = useCallback(async (role: UserRole) => {
    if (role === currentRole) {
      setDropdownOpen(false);
      return;
    }
    setDropdownOpen(false);
    try {
      await selectRole(role);
      // ENTERPRISE: Invalidate cache on role switch
      dashboardCache.clear();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  }, [currentRole, selectRole]);

  const handleViewAllRoles = useCallback(() => {
    setDropdownOpen(false);
    navigateToRoleSelection();
  }, [navigateToRoleSelection]);

  // ENTERPRISE: Memoized role icons for performance
  const roleIcons: Record<string, React.ReactNode> = useMemo(() => ({
    Admin: <Users size={16} />,
    Learner: <FileText size={16} />,
    CourseCoordinator: <Calendar size={16} />,
    ProjectManager: <FileText size={16} />
  }), []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 flex flex-col font-nunito">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 flex-grow">
          <div className="mb-2">
            <div className="p-2">
              {/* ENTERPRISE: Instant header display */}
              {!headerInitialLoadComplete ? (
                <WelcomeSkeleton />
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 border-b border-white/10 pb-6 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Calendar className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Welcome back</p>
                        <h2 className="text-lg font-medium text-white">{currentDate}, {currentDay}</h2>
                      </div>
                    </div>

                    {user && user.roles && user.roles.length > 1 && (
                      <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
                        <button 
                          onClick={toggleDropdown}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-md transition-all duration-300 backdrop-blur-md border border-white/20 text-sm"
                        >
                          <span className="text-sm">Role: {currentRole && formatRoleName(currentRole as string)}</span>
                          <ChevronDown 
                            size={14} 
                            className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {dropdownOpen && (
                          <div className="fixed right-auto mt-1 w-48 rounded-md shadow-xl bg-[#1B0A3F]/90 backdrop-blur-lg border border-[#BF4BF6]/40 overflow-hidden" style={{ zIndex: 9999 }}>
                            <div className="text-xs text-white/80 px-3 py-1.5 border-b border-white/10 bg-[#BF4BF6]/20">Switch Role</div>
                            <div className="py-1">
                              {user.roles.map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleSwitchRole(role as UserRole)}
                                  className={`flex items-center w-full text-left px-3 py-1.5 text-xs transition-colors duration-200 ${role === currentRole ? 'bg-[#BF4BF6]/30 text-white font-medium' : 'text-white/80 hover:bg-[#BF4BF6]/20 hover:text-white'}`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="w-4 h-4 flex items-center justify-center">{roleIcons[role] || <Users size={12} />}</span>
                                      <span>{formatRoleName(role)}</span>
                                    </div>
                                    {role === currentRole && <Check size={12} className="text-white" />}
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-white/10">
                              <button onClick={handleViewAllRoles} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-[#BF4BF6]/20 hover:text-white transition-colors">View All Roles</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
                      <div className="w-full z-10">
                        <h1 className="text-2xl md:text-3xl font-bold font-['Unbounded'] mb-2 text-white">Hi, {user ? user.name : 'Learner Name'} 👋</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                          <p className="text-[#D68BF9] px-3 py-1 bg-white/10 rounded-full text-sm">
                            {roleInitialLoadComplete ? userJobRole : '...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ENTERPRISE: Instant grid display with selective loading for individual components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActiveCourses 
              courses={activeCourses} 
              isLoading={!coursesInitialLoadComplete} 
            />
            <RecentActivities 
              activities={recentActivities} 
              isLoading={!activitiesInitialLoadComplete} 
            />
            <LearningActivityChart 
              data={learningActivity} 
              isLoading={!activityInitialLoadComplete} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default React.memo(LearnerDashboard);