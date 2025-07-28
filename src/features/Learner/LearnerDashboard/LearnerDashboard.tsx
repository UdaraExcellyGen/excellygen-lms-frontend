// src/features/Learner/LearnerDashboard/LearnerDashboard.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX like Google/Microsoft
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calendar, FileText, Users, ChevronDown, Check } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/auth.types';
import { Course, Activity, DailyLearningTime } from './types/types';
import { LearnerCourseDto } from '../../../types/course.types'; 
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { getLearnerCourseDetails } from '../../../api/services/Course/learnerCourseService';
import { getRecentlyAccessedCourseIds, removeCourseFromRecents } from '../../../api/services/Course/courseAccessService';
import { getRecentActivities } from '../../../api/services/LearnerDashboard/learnerActivitiesService';
import { getWeeklyActivity, dashboardCache } from '../../../api/services/LearnerDashboard/learnerOverallStatsService';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import { addLearnerDashboardRefreshListener, LearnerDashboardEvent } from '../../../utils/learnerDashboardEvents';

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

// ENTERPRISE: Optimized main component with instant loading and real-time updates
const LearnerDashboard: React.FC = () => {
  const { user, currentRole, selectRole, navigateToRoleSelection } = useAuth();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [coursesInitialLoadComplete, setCoursesInitialLoadComplete] = useState(false);

  const [learningActivity, setLearningActivity] = useState<DailyLearningTime[]>([]);
  const [activityInitialLoadComplete, setActivityInitialLoadComplete] = useState(false);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesInitialLoadComplete, setActivitiesInitialLoadComplete] = useState(false);

  const [userJobRole, setUserJobRole] = useState<string>('Learner');
  const [roleInitialLoadComplete, setRoleInitialLoadComplete] = useState(false);

  const [headerInitialLoadComplete, setHeaderInitialLoadComplete] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;
    const cacheKey = `user_profile_${user.id}`;
    const cachedProfile = dashboardCache.get<{ jobRole: string }>(cacheKey);
    if (cachedProfile) {
      setUserJobRole(cachedProfile.jobRole || 'Learner');
      setRoleInitialLoadComplete(true);
      return;
    }
    try {
      const profile = await getUserProfile(user.id);
      if (profile && profile.jobRole) {
        setUserJobRole(profile.jobRole);
        dashboardCache.set(cacheKey, { jobRole: profile.jobRole });
      }
    } catch (error) {
      console.error("Failed to fetch user job role for dashboard:", error);
    } finally {
      setRoleInitialLoadComplete(true);
    }
  }, [user?.id]);

  const fetchActiveCourses = useCallback(async () => {
    if (!user?.id) {
      setActiveCourses([]);
      setCoursesInitialLoadComplete(true);
      return;
    }

    setCoursesInitialLoadComplete(false);

    try {
      // Pass the user ID to get the correct user's list
      const recentIds = getRecentlyAccessedCourseIds(user.id);
      
      const MAX_COURSES_TO_SHOW = 3;
      // Fetch a buffer to account for potential failures
      const idsToFetch = recentIds.slice(0, MAX_COURSES_TO_SHOW + 2);

      if (idsToFetch.length === 0) {
          setActiveCourses([]);
          setCoursesInitialLoadComplete(true);
          return;
      }

      const courseDetailPromises = idsToFetch.map(id => getLearnerCourseDetails(id));
      const results = await Promise.allSettled(courseDetailPromises);

      const validCourses: LearnerCourseDto[] = [];
      
      results.forEach((result, index) => {
          const courseId = idsToFetch[index];
          if (result.status === 'fulfilled') {
              validCourses.push(result.value);
          } else {
              console.warn(`[Dashboard] Could not fetch course ${courseId}. It was likely unenrolled or deleted. Removing from recents list.`);
              // Pass the user ID to remove from the correct user's list
              removeCourseFromRecents(courseId, user.id);
          }
      });

      // Take the first 3 successful courses to display
      const finalCoursesToShow = validCourses.slice(0, MAX_COURSES_TO_SHOW);

      const formattedActiveCourses: Course[] = finalCoursesToShow.map(course => ({
        id: course.id,
        title: course.title,
        progress: course.progressPercentage,
      }));

      setActiveCourses(formattedActiveCourses);

    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        console.error("A critical error occurred while fetching active courses details:", error);
        setActiveCourses([]);
      }
    } finally {
      setCoursesInitialLoadComplete(true);
    }
  }, [user?.id]);

  const fetchLearningActivity = useCallback(async () => {
    setActivityInitialLoadComplete(false);
    try {
      const weeklyData = await getWeeklyActivity();
      setLearningActivity(weeklyData);
    } catch (error) {
      console.error("Failed to fetch learning activity", error);
    } finally {
      setActivityInitialLoadComplete(true);
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    setActivitiesInitialLoadComplete(false);
    try {
      const activities = await getRecentActivities();
      setRecentActivities(activities);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        console.error("Failed to fetch recent activities:", error);
      }
    } finally {
      setActivitiesInitialLoadComplete(true);
    }
  }, []);
  
  useEffect(() => {
    const handleRefresh = (event: CustomEvent<LearnerDashboardEvent>) => {
      const reason = event.detail;
      console.log(`[LearnerDashboard] Received refresh event for: ${reason}`);
      
      if (reason === 'active-courses-updated') {
        fetchActiveCourses();
      }
      if (reason === 'recent-activities-updated') {
        fetchRecentActivities();
      }
    };
    
    const unsubscribe = addLearnerDashboardRefreshListener(handleRefresh);
    return () => unsubscribe();
  }, [fetchActiveCourses, fetchRecentActivities]);

  useEffect(() => {
    if (user?.id) {
      setHeaderInitialLoadComplete(true);
      fetchUserProfile();
      fetchActiveCourses();
      fetchLearningActivity();
      fetchRecentActivities();
    } else {
        // If there is no user, ensure the dashboard is cleared
        setActiveCourses([]);
        setCoursesInitialLoadComplete(true);
    }
  }, [user?.id, fetchUserProfile, fetchActiveCourses, fetchLearningActivity, fetchRecentActivities]);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
    setCurrentDay(now.toLocaleDateString('en-US', { weekday: 'long' }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);

  const formatRoleName = useCallback((role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  }, []);

  const handleSwitchRole = useCallback(async (role: UserRole) => {
    setDropdownOpen(false);
    if (role === currentRole) return;
    try {
      await selectRole(role);
      dashboardCache.clear();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  }, [currentRole, selectRole]);

  const handleViewAllRoles = useCallback(() => {
    setDropdownOpen(false);
    navigateToRoleSelection();
  }, [navigateToRoleSelection]);

  const roleIcons = useMemo(() => ({
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
                          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-xl bg-[#1B0A3F]/90 backdrop-blur-lg border border-[#BF4BF6]/40 overflow-hidden" style={{ zIndex: 9999 }}>
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
                                      <span className="w-4 h-4 flex items-center justify-center">{roleIcons[role as keyof typeof roleIcons] || <Users size={12} />}</span>
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