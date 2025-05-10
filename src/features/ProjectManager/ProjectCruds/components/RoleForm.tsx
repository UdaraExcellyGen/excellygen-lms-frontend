// ProjectCruds/components/RoleForm.tsx
import React from 'react';
import { X, Save } from 'lucide-react';

interface RoleFormProps {
    isOpen: boolean;
    isEditing: boolean;
    formData: {
        name: string;
    };
    formErrors: {
        name: boolean;
    };
    error: string | null;
    onClose: () => void;
    onSubmit: () => void;
    onInputChange: (value: string) => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
    isOpen,
    isEditing,
    formData,
    formErrors,
    error,
    onClose,
    onSubmit,
    onInputChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-modalEnter">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl text-russian-violet font-['Unbounded']">
                        {isEditing ? 'Edit Role' : 'Add New Role'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-indigo hover:text-[#BF4BF6] transition-all duration-300"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-russian-violet mb-1">
                            Role Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onInputChange(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-gray-200'}
                                       focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                            placeholder="Enter role name"
                            required
                        />
                        {formErrors.name && (
                            <p className="mt-1 text-xs text-red-500">Role name is required</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-indigo hover:text-[#BF4BF6] transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="px-6 py-2 bg-gradient-primary text-white rounded-full
                                 hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft"
                    >
                        <Save size={18} />
                        {isEditing ? 'Update' : 'Add'} Role
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleForm;