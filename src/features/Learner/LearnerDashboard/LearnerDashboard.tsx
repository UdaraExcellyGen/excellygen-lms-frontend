import React, { useState, useEffect, useRef } from 'react';
import { Calendar, FileText, Users, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/auth.types';
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { courses, activities, weeklyTimeData } from './data/mockData';
import LearnerHeaderImage from '../../../assets/LearnerHeader.svg';

const LearnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentRole, selectRole, navigateToRoleSelection } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Format the current date and day
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    setCurrentDate(formattedDate);
    setCurrentDay(day);
  }, []);

  // Handle outside clicks for dropdown
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
      console.log(`Attempting to switch to role: ${role}`);
      if (role === currentRole) {
        // If already in this role, just close dropdown
        setDropdownOpen(false);
        return;
      }
      
      // Call the selectRole function from auth context
      setDropdownOpen(false);
      await selectRole(role);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  // Use the direct navigation function from auth context
  const handleViewAllRoles = () => {
    console.log('Navigating to role selection page from learner dashboard');
    setDropdownOpen(false);
    // Use direct navigation from auth context
    navigateToRoleSelection();
  };

  const roleIcons: Record<string, React.ReactNode> = {
    Admin: <Users size={16} />,
    Learner: <FileText size={16} />,
    CourseCoordinator: <Calendar size={16} />,
    ProjectManager: <FileText size={16} />
  };

  // Modify course titles if needed
  const updatedCourses = courses.map(course => 
    course.title === "Advanced React Development" 
      ? {...course, title: "Web Development Fundamentals"} 
      : course
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
          {/* Header Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Top row with welcome and date */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 border-b border-[#F6E6FF] pb-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#F6E6FF] flex items-center justify-center">
                    <Calendar className="text-[#BF4BF6] w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Welcome back</p>
                    <h2 className="text-lg font-medium text-[#1B0A3F]">{currentDate}, {currentDay}</h2>
                  </div>
                </div>

                {/* Role Switcher Dropdown */}
                {user && user.roles && user.roles.length > 1 && (
                  <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
                    <button 
                      onClick={toggleDropdown}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#1B0A3F] transition-all duration-300 rounded-lg hover:bg-[#F6E6FF] hover:text-[#BF4BF6]"
                      aria-label="Switch role"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      <Users size={18} strokeWidth={1.8} />
                      <span className="font-['Nunito_Sans'] text-sm font-medium">
                        {currentRole ? formatRoleName(currentRole as string) : 'Roles'}
                      </span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                        strokeWidth={1.8}
                      />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="fixed right-auto mt-2 w-56 rounded-lg shadow-lg bg-white border border-[#BF4BF6]/20 overflow-hidden" style={{ zIndex: 9999, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' }}>
                        <div className="text-sm text-gray-500 px-4 py-2.5 border-b border-gray-100 font-['Nunito_Sans'] bg-[#F6E6FF]">
                          Switch Role
                        </div>
                        <div className="py-1">
                          {user.roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleSwitchRole(role as UserRole)}
                              className={`flex items-center w-full text-left px-4 py-2.5 text-sm transition-all duration-200 font-['Nunito_Sans'] ${
                                role === currentRole 
                                  ? 'bg-[#F6E6FF] text-[#BF4BF6] font-medium' 
                                  : 'text-gray-700 hover:bg-[#F6E6FF] hover:text-[#BF4BF6]'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 flex items-center justify-center text-[#BF4BF6] bg-[#F6E6FF] rounded-md">
                                    {roleIcons[role] || <Users size={14} />}
                                  </span>
                                  <span>{formatRoleName(role)}</span>
                                </div>
                                {role === currentRole && (
                                  <Check size={14} className="text-[#BF4BF6]" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleViewAllRoles}
                            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-all duration-200 font-['Nunito_Sans']"
                          >
                            View All Roles
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Profile and Illustration Section */}
              <div className="relative">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
                  <div className="w-full md:w-auto z-10">
                    <h1 className="text-3xl md:text-4xl font-bold font-['Unbounded'] mb-4 text-[#1B0A3F]">
                      {user ? user.name : 'Learner Name'}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <p className="text-[#BF4BF6] px-3 py-1 bg-[#F6E6FF] rounded-full text-sm">Software Engineer</p>
                    </div>
                  </div>
                  
                  {/* Illustration */}
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Courses Section - Using updated courses with the renamed course */}
            <ActiveCourses courses={updatedCourses} />

            {/* Recent Activities Section */}
            <RecentActivities activities={activities} />

            {/* Learning Activity Chart */}
            <LearningActivityChart data={weeklyTimeData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearnerDashboard;