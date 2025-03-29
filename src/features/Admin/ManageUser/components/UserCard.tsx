import React from 'react';
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { User } from '../types';

// Helper functions (moved directly into component to avoid import issues)
const formatRoleName = (role: string): string => {
  switch (role) {
    case 'coordinator': return 'Coordinator';
    case 'project_manager': return 'Project Manager';
    case 'learner': return 'Learner';
    case 'admin': return 'Admin';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'coordinator': return 'bg-blue-100 text-blue-800';
    case 'learner': return 'bg-green-100 text-green-800';
    case 'project_manager': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">{user.name}</h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.roles.map((role, index) => (
              <span 
                key={index} 
                className={`inline-block px-3 py-1 rounded-full text-xs ${getRoleColor(role)}`}
              >
                {formatRoleName(role)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                     hover:bg-[#F6E6FF] transition-colors duration-200"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                     hover:bg-red-50 transition-colors duration-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={16} />
          <span className="font-['Nunito_Sans']">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={16} />
          <span className="font-['Nunito_Sans']">{user.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 size={16} />
          <span className="font-['Nunito_Sans']">{user.department}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500 font-['Nunito_Sans']">
          Joined: {new Date(user.joinedDate).toLocaleDateString()}
        </span>
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-['Nunito_Sans'] transition-all duration-300
                   ${user.status === 'active' 
                     ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                     : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'}`}
        >
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </button>
      </div>
    </div>
  );
};

export default UserCard;