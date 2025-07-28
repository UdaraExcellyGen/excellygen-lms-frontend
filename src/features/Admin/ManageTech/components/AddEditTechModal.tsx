// src/features/Admin/ManageTech/components/AddEditTechModal.tsx
// ENTERPRISE OPTIMIZED: Instant, professional modal interactions
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Technology, TechFormValues } from '../types/technology.types';

interface AddEditTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TechFormValues) => Promise<void>;
  editingTech: Technology | null;
  isLoading: boolean;
}

// ENTERPRISE: Professional modal with instant interactions
export const AddEditTechModal: React.FC<AddEditTechModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTech,
  isLoading
}) => {
  const [formValues, setFormValues] = useState<TechFormValues>({
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ENTERPRISE: Smart form initialization
  useEffect(() => {
    if (isOpen) {
      if (editingTech) {
        setFormValues({
          name: editingTech.name
        });
      } else {
        setFormValues({
          name: ''
        });
      }
      setValidationError('');
      
      // ENTERPRISE: Auto-focus with delay for smooth animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [editingTech, isOpen]);

  // ENTERPRISE: Real-time validation
  const validateForm = useCallback((values: TechFormValues): string => {
    if (!values.name.trim()) {
      return 'Technology name is required';
    }
    if (values.name.trim().length < 2) {
      return 'Technology name must be at least 2 characters';
    }
    if (values.name.trim().length > 50) {
      return 'Technology name must be less than 50 characters';
    }
    return '';
  }, []);

  // ENTERPRISE: Smart input handling with validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValues = {
      ...formValues,
      [name]: value
    };
    setFormValues(newValues);
    
    // ENTERPRISE: Real-time validation feedback
    const error = validateForm(newValues);
    setValidationError(error);
  }, [formValues, validateForm]);

  // ENTERPRISE: Optimistic form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ENTERPRISE: Final validation
    const error = validateForm(formValues);
    if (error) {
      setValidationError(error);
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setValidationError('');
    
    try {
      await onSubmit(formValues);
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, validateForm, onSubmit]);

  // ENTERPRISE: Smart escape key handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  // ENTERPRISE: Click outside to close (when not submitting)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  // ENTERPRISE: Don't render if not open
  if (!isOpen) return null;

  const isFormValid = !validationError && formValues.name.trim().length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 
            id="modal-title"
            className="text-xl text-[#1B0A3F] font-bold"
          >
            {editingTech ? 'Edit Technology' : 'Add New Technology'}
          </h2>
          {!isSubmitting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#BF4BF6] transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="tech-name" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Technology Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="tech-name"
                  type="text"
                  name="name"
                  placeholder="Enter technology name"
                  value={formValues.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    validationError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]'
                  }`}
                  required
                  disabled={isSubmitting}
                  maxLength={50}
                />
                
                {/* ENTERPRISE: Character count indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {formValues.name.length}/50
                </div>
              </div>
              
              {/* ENTERPRISE: Real-time validation feedback */}
              {validationError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X size={14} />
                  {validationError}
                </p>
              )}
              
              {/* ENTERPRISE: Success indicator */}
              {!validationError && formValues.name.trim().length > 1 && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check size={14} />
                  Looks good!
                </p>
              )}
            </div>
          </div>

          {/* ENTERPRISE: Professional action buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>{editingTech ? 'Updating...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>{editingTech ? 'Update Technology' : 'Add Technology'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ENTERPRISE: Progress indicator for long operations */}
        {isSubmitting && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};