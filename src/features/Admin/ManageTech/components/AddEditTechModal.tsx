import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Technology } from '../types/Technology';

interface AddEditTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (techData: { name: string }) => void;
  editingTech: Technology | null;
}

const AddEditTechModal: React.FC<AddEditTechModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTech 
}) => {
  const [techData, setTechData] = useState({ name: '' });

  useEffect(() => {
    if (editingTech) {
      setTechData({ name: editingTech.name });
    } else {
      setTechData({ name: '' });
    }
  }, [editingTech]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(techData);
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
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Technology Name"
              value={techData.name}
              onChange={(e) => setTechData({...techData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
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
              {editingTech ? 'Update' : 'Add'} Technology
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTechModal;