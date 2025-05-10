// ProjectCruds/components/TechnologyForm.tsx
import React, { useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';

interface TechnologyFormProps {
    isOpen: boolean;
    isEditing: boolean;
    formData: {
        name: string;
    };
    error: string | null;
    onClose: () => void;
    onSubmit: () => void;
    onInputChange: (value: string) => void;
}

const TechnologyForm: React.FC<TechnologyFormProps> = ({
    isOpen,
    isEditing,
    formData,
    error,
    onClose,
    onSubmit,
    onInputChange
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Focus the input field when modal opens
            inputRef.current?.focus();
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);
    
    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-modalEnter">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl text-russian-violet font-['Unbounded']">
                            {isEditing ? 'Edit Technology' : 'Add New Technology'}
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
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="technology-name" className="block text-sm font-medium text-russian-violet mb-1">
                                Technology Name<span className="text-red-500">*</span>
                            </label>                            <input
                                id="technology-name"
                                ref={inputRef}
                                type="text"
                                value={formData.name}
                                onChange={(e) => onInputChange(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'}
                                    focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200`}
                                required
                                aria-required="true"
                            />
                            {error && (
                                <p className="mt-1 text-xs text-red-500">
                                    {error.includes("Technology name is required") 
                                        ? "Technology name is required" 
                                        : "Please check your input"}
                                </p>
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
                            type="submit"
                            className="px-6 py-2 bg-gradient-primary text-white rounded-full
                                hover:bg-pale-purple transition-all duration-300 flex items-center gap-2 shadow-soft"
                        >
                            <Save size={18} />
                            {isEditing ? 'Update' : 'Add'} Technology
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TechnologyForm;