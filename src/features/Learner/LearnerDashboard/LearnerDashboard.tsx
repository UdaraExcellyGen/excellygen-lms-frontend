import React, { useState, useEffect, useRef } from 'react';
import { Calendar, FileText, Users, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import { 
  ActiveCourses, 
  RecentActivities, 
  LearningActivityChart 
} from './components/Sections';
import { courses, activities, weeklyTimeData } from './data/mockData';
import LearnerHeaderImage from '../../../assets/LearnerHeader.svg';

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Users size={16} />,
  Learner: <FileText size={16} />,
  CourseCoordinator: <Calendar size={16} />,
  ProjectManager: <FileText size={16} />
};

const updatedCourses = courses.map(course => 
  course.title === "Advanced React Development" 
    ? {...course, title: "Web Development Fundamentals"} 
    : course
);

const LearnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    setCurrentDate(formattedDate);
    setCurrentDay(day);
    
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
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

  const handleGenerateCV = () => {
    navigate('/cv');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const switchToRole = (role: string) => {
    
    switch(role) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      case 'Learner':
        navigate('/student-dashboard');
        break;
      case 'CourseCoordinator':
        navigate('/coordinator/dashboard');
        break;
      case 'ProjectManager':
        navigate('/manager/dashboard');
        break;
      default:
        navigate('/role-selection');
    }
  };

  const formatRoleName = (role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Top row with welcome and date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Calendar className="text-white w-6 h-6" />
                </div>
                <div className="text-white">
                  <p className="text-sm text-white/70">Welcome back</p>
                  <h2 className="text-lg font-medium">{currentDate}, {currentDay}</h2>
                </div>
              </div>

              {/* Role Switcher Dropdown */}
              {currentUser && currentUser.roles && currentUser.roles.length > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all duration-300 backdrop-blur-md border border-white/20"
                    aria-label="Switch role"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <Users size={18} />
                    <span className="text-sm font-medium">Role: Learner</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden z-50">
                      <div className="text-sm text-white/80 px-4 py-2 border-b border-white/10">
                        Switch Role
                      </div>
                      <div className="py-1">
                        {currentUser.roles.map((role: string) => (
                          <button
                            key={role}
                            onClick={() => switchToRole(role)}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${role === 'Learner' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 flex items-center justify-center">
                                  {roleIcons[role] || <Users size={16} />}
                                </span>
                                <span>{formatRoleName(role)}</span>
                              </div>
                              {role === 'Learner' && (
                                <Check size={16} className="text-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-white/10">
                        <button
                          onClick={() => navigate('/role-selection')}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/15 hover:text-white transition-colors duration-200"
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
                <div className="w-full md:w-auto z-10 px-6 md:px-8 py-6 md:py-8">
                  <h1 className="text-3xl md:text-4xl font-bold font-unbounded mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
                    {currentUser ? currentUser.name : 'Learner Name'}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <p className="text-[#D68BF9] px-3 py-1 bg-white/5 rounded-full text-sm">Software Engineer</p>
                    <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
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