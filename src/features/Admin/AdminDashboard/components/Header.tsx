// src/features/Admin/AdminDashboard/components/Header.tsx
// ENTERPRISE OPTIMIZED: Performance optimizations only, same functionality
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Bell, 
  LogOut, 
  Users, 
  ChevronDown, 
  Check, 
  FileText, 
  Calendar,
  Book
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeaderProps } from '../types/types';
import { useAuth } from '../../../../contexts/AuthContext';
import { UserRole } from '../../../../types/auth.types';

// ENTERPRISE: Role icon mapping with memoization
const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Users size={16} />,
  Learner: <FileText size={16} />,
  CourseCoordinator: <Calendar size={16} />,
  ProjectManager: <Book size={16} />
};

// ENTERPRISE: Optimized base URL configuration
const BASE_URL = 'http://localhost:5177';

const Header: React.FC<HeaderProps> = React.memo(({
  notifications = [],
  adminName = "Admin Name",
  role = "System Administrator",
  avatar = null
}) => {
  const navigate = useNavigate();
  const { user, currentRole, selectRole, navigateToRoleSelection } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  // ENTERPRISE: Memoized notification count for performance
  const newNotificationsCount = useMemo(() => 
    notifications.filter(n => n.isNew).length, 
    [notifications]
  );

  // ENTERPRISE: Handle click outside to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen, handleClickOutside]);

  const handleLogout = useCallback(() => {
    // Clear auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('current_role');
    localStorage.removeItem('user');
    
    navigate('/login');
  }, [navigate]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const navigateToNotifications = useCallback(() => {
    navigate('/admin/notifications');
  }, [navigate]);

  // ENTERPRISE: Format role name with memoization
  const formatRoleName = useCallback((role: string) => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    return role;
  }, []);

  const handleSwitchRole = useCallback(async (role: UserRole) => {
    try {
      console.log(`Attempting to switch to role: ${role}`);
      if (role === currentRole) {
        setDropdownOpen(false);
        return;
      }
      
      setDropdownOpen(false);
      await selectRole(role);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  }, [currentRole, selectRole]);

  const handleViewAllRoles = useCallback(() => {
    console.log('Navigating to role selection page from admin dashboard');
    setDropdownOpen(false);
    navigateToRoleSelection();
  }, [navigateToRoleSelection]);

  // ENTERPRISE: Improved avatar URL processing with memoization
  const getAvatarUrl = useCallback((avatarPath: string | null) => {
    if (!avatarPath) return null;
    
    // For Firebase Storage URLs or full URLs, return as is
    if (avatarPath.includes('firebasestorage.googleapis.com') || 
        avatarPath.startsWith('http') || 
        avatarPath.startsWith('https')) {
      return avatarPath;
    }
    
    // Handle relative paths
    return avatarPath.startsWith('/') ? `${BASE_URL}${avatarPath}` : `${BASE_URL}/${avatarPath}`;
  }, []);

  // ENTERPRISE: Get initials for fallback avatar with memoization
  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  // ENTERPRISE: Reset avatar error when avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  // ENTERPRISE: Memoized values for performance
  const avatarUrl = useMemo(() => getAvatarUrl(avatar), [avatar, getAvatarUrl]);
  const userInitials = useMemo(() => getInitials(adminName), [adminName, getInitials]);

  return (
    <div className="p-4 sm:p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          {/* ENTERPRISE: Optimized user avatar with better error handling */}
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#52007C] to-[#BF4BF6] border-2 border-[#BF4BF6] flex items-center justify-center transition-transform duration-300 hover:scale-105">
            {avatar && !avatarError ? (
              <img 
                src={avatarUrl || ''}
                alt={`${adminName}'s avatar`} 
                className="h-full w-full object-cover"
                onError={() => {
                  console.error("Avatar failed to load:", avatarUrl);
                  setAvatarError(true);
                }}
                loading="lazy"
              />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-white">
                {userInitials}
              </span>
            )}
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl text-[#1B0A3F] font-['Unbounded']">{adminName}</h1>
            <p className="text-sm sm:text-base text-gray-500 font-['Nunito_Sans']">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          {/* Notification Bell */}
          <button 
            onClick={navigateToNotifications}
            className="relative group"
            aria-label="View notifications"
          >
            <div className="p-2.5 rounded-lg bg-[#F6E6FF] transition-all duration-300 group-hover:bg-[#F0D6FF] group-hover:shadow-md flex items-center justify-center relative">
              <Bell 
                size={20} 
                className="text-[#BF4BF6] transition-colors duration-300" 
                strokeWidth={1.8}
              />
              
              {/* ENTERPRISE: Optimized notification badge */}
              {newNotificationsCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full bg-[#BF4BF6] animate-pulse-slow opacity-60"></div>
                  <div className="absolute w-full h-full rounded-full bg-[#BF4BF6] flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-white leading-none">{newNotificationsCount}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute hidden md:group-hover:block right-0 mt-2 bg-[#1B0A3F] text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
              {newNotificationsCount} new notification{newNotificationsCount !== 1 ? 's' : ''}
            </div>
          </button>

          {/* Role Switcher - Only show if user has multiple roles */}
          {user && user.roles && user.roles.length > 1 && (
            <div 
              className="relative" 
              ref={dropdownRef} 
              style={{ zIndex: 9999 }}
            >
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#1B0A3F] transition-all duration-300 rounded-lg hover:bg-[#F6E6FF] hover:text-[#BF4BF6]"
                aria-label="Switch role"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Users size={18} strokeWidth={1.8} />
                <span className="font-['Nunito_Sans'] text-sm font-medium hidden sm:inline">
                  {currentRole ? formatRoleName(currentRole as string) : 'Roles'}
                </span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.8}
                />
              </button>
              
              {/* Dropdown */}
              {dropdownOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-[#BF4BF6]/20 overflow-hidden"
                  style={{ 
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                  }}
                >
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

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-gray-700 transition-all duration-300 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="font-['Nunito_Sans'] text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;