import React, { useState, useEffect, useRef } from 'react';
import { Calendar, FileText, Users, ChevronDown, Check } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/auth.types';
import { Course } from './types/types';
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { activities, weeklyTimeData } from './data/mockData';
import LearnerHeaderImage from '../../../assets/LearnerHeader.svg';
import { getEnrolledCoursesForLearner, getLearnerCourseDetails } from '../../../api/services/Course/learnerCourseService';
import { getRecentlyAccessedCourseIds } from '../../../api/services/Course/courseAccessService';

const LearnerDashboard: React.FC = () => {
  const { user, currentRole, selectRole, navigateToRoleSelection } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchActiveCourses = async () => {
      setIsLoadingCourses(true);
      try {
        // FIX: Call the function without arguments to match the expected signature
        const allEnrolledCourses = await getEnrolledCoursesForLearner();
        
        if (!allEnrolledCourses || allEnrolledCourses.length === 0) {
          setActiveCourses([]);
          setIsLoadingCourses(false); // Stop loading if no courses
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
      } catch (error: any) {
        if (error.name === 'CanceledError') {
          console.log('Request canceled: The component unmounted.');
        } else {
          console.error("Failed to fetch active courses:", error);
          setActiveCourses([]);
        }
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (user?.id) {
      fetchActiveCourses();
    }

    return () => {
      controller.abort();
    };
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    setCurrentDate(formattedDate);
    setCurrentDay(day);
  }, []);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const formatRoleName = (role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  };

  const handleSwitchRole = async (role: UserRole) => {
    try {
      if (role === currentRole) {
        setDropdownOpen(false);
        return;
      }
      setDropdownOpen(false);
      await selectRole(role);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const handleViewAllRoles = () => {
    setDropdownOpen(false);
    navigateToRoleSelection();
  };

  const roleIcons: Record<string, React.ReactNode> = {
    Admin: <Users size={16} />,
    Learner: <FileText size={16} />,
    CourseCoordinator: <Calendar size={16} />,
    ProjectManager: <FileText size={16} />
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          <div className="mb-6">
            <div className="p-2">
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
                      aria-label="Switch role"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      <span className="text-sm">Role: {currentRole && formatRoleName(currentRole as string)}</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {dropdownOpen && (
                      <div className="fixed right-auto mt-1 w-48 rounded-md shadow-xl bg-[#1B0A3F]/90 backdrop-blur-lg border border-[#BF4BF6]/40 overflow-hidden" style={{ zIndex: 9999, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' }}>
                        <div className="text-xs text-white/80 px-3 py-1.5 border-b border-white/10 bg-[#BF4BF6]/20">
                          Switch Role
                        </div>
                        <div className="py-1">
                          {user.roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleSwitchRole(role as UserRole)}
                              className={`flex items-center w-full text-left px-3 py-1.5 text-xs transition-colors duration-200 ${
                                role === currentRole 
                                  ? 'bg-[#BF4BF6]/30 text-white font-medium' 
                                  : 'text-white/80 hover:bg-[#BF4BF6]/20 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-4 h-4 flex items-center justify-center">
                                    {roleIcons[role] || <Users size={12} />}
                                  </span>
                                  <span>{formatRoleName(role)}</span>
                                </div>
                                {role === currentRole && (
                                  <Check size={12} className="text-white" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-white/10">
                          <button
                            onClick={handleViewAllRoles}
                            className="flex items-center w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-[#BF4BF6]/20 hover:text-white transition-colors duration-200"
                          >
                            View All Roles
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
                  <div className="w-full md:w-auto z-10">
                    <h1 className="text-3xl md:text-4xl font-bold font-['Unbounded'] mb-4 text-white">
                      {user ? user.name : 'Learner Name'}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <p className="text-[#D68BF9] px-3 py-1 bg-white/10 rounded-full text-sm">Software Engineer</p>
                    </div>
                  </div>
                  
                  <div className="md:ml-auto">
                    <img 
                      src={LearnerHeaderImage}
                      alt="Developer illustration" 
                      className="h-40 md:h-52 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FIX: Pass the isLoadingCourses prop */}
            <ActiveCourses courses={activeCourses} isLoading={isLoadingCourses} />
            <RecentActivities activities={activities} />
            <LearningActivityChart data={weeklyTimeData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearnerDashboard;