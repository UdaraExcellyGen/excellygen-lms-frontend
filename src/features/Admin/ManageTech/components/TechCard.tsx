import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Technology } from '../types/technology.types';

interface TechCardProps {
  technology: Technology;
  isTechLoading: (id: string) => boolean;
  onEdit: (tech: Technology) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TechCard: React.FC<TechCardProps> = ({
  technology,
  isTechLoading,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const { id, name, status } = technology;
  const isLoading = isTechLoading(id);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">{name}</h3>
        <div className="flex items-center gap-2">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 mr-1">
            <span className={`text-sm font-medium
              ${status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={status === 'active'}
                onChange={() => onToggleStatus(id)}
                className="sr-only peer"
                disabled={isLoading}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 ${isLoading ? 'after:animate-pulse' : 'after:transition-all'} 
                  peer-checked:bg-[#BF4BF6] shadow-inner`}></div>
            </label>
          </div>
          <button
            onClick={() => onEdit(technology)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                     hover:bg-[#F6E6FF] transition-colors duration-200"
            disabled={isLoading}
            aria-label="Edit technology"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                     hover:bg-red-50 transition-colors duration-200"
            disabled={isLoading}
            aria-label="Delete technology"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};