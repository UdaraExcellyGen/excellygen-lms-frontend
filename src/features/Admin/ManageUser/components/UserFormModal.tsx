import React from 'react';
import { X, Check } from 'lucide-react';
import { User, NewUser } from '../types';
import { formatRoleName, roleOptions } from '../data/usersData';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: NewUser) => void;
  editingUser: User | null;
  userData: NewUser;
  setUserData: React.Dispatch<React.SetStateAction<NewUser>>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  userData,
  setUserData
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userData);
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setUserData({
        ...userData,
        roles: [...userData.roles, role]
      });
    } else {
      setUserData({
        ...userData,
        roles: userData.roles.filter(r => r !== role)
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-[#BF4BF6]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
            />
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-medium mb-2 font-['Nunito_Sans']">
                Roles (Select multiple)
              </label>
              <div className="space-y-2">
                {roleOptions.map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={userData.roles.includes(role)}
                      onChange={(e) => handleRoleToggle(role, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
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
            <input
              type="text"
              placeholder="Department"
              value={userData.department}
              onChange={(e) => setUserData({...userData, department: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans']"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
            >
              <Check size={20} />
              {editingUser ? 'Update' : 'Add'} User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;