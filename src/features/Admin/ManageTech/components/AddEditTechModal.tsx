import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Technology, TechFormValues } from '../types/technology.types';

interface AddEditTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TechFormValues) => void;
  editingTech: Technology | null;
  isLoading: boolean;
}

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

  useEffect(() => {
    // Initialize form values when editing a technology
    if (editingTech) {
      setFormValues({
        name: editingTech.name
      });
    } else {
      // Reset form when adding a new technology
      setFormValues({
        name: ''
      });
    }
  }, [editingTech, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            {editingTech ? 'Edit Technology' : 'Add New Technology'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BF4BF6]"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Technology Name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans']"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Check size={20} />
              )}
              {editingTech ? 'Update' : 'Add'} Technology
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};