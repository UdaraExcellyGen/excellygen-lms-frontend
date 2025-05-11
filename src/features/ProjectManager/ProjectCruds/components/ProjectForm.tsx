// ProjectCruds/components/ProjectForm.tsx - Fixed Role Selection
import React, { useEffect, useRef } from 'react';
import { X, Save, PlusCircle, MinusCircle } from 'lucide-react';
import { EmployeeTechnology, ProjectRole } from '../data/types';

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
    };
    selectedTechnologiesDisplay: string[];
    error: string | null;
    isSubmitting: boolean;
    availableTechnologies: EmployeeTechnology[];
    projectRoles: ProjectRole[];
    onClose: () => void;
    onSubmit: () => void;
    onTechnologyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>, index: number) => void;
    onRoleAmountChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    onInputChange: (field: string, value: string | number) => void;
    addRoleAssignment: () => void;
    removeRoleAssignment: (index: number) => void;
    removeTechnology: (techName: string) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    isOpen,
    isEditing,
    formData,
    formErrors,
    selectedTechnologiesDisplay,
    error,
    isSubmitting,
    availableTechnologies,
    projectRoles,
    onClose,
    onSubmit,
    onTechnologyChange,
    onRoleChange,
    onRoleAmountChange,
    onInputChange,
    addRoleAssignment,
    removeRoleAssignment,
    removeTechnology
}) => {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const initialFocusRef = useRef(false);
    
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);
    
    // Separate useEffect only for focusing the name input when the form first opens
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-modalEnter">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl text-russian-violet font-['Unbounded']">
                        {isEditing ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-indigo hover:text-[#BF4BF6] transition-all duration-300"
                        aria-label="Close form"
                        title="Close form"
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-russian-violet mb-1">
                            Project Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="project-name"
                            ref={nameInputRef}
                            type="text"
                            value={formData.name}
                            onChange={(e) => onInputChange('name', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-gray-200'}
                                       focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                            required
                            aria-required="true"
                        />
                        {formErrors.name && (
                            <p className="mt-1 text-xs text-red-500" role="alert">Project name is required</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="project-status" className="block text-sm font-medium text-russian-violet mb-1">
                                Status
                            </label>
                            <select
                                id="project-status"
                                value={formData.status}
                                onChange={(e) => onInputChange('status', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200
                                         focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            >
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="project-start-date" className="block text-sm font-medium text-russian-violet mb-1">
                                Start Date<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="project-start-date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => onInputChange('startDate', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.startDate ? 'border-red-500' : 'border-gray-200'}
                                           focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                required
                                aria-required="true"
                            />
                            {formErrors.startDate && (
                                <p className="mt-1 text-xs text-red-500" role="alert">Start date is required</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="project-deadline" className="block text-sm font-medium text-russian-violet mb-1">
                                Deadline<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="project-deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => onInputChange('deadline', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.deadline ? 'border-red-500' : 'border-gray-200'}
                                           focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                required
                                aria-required="true"
                            />
                            {formErrors.deadline && (
                                <p className="mt-1 text-xs text-red-500" role="alert">Deadline is required</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="project-description" className="block text-sm font-medium text-russian-violet mb-1">
                            Description
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
                            Short Description
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
                        <label htmlFor="project-technologies" className="block text-sm font-medium text-russian-violet mb-1">
                            Required Technologies
                        </label>
                        <select
                            id="project-technologies"
                            multiple
                            value={selectedTechnologiesDisplay}
                            onChange={onTechnologyChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200
                                     focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] min-h-[120px] transition-all duration-200 custom-scrollbar"
                            aria-describedby="technologies-hint"
                        >
                            {availableTechnologies.map((tech) => (
                                <option key={tech.id.toString()} value={tech.name}>
                                    {tech.name}
                                </option>
                            ))}
                        </select>
                        <p id="technologies-hint" className="mt-1 text-xs text-indigo">
                            Hold Ctrl/Cmd to select multiple technologies
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedTechnologiesDisplay.map((techName) => (
                                <span key={techName} className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-gradient-primary text-white shadow-soft">
                                    {techName}
                                    <button
                                        type="button"
                                        className="ml-2 text-white hover:text-gray-200 focus:outline-none transition-all duration-300"
                                        onClick={() => removeTechnology(techName)}
                                        aria-label={`Remove ${techName} technology`}
                                        title={`Remove ${techName}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* UPDATED ROLES SECTION - Using controlled component approach */}
                    <div>
                        <label className="block text-sm font-medium text-russian-violet mb-2">
                            Assigned Roles
                        </label>
                        <button
                            type="button"
                            onClick={addRoleAssignment}
                            className="mb-3 px-4 py-2 bg-gradient-primary text-white rounded-full
                                     hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft"
                            aria-label="Add role assignment"
                            title="Add role assignment"
                        >
                            <PlusCircle size={18} /> Add Role
                        </button>
                        <div>
                            {formData.assignedRoles.map((roleAssignment, index) => (
                                <div key={index} className="mb-3 bg-gray-50 rounded-lg border border-gray-200 card-hover">
                                    <div className="flex items-center gap-3 p-3">
                                        <div className="flex-grow">
                                            <label className="block text-sm text-russian-violet mb-1">Role</label>
                                            <select
                                                value={roleAssignment.roleId}
                                                onChange={(e) => onRoleChange(e, index)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                                            >
                                                <option value="">Select Role</option>
                                                {projectRoles.map((role) => (
                                                    <option 
                                                        key={role.id} 
                                                        value={role.id}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-sm text-russian-violet mb-1">Amount</label>
                                            <input
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

                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-indigo hover:text-[#BF4BF6] transition-all duration-300"
                        title="Cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 ${isSubmitting ? 'bg-gray-400' : 'bg-gradient-primary'} text-white rounded-full
                                 hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isSubmitting ? 'Processing...' : (isEditing ? 'Update project' : 'Add project')}
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Processing...' : (isEditing ? 'Update' : 'Add')} Project
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;