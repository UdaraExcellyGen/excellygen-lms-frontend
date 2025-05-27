import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, GraduationCap, Users, ChevronDown, Check, FileText, Calendar, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { UserRole } from '../../../../types/auth.types';
import { Notification } from '../types/types';

interface HeaderProps {
  notifications: Notification[];
  coordinatorName?: string;
  role?: string;
}

// Role icon mapping
const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Users size={16} />,
  Learner: <FileText size={16} />,
  CourseCoordinator: <Calendar size={16} />,
  ProjectManager: <Book size={16} />
};

const Header: React.FC<HeaderProps> = ({ 
  notifications, 
  coordinatorName = "Coordinator Name",
  role = "Course Coordinator"
}) => {
  const navigate = useNavigate();
  const { user, currentRole, selectRole, logout, navigateToRoleSelection } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    try {
      await logout(); // Use auth context's logout method
      // The navigate will be handled by the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const navigateToNotifications = () => {
    // Navigate to the coordinator notifications page
    navigate('/coordinator/notifications');
  };

  // Updated to use auth context's selectRole function
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
      // Navigation will be handled by the selectRole function
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  // Use the direct navigation function from auth context
  const handleViewAllRoles = () => {
    console.log('Navigating to role selection page from coordinator header');
    setDropdownOpen(false);
    // Use direct navigation from auth context
    navigateToRoleSelection();
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
            <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl text-[#1B0A3F] font-['Unbounded']">{coordinatorName}</h1>
            <p className="text-sm sm:text-base text-gray-400 font-['Nunito_Sans']">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:text-[#BF4BF6] transition-colors duration-200"
            >
              <Bell size={20} className="text-gray-500 hover:text-[#BF4BF6]" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#BF4BF6] rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-20 border border-gray-100">
                <h3 className="px-4 py-2 font-semibold text-[#1B0A3F] border-b font-['Unbounded']">Notifications</h3>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="px-4 py-3 hover:bg-[#F6E6FF] cursor-pointer transition-colors duration-200"
                    >
                      <p className="text-sm text-[#1B0A3F] font-['Nunito_Sans']">{notif.text}</p>
                      <p className="text-xs text-gray-500 mt-1 font-['Nunito_Sans']">{notif.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 font-['Nunito_Sans']">
                    No new notifications
                  </div>
                )}
                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={navigateToNotifications}
                    className="w-full px-4 py-2 text-sm text-[#BF4BF6] hover:bg-[#F6E6FF] transition-colors duration-200 font-['Nunito_Sans']"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher - Only show if user has multiple roles */}
          {user && user.roles && user.roles.length > 1 && (
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
                    {user.roles.map((roleOption: string) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => handleSwitchRole(roleOption as UserRole)}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-200 font-['Nunito_Sans'] ${
                          roleOption === currentRole 
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
                          {roleOption === currentRole && (
                            <Check size={16} className="text-[#BF4BF6]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100">
                    <a 
                      href="/role-selection"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewAllRoles();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6E6FF] hover:text-[#BF4BF6] transition-colors duration-200 font-['Nunito_Sans']"
                    >
                      View All Roles
                    </a>
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