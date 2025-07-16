import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, GraduationCap, Users, ChevronDown, Check, FileText, Calendar, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { UserRole } from '../../../../types/auth.types';
import { HeaderProps } from '../types/types';

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Users size={16} />,
  Learner: <FileText size={16} />,
  CourseCoordinator: <Calendar size={16} />,
  ProjectManager: <Book size={16} />
};

// --- 1. MODIFICATION: Add the 'avatar' prop ---
const Header: React.FC<HeaderProps> = ({
  notifications = [],
  coordinatorName = "Coordinator Name",
  role = "Course Coordinator",
  avatar
}) => {
  const navigate = useNavigate();
  const { user, currentRole, selectRole, logout, navigateToRoleSelection } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // --- 2. MODIFICATION: Add state and effect for handling avatar image errors ---
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleNotificationClick = () => {
      setShowNotifications(prev => !prev);
      navigate('/coordinator/notifications');
  };

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  const formatRoleName = (role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  };

  // --- 3. MODIFICATION: Add a helper to get initials for the fallback ---
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          {/* --- 4. MODIFICATION: Replace static icon with avatar logic --- */}
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-[#52007C] to-[#BF4BF6] border-2 border-[#BF4BF6] flex items-center justify-center transition-transform duration-300 hover:scale-105 overflow-hidden">
            {avatar && !avatarError ? (
              <img
                src={avatar}
                alt={coordinatorName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
                loading="lazy"
              />
            ) : (
              // Fallback to initials or original icon
              <span className="text-xl sm:text-2xl font-bold text-white">
                {getInitials(coordinatorName) || <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl text-[#1B0A3F] font-['Unbounded']">{coordinatorName}</h1>
            <p className="text-sm sm:text-base text-gray-500 font-['Nunito_Sans']">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          <div className="relative" ref={notificationRef}>
            <button onClick={handleNotificationClick} className="relative group">
              <div className="p-2.5 rounded-lg bg-[#F6E6FF] transition-all duration-300 group-hover:bg-[#F0D6FF] group-hover:shadow-md">
                <Bell size={20} className="text-[#BF4BF6]" />
                {newNotificationsCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-[#BF4BF6] animate-pulse-slow opacity-60"></div>
                    <div className="absolute w-full h-full rounded-full bg-[#BF4BF6] flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white">{newNotificationsCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-20 border border-gray-100">
                <h3 className="px-4 py-2 font-semibold text-[#1B0A3F] border-b">Notifications</h3>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-[#F6E6FF] cursor-pointer">
                      <p className="text-sm text-[#1B0A3F]">{notif.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))
                ) : ( <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div> )}
                <div className="border-t border-gray-100 mt-2">
                  <button onClick={() => navigate('/coordinator/notifications')} className="w-full px-4 py-2 text-sm text-[#BF4BF6] hover:bg-[#F6E6FF]">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {user && user.roles && user.roles.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#1B0A3F] rounded-lg hover:bg-[#F6E6FF]">
                <Users size={18} />
                <span className="font-['Nunito_Sans'] text-sm font-medium hidden sm:inline">{formatRoleName(currentRole as string)}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                 <div className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-[#BF4BF6]/20 z-50">
                  <div className="py-1">
                    {user.roles.map((roleOption) => (
                      <button key={roleOption} onClick={() => selectRole(roleOption as UserRole)} className={`flex items-center w-full text-left px-4 py-2.5 text-sm ${roleOption === currentRole ? 'bg-[#F6E6FF] text-[#BF4BF6]' : 'text-gray-700 hover:bg-[#F6E6FF]'}`}>
                        <span className="w-6 h-6 flex items-center justify-center text-[#BF4BF6] bg-[#F6E6FF] rounded-md mr-2.5">{roleIcons[roleOption]}</span>
                        {formatRoleName(roleOption)}
                        {roleOption === currentRole && <Check size={16} className="ml-auto text-[#BF4BF6]" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100">
                    <button onClick={navigateToRoleSelection} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F6E6FF]">View All Roles</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3.5 py-2.5 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} />
            <span className="font-['Nunito_Sans'] text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;