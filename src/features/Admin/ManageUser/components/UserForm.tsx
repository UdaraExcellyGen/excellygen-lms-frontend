// src/features/Admin/ManageUsers/components/UserForm.tsx
// ENTERPRISE OPTIMIZED: Performance optimizations, same functionality
import React, { useState, useCallback, useMemo } from 'react';
import { X, Check, User, Mail, Phone, Users, Building2, AlertCircle, ChevronDown, ShieldAlert } from 'lucide-react';
import { User as UserType, CreateUserDto } from '../types';
import { useUsers } from '../data/useUsers';

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

// ENTERPRISE: Memoized validation error component
const ValidationError: React.FC<{ error: string }> = React.memo(({ error }) => (
  <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
    <AlertCircle size={14} />
    {error}
  </div>
));

ValidationError.displayName = 'ValidationError';

// ENTERPRISE: Memoized department option component
const DepartmentOption: React.FC<{
  department: string;
  isSelected: boolean;
  onSelect: (dept: string) => void;
}> = React.memo(({ department, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(department);
  }, [department, onSelect]);

  return (
    <div
      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
        isSelected ? 'bg-gray-100 text-[#BF4BF6]' : ''
      }`}
      onClick={handleClick}
    >
      {department}
    </div>
  );
});

DepartmentOption.displayName = 'DepartmentOption';

// ENTERPRISE: Memoized role checkbox component
const RoleCheckbox: React.FC<{
  role: string;
  isChecked: boolean;
  canAssign: boolean;
  isSuperAdmin: boolean;
  formatRoleName: (role: string) => string;
  updateNewUserRoles: (role: string, isChecked: boolean) => void;
  isSubmitting: boolean;
}> = React.memo(({ 
  role, 
  isChecked, 
  canAssign, 
  isSuperAdmin, 
  formatRoleName, 
  updateNewUserRoles, 
  isSubmitting 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNewUserRoles(role, e.target.checked);
  }, [role, updateNewUserRoles]);

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={`role-${role}`}
        checked={isChecked}
        onChange={handleChange}
        className={`h-4 w-4 rounded border-gray-300 focus:ring-[#BF4BF6] ${
          canAssign ? 'text-[#BF4BF6]' : 'text-gray-300 cursor-not-allowed'
        }`}
        disabled={isSubmitting || !canAssign}
      />
      <label
        htmlFor={`role-${role}`}
        className={`ml-2 text-sm ${
          canAssign ? 'text-gray-700' : 'text-gray-400'
        } font-['Nunito_Sans'] flex items-center`}
      >
        {isSuperAdmin && <ShieldAlert size={14} className="mr-1 text-purple-600" />}
        {formatRoleName(role)}
        {isSuperAdmin && (
          <span className="ml-1 text-xs text-purple-600 font-medium">(Super Admin only)</span>
        )}
      </label>
    </div>
  );
});

RoleCheckbox.displayName = 'RoleCheckbox';

const UserForm: React.FC<UserFormProps> = React.memo(({
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
  
  // Get permission utilities from useUsers hook
  const { canCreateUserWithRole, getAvailableRoles } = useUsers();

  // ENTERPRISE: Memoized departments list
  const departments = useMemo(() => [
    'Development',
    'Cybersecurity',
    'Analytics',
    'Product Management',
    'PMO',
    'R&D',
    'Finance',
    'HR'
  ], []);

  // ENTERPRISE: Memoized validation functions
  const validateEmail = useCallback((email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  }, []);

  const validatePhone = useCallback((phone: string): string => {
    if (!phone) return ''; 
    
    const digitsOnly = phone.replace(/\D/g, '');
    const isValidInternational = /^\+[0-9]{10,15}$/.test(phone);
    const hasValidDigitLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;
    
    if (!isValidInternational && !hasValidDigitLength) {
      return 'Please enter a valid phone number (e.g., +94770123456)';
    }
    
    return '';
  }, []);

  const validateName = useCallback((name: string): string => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  }, []);
  
  const validateRoles = useCallback((): string => {
    if (newUser.roles.length === 0) {
      return 'At least one role must be selected';
    }
    
    for (const role of newUser.roles) {
      if (!canCreateUserWithRole(role)) {
        return `You don't have permission to assign the ${formatRoleName(role)} role`;
      }
    }
    
    return '';
  }, [newUser.roles, canCreateUserWithRole, formatRoleName]);

  // ENTERPRISE: Optimized field change handler
  const handleFieldChange = useCallback((field: keyof typeof newUser, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    
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
  }, [setNewUser, validateEmail, validatePhone, validateName]);

  const handleDepartmentSelect = useCallback((department: string) => {
    setNewUser(prev => ({ ...prev, department }));
    setShowDepartmentDropdown(false);
  }, [setNewUser]);

  const handleDepartmentToggle = useCallback(() => {
    setShowDepartmentDropdown(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [setShowAddModal, resetForm]);

  const handleTempPasswordToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGenerateTempPassword(e.target.checked);
  }, [setGenerateTempPassword]);

  // ENTERPRISE: Memoized form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors: { [key: string]: string } = {};
    errors.name = validateName(newUser.name);
    errors.email = validateEmail(newUser.email);
    errors.phone = validatePhone(newUser.phone);
    errors.roles = validateRoles();
    
    const hasErrors = Object.values(errors).some(error => error !== '');
    setValidationErrors(errors);
    
    if (!hasErrors) {
      if (editingUser && !generateTempPassword) {
        setNewUser(prev => ({ ...prev, password: 'NO_CHANGE' }));
      }
      
      handleAddUser();
    }
  }, [
    validateName, 
    validateEmail, 
    validatePhone, 
    validateRoles, 
    newUser, 
    editingUser, 
    generateTempPassword, 
    setNewUser, 
    handleAddUser
  ]);

  // ENTERPRISE: Memoized available roles with permission check
  const availableRolesWithPermissions = useMemo(() => {
    return getAvailableRoles().map(role => ({
      role,
      canAssign: canCreateUserWithRole(role),
      isSuperAdmin: role === 'SuperAdmin',
      isChecked: newUser.roles.some((userRole: string) => userRole.toLowerCase() === role.toLowerCase())
    }));
  }, [getAvailableRoles, canCreateUserWithRole, newUser.roles]);

  // ENTERPRISE: Memoized modal title
  const modalTitle = useMemo(() => 
    editingUser ? 'Edit User' : 'Add New User', 
    [editingUser]
  );

  // ENTERPRISE: Memoized password info message
  const passwordInfoMessage = useMemo(() => {
    if (!editingUser) {
      return "A secure temporary password will be generated for this user. They will be required to change it on first login.";
    } else if (generateTempPassword) {
      return "A new temporary password will be generated for this user. They will be required to change it on next login.";
    } else {
      return "The user's current password will be maintained.";
    }
  }, [editingUser, generateTempPassword]);

  if (!showAddModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
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
                <ValidationError error={validationErrors.name} />
              )}
            </div>
            
            {/* Email Field */}
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
                <ValidationError error={validationErrors.email} />
              )}
            </div>
            
            {/* Phone Field */}
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
                <ValidationError error={validationErrors.phone} />
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
                  onClick={handleDepartmentToggle}
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
                      <DepartmentOption
                        key={dept}
                        department={dept}
                        isSelected={newUser.department === dept}
                        onSelect={handleDepartmentSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Roles Section */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <label className="text-gray-700 text-sm font-medium font-['Nunito_Sans']">
                  Roles (Select multiple)
                </label>
              </div>
              <div className="space-y-2 pl-6">
                {availableRolesWithPermissions.map(({ role, canAssign, isSuperAdmin, isChecked }) => (
                  <RoleCheckbox
                    key={role}
                    role={role}
                    isChecked={isChecked}
                    canAssign={canAssign}
                    isSuperAdmin={isSuperAdmin}
                    formatRoleName={formatRoleName}
                    updateNewUserRoles={updateNewUserRoles}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
              {validationErrors.roles && (
                <div className="pl-6">
                  <ValidationError error={validationErrors.roles} />
                </div>
              )}
            </div>
            
            {/* Temporary Password Checkbox for Editing Users */}
            {editingUser && (
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="generate-temp-password"
                  checked={generateTempPassword}
                  onChange={handleTempPasswordToggle}
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
              <p>{passwordInfoMessage}</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
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
});

UserForm.displayName = 'UserForm';

export default UserForm;