import React from 'react';
import { X, Check, User, Mail, Phone, Lock, Users, Building2 } from 'lucide-react';
import { User as UserType, CreateUserDto } from '../types';

interface UserFormProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  editingUser: UserType | null;
  newUser: Omit<CreateUserDto, 'id'>;
  setNewUser: React.Dispatch<React.SetStateAction<Omit<CreateUserDto, 'id'>>>;
  handleAddUser: () => Promise<void>;
  isSubmitting: boolean;
  updateNewUserRoles: (role: string, isChecked: boolean) => void;
  resetForm: () => void;
  formatRoleName: (role: string) => string;
}

const UserForm: React.FC<UserFormProps> = ({
  showAddModal,
  setShowAddModal,
  editingUser,
  newUser,
  setNewUser,
  handleAddUser,
  isSubmitting,
  updateNewUserRoles,
  resetForm,
  formatRoleName
}) => {
  if (!showAddModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 
               animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowAddModal(false);
          resetForm();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
            className="text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddUser();
        }}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={16} className="text-gray-500" />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500" />
              </div>
              <input
                type="password"
                placeholder={editingUser ? "New Password (leave empty to keep current)" : "Password"}
                value={newUser.password || ''}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                required={!editingUser}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <label className="text-gray-700 text-sm font-medium font-['Nunito_Sans']">
                  Roles (Select multiple)
                </label>
              </div>
              <div className="space-y-2 pl-6">
                {['learner', 'admin', 'coordinator', 'project_manager'].map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={newUser.roles.includes(role)}
                      onChange={(e) => updateNewUserRoles(role, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="ml-2 text-sm text-gray-700 font-['Nunito_Sans']"
                    >
                      {formatRoleName(role)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans'] transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editingUser ? 'Updating...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>{editingUser ? 'Update' : 'Add'} User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;