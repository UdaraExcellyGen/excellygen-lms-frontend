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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-bold">
            {editingTech ? 'Edit Technology' : 'Add New Technology'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BF4BF6] transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label htmlFor="tech-name" className="block text-sm font-medium text-gray-700 mb-1">
              Technology Name
            </label>
            <input
              id="tech-name"
              type="text"
              name="name"
              placeholder="Enter technology name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] 
                       text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 
                       flex items-center gap-2 transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Check size={18} />
              )}
              {editingTech ? 'Update' : 'Add'} Technology
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};