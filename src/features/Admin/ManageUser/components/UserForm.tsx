import React, { useState } from 'react';
import { X, Check, User, Mail, Phone, Users, Building2, AlertCircle, ChevronDown } from 'lucide-react';
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
  generateTempPassword: boolean;
  setGenerateTempPassword: (value: boolean) => void;
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
  formatRoleName,
  generateTempPassword,
  setGenerateTempPassword
}) => {
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Available departments
  const departments = [
    'Development',
    'Cybersecurity',
    'Analytics',
    'Product Management',
    'PMO',
    'R&D',
    'Finance',
    'HR'
  ];

  // Email validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  // Enhanced phone validation with international format support
  const validatePhone = (phone: string): string => {
    if (!phone) return ''; 
    
    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check for valid international format or proper digit length
    const isValidInternational = /^\+[0-9]{10,15}$/.test(phone);
    const hasValidDigitLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;
    
    if (!isValidInternational && !hasValidDigitLength) {
      return 'Please enter a valid phone number (e.g., +94770123456)';
    }
    
    return '';
  };

  const validateName = (name: string): string => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  // Handle field changes with validation
  const handleFieldChange = (field: keyof typeof newUser, value: string) => {
    setNewUser({ ...newUser, [field]: value });
    
    // Real-time validation
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'name':
        error = validateName(value);
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleDepartmentSelect = (department: string) => {
    setNewUser({ ...newUser, department });
    setShowDepartmentDropdown(false);
  };

  if (!showAddModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] 
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
          
          // Validate all fields before submission
          const errors: { [key: string]: string } = {};
          errors.name = validateName(newUser.name);
          errors.email = validateEmail(newUser.email);
          errors.phone = validatePhone(newUser.phone);
          
          const hasErrors = Object.values(errors).some(error => error !== '');
          setValidationErrors(errors);
          
          if (!hasErrors) {
            // If editing and generating temp password, set the password field to empty
            // to signal the backend to generate a temporary password
            if (editingUser && !generateTempPassword) {
              // If editing and NOT generating temp password, set to a special value
              // that indicates no password change is needed
              setNewUser(prev => ({ ...prev, password: 'NO_CHANGE' }));
            }
            
            handleAddUser();
          }
        }}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-[42px]">
                <User size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none 
                         focus:ring-2 font-['Nunito_Sans'] h-[42px]
                         ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#BF4BF6]'}`}
                required
                disabled={isSubmitting}
              />
              {validationErrors.name && (
                <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.name}
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-[42px]">
                <Mail size={16} className="text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none 
                         focus:ring-2 font-['Nunito_Sans'] h-[42px]
                         ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#BF4BF6]'}`}
                required
                disabled={isSubmitting}
              />
              {validationErrors.email && (
                <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.email}
                </div>
              )}
            </div>
            
            {/* Enhanced Phone Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-[42px]">
                <Phone size={16} className="text-gray-500" />
              </div>
              <input
                type="tel"
                placeholder="Phone (e.g., +94770123456)"
                value={newUser.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none 
                         focus:ring-2 font-['Nunito_Sans'] h-[42px]
                         ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#BF4BF6]'}`}
                disabled={isSubmitting}
              />
              {validationErrors.phone && (
                <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.phone}
                </div>
              )}
              <div className="mt-1 text-gray-500 text-xs pl-3">
                Use international format with country code (e.g., +94 for SL)
              </div>
            </div>
            
            {/* Department Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-[42px]">
                <Building2 size={16} className="text-gray-500" />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans'] h-[42px] flex justify-between items-center"
                  disabled={isSubmitting}
                >
                  <span className={newUser.department ? 'text-[#1B0A3F]' : 'text-gray-500'}>
                    {newUser.department || 'Select Department'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {showDepartmentDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {departments.map((dept) => (
                      <div
                        key={dept}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          newUser.department === dept ? 'bg-gray-100 text-[#BF4BF6]' : ''
                        }`}
                        onClick={() => handleDepartmentSelect(dept)}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <label className="text-gray-700 text-sm font-medium font-['Nunito_Sans']">
                  Roles (Select multiple)
                </label>
              </div>
              <div className="space-y-2 pl-6">
                {['Learner', 'Admin', 'CourseCoordinator', 'ProjectManager'].map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={newUser.roles.some(userRole => userRole.toLowerCase() === role.toLowerCase())}
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
            
            {/* Temporary Password Checkbox for Editing Users */}
            {editingUser && (
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="generate-temp-password"
                  checked={generateTempPassword}
                  onChange={(e) => setGenerateTempPassword(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#BF4BF6] focus:ring-[#BF4BF6]"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="generate-temp-password"
                  className="ml-2 text-sm text-gray-700 font-['Nunito_Sans']"
                >
                  Generate temporary password
                </label>
              </div>
            )}
            
            {/* Password Info Message */}
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
              {!editingUser ? (
                <p>A secure temporary password will be generated for this user. They will be required to change it on first login.</p>
              ) : generateTempPassword ? (
                <p>A new temporary password will be generated for this user. They will be required to change it on next login.</p>
              ) : (
                <p>The user's current password will be maintained.</p>
              )}
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