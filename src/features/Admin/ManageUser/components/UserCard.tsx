import React from 'react';
import { Mail, Phone, Building2, Pencil, Trash2 } from 'lucide-react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  isUserLoading: (id: string) => boolean;
  handleToggleStatus: (id: string) => Promise<void>;
  handleDeleteUser: (id: string) => void;
  formatRoleName: (role: string) => string;
  getRoleColor: (role: string) => string;
  navigate: (path: string) => void;
  onEditUser: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isUserLoading,
  handleToggleStatus,
  handleDeleteUser,
  formatRoleName,
  getRoleColor,
  navigate,
  onEditUser
}) => {
  // The formatRoleName function should handle normalization too
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
  
  // Get role color with normalization
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
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md flex flex-col">
      {/* User Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 
            onClick={() => navigate(`/admin/view-profile/${user.id}`)}
            className="text-xl text-[#1B0A3F] font-['Unbounded'] cursor-pointer hover:text-[#BF4BF6] transition-colors truncate"
          >
            {user.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
          <span className={`text-sm font-medium whitespace-nowrap
            ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={user.status === 'active'}
              onChange={() => handleToggleStatus(user.id)}
              className="sr-only peer"
              disabled={isUserLoading(user.id)}
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
      
      {/* Role Tags */}
      <div className="flex flex-wrap gap-1 mt-1 max-w-full">
        {user.roles.map((role, index) => (
          <span 
            key={index} 
            className={`inline-block px-3 py-1 rounded-full text-xs ${getStandardRoleColor(role)} mb-1`}
          >
            {displayRoleName(role)}
          </span>
        ))}
      </div>
      
      {/* User Info */}
      <div className="space-y-2 mb-4 flex-grow">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium min-w-16 flex-shrink-0">ID:</span>
          <span className="font-['Nunito_Sans'] truncate">{user.id}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={16} className="flex-shrink-0" />
          <span className="font-['Nunito_Sans'] truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={16} className="flex-shrink-0" />
          <span className="font-['Nunito_Sans']">{user.phone || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 size={16} className="flex-shrink-0" />
          <span className="font-['Nunito_Sans'] truncate">{user.department || "—"}</span>
        </div>
      </div>

      {/* User Footer */}
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500 font-['Nunito_Sans']">
          Joined: {new Date(user.joinedDate).toLocaleDateString()}
        </span>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEditUser(user)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                     hover:bg-[#F6E6FF] transition-colors duration-200"
            disabled={isUserLoading(user.id)}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                     hover:bg-red-50 transition-colors duration-200"
            disabled={isUserLoading(user.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;