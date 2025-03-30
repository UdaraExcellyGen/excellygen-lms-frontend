import React, { useState, useEffect, useRef } from 'react'; 
import { Bell, LogOut, Users, BarChart2, ChevronDown, Check, FileText, Calendar, Book } from 'lucide-react';  
import { useNavigate } from 'react-router-dom'; 
import { HeaderProps } from '../types/types';  

// Role icon mapping
const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Users size={16} />,
  Learner: <FileText size={16} />,
  CourseCoordinator: <Calendar size={16} />,
  ProjectManager: <Book size={16} />
};

const Header: React.FC<HeaderProps> = ({  
  notifications = [],
  adminName = "Admin Name",
  role = "System Administrator" 
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);

  // Handle click outside to close dropdown
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

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const navigateToNotifications = () => {
    // Navigate to the ManageNotification page when bell icon is clicked
    navigate('/admin/notifications');
  };

  const switchToRole = (role: string) => {
    // Navigate to appropriate dashboard
    switch(role) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      case 'Learner':
        navigate('/learner/dashboard');
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

  // Format role name for display
  const formatRoleName = (role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[#BF4BF6] rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <Users className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl text-[#1B0A3F] font-['Unbounded']">{adminName}</h1>
            <p className="text-sm sm:text-base text-gray-400 font-['Nunito_Sans']">{role}</p>
          </div>
        </div>
                
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          {/* View Reports Button */}
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300"
          >
            <BarChart2 size={20} />
            <span className="font-['Nunito_Sans'] hidden sm:inline">View Reports</span>
          </button>

          {/* Notification Bell - Modified to only navigate to ManageNotifications page */}
          <button 
            onClick={navigateToNotifications}
            className="relative hover:text-[#BF4BF6] transition-colors duration-200"
            aria-label="View notifications"
          >
            <Bell size={20} className="text-gray-500 hover:text-[#BF4BF6]" />
          </button>

          {/* Role Switcher - Only show if user has multiple roles */}
          {currentUser && currentUser.roles && currentUser.roles.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#F6E6FF]"
                aria-label="Switch role"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Users size={20} />
                <span className="font-['Nunito_Sans'] hidden sm:inline">Roles</span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-300 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="text-sm text-gray-500 px-4 py-2 border-b border-gray-100 font-['Nunito_Sans']">
                    Switch Role
                  </div>
                  <div className="py-1">
                    {currentUser.roles.map((roleOption: string) => (
                      <button
                        key={roleOption}
                        onClick={() => switchToRole(roleOption)}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-200 font-['Nunito_Sans'] ${
                          roleOption === 'Admin' 
                            ? 'bg-[#F6E6FF] text-[#BF4BF6]' 
                            : 'text-gray-700 hover:bg-[#F6E6FF] hover:text-[#BF4BF6]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center text-[#BF4BF6]">
                              {roleIcons[roleOption] || <Users size={16} />}
                            </span>
                            <span>{formatRoleName(roleOption)}</span>
                          </div>
                          {roleOption === 'Admin' && (
                            <Check size={16} className="text-[#BF4BF6]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => navigate('/role-selection')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-colors duration-200 font-['Nunito_Sans']"
                    >
                      View All Roles
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#F6E6FF]"
          >
            <LogOut size={20} />
            <span className="font-['Nunito_Sans'] hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;