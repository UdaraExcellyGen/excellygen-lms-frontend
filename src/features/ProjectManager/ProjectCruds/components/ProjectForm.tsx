// Enhanced ProjectForm.tsx with Advanced Technology Selection and Date Validation
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, PlusCircle, MinusCircle, AlertCircle, ChevronDown, Check, Search } from 'lucide-react';
import { EmployeeTechnology, ProjectRole } from '../data/types';

// Role Select Component with matching styles
const RoleSelectDropdown = ({
  availableRoles,
  selectedRole,
  onRoleChange,
  placeholder = "Select Role",
  index,
  t
}: {
  availableRoles: ProjectRole[];
  selectedRole: { roleId: number | string, roleName: string };
  onRoleChange: (role: ProjectRole) => void;
  placeholder?: string;
  index: number;
  t: (key: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRole = (role: ProjectRole) => {
    onRoleChange(role);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedRoleName = selectedRole.roleId ? 
    availableRoles.find(role => role.id === selectedRole.roleId)?.name || placeholder : 
    placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-200 rounded-lg hover:border-[#BF4BF6] focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <span className={`${selectedRole.roleId ? 'text-indigo' : 'text-gray-500'}`}>
            {selectedRoleName}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg animate-modalEnter">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('projectManager.projectCruds.searchRoles')}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BF4BF6]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Role list */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar" role="listbox">
            {filteredRoles.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No roles found</div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = selectedRole.roleId === role.id;
                return (
                  <button
                    key={role.id.toString()}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className="w-full flex items-center px-4 py-2 hover:bg-pale-purple cursor-pointer transition-colors text-left"
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-indigo">{role.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 ml-auto text-[#BF4BF6]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Done button */}
          <div className="p-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#52007C] transition-colors font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Advanced Technology Select Component
const TechnologySelectDropdown = ({
  availableTechnologies,
  selectedTechnologies,
  onTechnologyChange,
  onRemoveTechnology,
  t
}: {
  availableTechnologies: EmployeeTechnology[];
  selectedTechnologies: { id: number | string, name: string }[];
  onTechnologyChange: (tech: { id: number | string, name: string }) => void;
  onRemoveTechnology: (techName: string) => void;
  t: (key: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTechnologies = availableTechnologies.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleTechnology = (tech: EmployeeTechnology) => {
    const isSelected = selectedTechnologies.some(t => t.id === tech.id);
    if (isSelected) {
      onRemoveTechnology(tech.name);
    } else {
      onTechnologyChange({ id: tech.id, name: tech.name });
    }
  };

  const handleSelectAll = () => {
    availableTechnologies.forEach(tech => {
      if (!selectedTechnologies.some(t => t.id === tech.id)) {
        onTechnologyChange({ id: tech.id, name: tech.name });
      }
    });
  };

  const handleClearAll = () => {
    selectedTechnologies.forEach(tech => onRemoveTechnology(tech.name));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-200 rounded-lg hover:border-[#BF4BF6] focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <span className="text-indigo">
            {selectedTechnologies.length > 0
              ? `${selectedTechnologies.length} technologie${selectedTechnologies.length === 1 ? '' : 's'} selected`
              : 'Select technologies'}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg animate-modalEnter">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('projectManager.projectCruds.searchTechnologies')}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BF4BF6]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Technology list */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar" role="listbox">
            {filteredTechnologies.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No technologies found</div>
            ) : (
              filteredTechnologies.map((tech) => {
                const isSelected = selectedTechnologies.some(t => t.id === tech.id);
                return (
                  <label
                    key={tech.id.toString()}
                    className="flex items-center px-4 py-2 hover:bg-pale-purple cursor-pointer transition-colors"
                    role="option"
                    aria-selected={isSelected}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTechnology(tech)}
                      className="w-4 h-4 text-[#BF4BF6] border-gray-300 rounded focus:ring-[#BF4BF6]"
                    />
                    <span className="ml-3 text-indigo">{tech.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 ml-auto text-[#BF4BF6]" />
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Select all / Clear all / Done */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-[#BF4BF6] hover:text-[#52007C] font-medium transition-colors"
              >
                Select All {searchTerm ? 'Matching' : ''}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                Clear All Selected
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#52007C] transition-colors font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProjectFormProps {
    isOpen: boolean;
    isEditing: boolean;
    formData: {
        name: string;
        status: string;
        deadline: string;
        description: string;
        shortDescription: string;
        requiredTechnologies: { id: number | string, name: string }[];
        progress: number;
        startDate: string;
        assignedRoles: { roleId: number | string, roleName: string, amount: number }[];
    };
    formErrors: {
        name: boolean;
        deadline: boolean;
        startDate: boolean;
        dateOrder?: boolean;
    };
    error: string | null;
    fieldErrors?: string[];
    isSubmitting: boolean;
    availableTechnologies: EmployeeTechnology[];
    projectRoles: ProjectRole[];
    onClose: () => void;
    onSubmit: () => void;
    onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>, index: number) => void;
    onRoleAmountChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    onInputChange: (field: string, value: string | number | { id: number | string, name: string }[]) => void;
    addRoleAssignment: () => void;
    removeRoleAssignment: (index: number) => void;
    removeTechnology: (techName: string) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    isOpen,
    isEditing,
    formData,
    formErrors,
    error,
    fieldErrors,
    isSubmitting,
    availableTechnologies,
    projectRoles,
    onClose,
    onSubmit,
    onRoleChange,
    onRoleAmountChange,
    onInputChange,
    addRoleAssignment,
    removeRoleAssignment,
    removeTechnology
}) => {
    const { t } = useTranslation();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const initialFocusRef = useRef(false);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent background scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscKey);
            // Restore background scroll when modal is closed
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && !initialFocusRef.current) {
            nameInputRef.current?.focus();
            initialFocusRef.current = true;
        }
        if (!isOpen) {
            initialFocusRef.current = false;
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubmitting) {
            onSubmit();
        }
    };

    const handleTechnologyAdd = (tech: { id: number | string, name: string }) => {
        if (!formData.requiredTechnologies.some(t => t.id === tech.id)) {
            const updatedTechnologies = [...formData.requiredTechnologies, tech];
            onInputChange('requiredTechnologies', updatedTechnologies);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col animate-modalEnter">
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl text-russian-violet font-['Unbounded']">
                        {isEditing ? t('projectManager.projectCruds.editProject') : t('projectManager.projectCruds.addProject')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-indigo hover:text-[#BF4BF6] transition-all duration-300 p-1"
                        aria-label="Close form"
                        title="Close form"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2" role="alert">
                                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {fieldErrors && fieldErrors.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg" role="alert">
                                <div className="flex items-start gap-2 mb-2">
                                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Please fix the following issues:</span>
                                </div>
                                <ul className="list-disc list-inside ml-6 space-y-1">
                                    {fieldErrors.map((errorMsg, index) => (
                                        <li key={index} className="text-sm">{errorMsg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="project-name" className="block text-sm font-medium text-russian-violet mb-1">
                                    {t('projectManager.projectCruds.projectName')}<span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="project-name"
                                    ref={nameInputRef}
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                                               focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                    required
                                    aria-required="true"
                                    aria-invalid={formErrors.name}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                                        <AlertCircle size={12} />
                                        {t('projectManager.projectCruds.projectNameRequired')}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="project-status" className="block text-sm font-medium text-russian-violet mb-1">
                                        {t('projectManager.projectCruds.status')}
                                    </label>
                                    <select
                                        id="project-status"
                                        value={formData.status}
                                        onChange={(e) => onInputChange('status', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200
                                                 focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                                    >
                                        <option value="Active">{t('projectManager.employeeAssign.active')}</option>
                                        <option value="Completed">{t('projectManager.employeeAssign.completed')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="project-start-date" className="block text-sm font-medium text-russian-violet mb-1">
                                        {t('projectManager.projectCruds.startDate')}<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="project-start-date"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => onInputChange('startDate', e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border ${formErrors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                                                   focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                        required
                                        aria-required="true"
                                        aria-invalid={formErrors.startDate}
                                    />
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                                            <AlertCircle size={12} />
                                            {t('projectManager.projectCruds.startDateRequired')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="project-deadline" className="block text-sm font-medium text-russian-violet mb-1">
                                        {t('projectManager.cards.deadline')}<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="project-deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => onInputChange('deadline', e.target.value)}
                                        min={formData.startDate || undefined}
                                        className={`w-full px-4 py-2 rounded-lg border ${formErrors.deadline || formErrors.dateOrder ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                                                   focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                        required
                                        aria-required="true"
                                        aria-invalid={formErrors.deadline || formErrors.dateOrder}
                                    />
                                    {formErrors.deadline && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                                            <AlertCircle size={12} />
                                            {t('projectManager.projectCruds.deadlineRequired')}
                                        </p>
                                    )}
                                    {formErrors.dateOrder && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                                            <AlertCircle size={12} />
                                            {t('projectManager.projectCruds.deadlineAfterStart')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {formData.startDate && (
                                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
                                    <strong>{t('projectManager.projectCruds.note')}</strong> {t('projectManager.projectCruds.deadlineNote')} {new Date(formData.startDate).toLocaleDateString()}
                                </div>
                            )}

                            <div>
                                <label htmlFor="project-description" className="block text-sm font-medium text-russian-violet mb-1">
                                    {t('projectManager.projectCruds.description')}
                                </label>
                                <textarea
                                    id="project-description"
                                    value={formData.description}
                                    onChange={(e) => onInputChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200
                                             focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] min-h-[100px] transition-all duration-200 custom-scrollbar"
                                />
                            </div>

                            <div>
                                <label htmlFor="project-short-description" className="block text-sm font-medium text-russian-violet mb-1">
                                    {t('projectManager.projectCruds.shortDescription')}
                                </label>
                                <textarea
                                    id="project-short-description"
                                    value={formData.shortDescription}
                                    onChange={(e) => onInputChange('shortDescription', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200
                                             focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200 custom-scrollbar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-russian-violet mb-1">
                                    {t('projectManager.cards.requiredTechnologies')}
                                </label>
                                <TechnologySelectDropdown
                                    availableTechnologies={availableTechnologies}
                                    selectedTechnologies={formData.requiredTechnologies}
                                    onTechnologyChange={handleTechnologyAdd}
                                    onRemoveTechnology={removeTechnology}
                                    t={t}
                                />
                                {formData.requiredTechnologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.requiredTechnologies.map((tech) => (
                                            <span key={tech.id.toString()} className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-gradient-primary text-white shadow-soft">
                                                {tech.name}
                                                <button
                                                    type="button"
                                                    className="ml-2 text-white hover:text-gray-200 focus:outline-none transition-all duration-300"
                                                    onClick={() => removeTechnology(tech.name)}
                                                    aria-label={`Remove ${tech.name} technology`}
                                                    title={`Remove ${tech.name}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-russian-violet mb-2">
                                    {t('projectManager.cards.requiredRoles')}
                                </label>
                                <button
                                    type="button"
                                    onClick={addRoleAssignment}
                                    className="mb-3 px-4 py-2 bg-gradient-primary text-white rounded-full
                                             hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft"
                                    aria-label="Add role assignment"
                                    title="Add role assignment"
                                >
                                    <PlusCircle size={18} /> {t('projectManager.projectCruds.addRole')}
                                </button>
                                <div>
                                    {formData.assignedRoles.map((roleAssignment, index) => (
                                        <div key={index} className="mb-3 bg-gray-50 rounded-lg border border-gray-200 card-hover">
                                            <div className="flex items-center gap-3 p-3">
                                                <div className="flex-grow">
                                                    <label className="block text-sm text-russian-violet mb-1">{t('projectManager.dialogs.role')}</label>
                                                    <RoleSelectDropdown
                                                        availableRoles={projectRoles}
                                                        selectedRole={roleAssignment}
                                                        onRoleChange={(role) => {
                                                            // Create a synthetic event to maintain compatibility with existing handler
                                                            const syntheticEvent = {
                                                                target: { value: role.id.toString() }
                                                            } as React.ChangeEvent<HTMLSelectElement>;
                                                            onRoleChange(syntheticEvent, index);
                                                        }}
                                                        placeholder={t('projectManager.dialogs.selectRole')}
                                                        index={index}
                                                        t={t}
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <label htmlFor={`role-amount-${index}`} className="block text-sm text-russian-violet mb-1">{t('projectManager.projectCruds.amount')}</label>
                                                    <input
                                                        id={`role-amount-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={roleAssignment.amount}
                                                        onChange={(e) => onRoleAmountChange(e, index)}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRoleAssignment(index)}
                                                    className="p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-red-500 transition-all duration-300 self-end"
                                                    aria-label={`Remove role assignment ${index + 1}`}
                                                    title="Remove role assignment"
                                                >
                                                    <MinusCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="border-t border-gray-200 p-6 flex justify-end gap-4 flex-shrink-0 bg-white rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-indigo hover:text-[#BF4BF6] transition-all duration-300"
                        title="Cancel"
                    >
                        {t('projectManager.dialogs.cancel')}
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-2 ${isSubmitting ? 'bg-gray-400' : 'bg-gradient-primary'} text-white rounded-full
                                 hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isSubmitting ? t('projectManager.projectCruds.processing') : (isEditing ? t('projectManager.projectCruds.updateProject') : t('projectManager.projectCruds.addProject'))}
                    >
                        <Save size={18} />
                        {isSubmitting ? t('projectManager.projectCruds.processing') : (isEditing ? `${t('projectManager.projectCruds.update')} Project` : `${t('projectManager.projectCruds.add')} Project`)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;