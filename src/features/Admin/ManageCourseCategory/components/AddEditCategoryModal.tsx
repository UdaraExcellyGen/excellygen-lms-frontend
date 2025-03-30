import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types/Category';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: { title: string; description: string; icon: string }) => void;
  editingCategory: Category | null;
}

const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingCategory 
}) => {
  const [categoryData, setCategoryData] = useState({ 
    title: '', 
    description: '', 
    icon: '' 
  });

  useEffect(() => {
    if (editingCategory) {
      setCategoryData({ 
        title: editingCategory.title, 
        description: editingCategory.description, 
        icon: editingCategory.icon 
      });
    } else {
      setCategoryData({ title: '', description: '', icon: '' });
    }
  }, [editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(categoryData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BF4BF6]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Category Title"
              value={categoryData.title}
              onChange={(e) => setCategoryData({...categoryData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              required
            />
            <textarea
              placeholder="Category Description"
              value={categoryData.description}
              onChange={(e) => setCategoryData({...categoryData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans'] min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
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
              {editingCategory ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCategoryModal;