import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Pencil, Trash2, ShieldAlert, Info } from 'lucide-react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  currentUserId?: string;
  isUserLoading: (id: string) => boolean;
  handleToggleStatus: (id: string) => Promise<void>;
  handleDeleteUser: (id: string) => void;
  formatRoleName: (role: string) => string;
  // REMOVED: getRoleColor from props as it's not used in component
  navigate: (path: string) => void;
  onEditUser: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  isUserLoading,
  handleToggleStatus,
  handleDeleteUser,
  formatRoleName,
  navigate,
  onEditUser
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);
  const isCurrentUser = user.id === currentUserId;
  
  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user.id]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Format role name with normalization
  const displayRoleName = (role: string) => {
    // First normalize to standard format
    let normalizedRole;
    switch(role.toLowerCase()) {
      case 'admin': normalizedRole = 'Admin'; break;
      case 'learner': normalizedRole = 'Learner'; break;
      case 'coursecoordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
        normalizedRole = 'CourseCoordinator'; break;
      case 'projectmanager': 
      case 'project manager': 
      case 'project_manager': 
        normalizedRole = 'ProjectManager'; break;
      default: normalizedRole = role;
    }
    
    // Then apply the formatting function
    return formatRoleName(normalizedRole);
  };
  
  // Get standardized role color - LOCAL FUNCTION since getRoleColor was unused
  const getStandardRoleColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'learner': return 'bg-green-100 text-green-800';
      case 'coursecoordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
      case 'coordinator': return 'bg-blue-100 text-blue-800';
      case 'projectmanager': 
      case 'project manager': 
      case 'project_manager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 transition-all duration-300 hover:shadow-md relative ${isCurrentUser ? 'ring-2 ring-[#BF4BF6] ring-opacity-70' : ''}`}>
      {/* Current User Indicator */}
      {isCurrentUser && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-[#F6E6FF] p-2 rounded-full" title="you can't delete or inactive your own account">
            <ShieldAlert size={20} className="text-[#BF4BF6]" />
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        {/* User Name and Avatar - Left Side */}
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          {!avatarError && user.avatar ? (
            <img 
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#BF4BF6]"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center text-white font-bold">
              {getInitials(user.name)}
            </div>
          )}
          
          <h3 
            onClick={() => navigate(`/admin/view-profile/${user.id}`)}
            className="text-xl text-[#1B0A3F] font-['Unbounded'] cursor-pointer hover:text-[#BF4BF6] transition-colors"
          >
            {user.name} {isCurrentUser && <span className="text-[#BF4BF6] text-sm">(you)</span>}
          </h3>
        </div>
        
        {/* Status Toggle - Right Side */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium whitespace-nowrap
            ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
          <label className={`relative inline-flex items-center ${isCurrentUser ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`} 
                 title={isCurrentUser ? "You cannot change your own account status" : ""}>
            <input 
              type="checkbox" 
              checked={user.status === 'active'}
              onChange={() => !isCurrentUser && handleToggleStatus(user.id)}
              className="sr-only peer"
              disabled={isUserLoading(user.id) || isCurrentUser}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                after:h-5 after:w-5 ${isUserLoading(user.id) ? 'after:animate-pulse' : 'after:transition-all'} 
                peer-checked:bg-[#BF4BF6] shadow-inner`}></div>
          </label>
        </div>
      </div>
      
      {/* Role Tags - FIXED: Added proper typing for map function */}
      <div className="flex flex-wrap gap-1 my-3">
        {user.roles.map((role: string, index: number) => (
          <span 
            key={index} 
            className={`inline-block px-3 py-1 rounded-full text-xs ${getStandardRoleColor(role)}`}
          >
            {displayRoleName(role)}
          </span>
        ))}
      </div>
      
      {/* User Info - Modified to align all fields consistently */}
      <div className="space-y-2.5 mb-4">
        {/* User ID */}
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-10 shrink-0">ID:</span>
          <span className="text-sm font-mono">{user.id}</span>
        </div>
        
        {/* Email - Aligned like ID */}
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-10 shrink-0 flex items-center">
            <Mail size={16} className="shrink-0" />
          </span>
          <span className="text-sm truncate">{user.email}</span>
        </div>
        
        {/* Phone - Aligned like ID */}
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-10 shrink-0 flex items-center">
            <Phone size={16} className="shrink-0" />
          </span>
          <span className="text-sm">{user.phone || "—"}</span>
        </div>
        
        {/* Department - Aligned like ID */}
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-10 shrink-0 flex items-center">
            <Building2 size={16} className="shrink-0" />
          </span>
          <span className="text-sm truncate">{user.department || "—"}</span>
        </div>
      </div>

      {/* User Footer */}
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          Joined: {new Date(user.joinedDate).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEditUser(user)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full hover:bg-[#F6E6FF] transition-colors"
            disabled={isUserLoading(user.id)}
          >
            <Pencil size={18} />
          </button>
          
          {/* Delete Button with Enhanced Tooltip */}
          <div className="relative">
            <button
              onClick={() => !isCurrentUser && handleDeleteUser(user.id)}
              className={`p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors ${isCurrentUser ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isUserLoading(user.id) || isCurrentUser}
              onMouseEnter={() => isCurrentUser && setShowDeleteTooltip(true)}
              onMouseLeave={() => setShowDeleteTooltip(false)}
              aria-label={isCurrentUser ? "Cannot delete your own account" : "Delete user"}
            >
              <Trash2 size={18} />
            </button>
            
            {/* Enhanced Tooltip */}
            {isCurrentUser && showDeleteTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-xs rounded shadow-lg z-20 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-yellow-300 shrink-0 mt-0.5" />
                  <p>You cannot delete your own account for security reasons</p>
                </div>
                <div className="absolute bottom-0 right-3 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Current User Badge - If applicable */}
      {isCurrentUser && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] rounded-b-2xl"></div>
      )}
    </div>
  );
};

export default UserCard;