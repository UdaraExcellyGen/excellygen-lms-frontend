import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Technology } from '../types/Technology';

interface TechnologyCardProps {
  technology: Technology;
  onEdit: (tech: Technology) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const TechnologyCard: React.FC<TechnologyCardProps> = ({ 
  technology, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">{technology.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(technology)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                     hover:bg-[#F6E6FF] transition-colors duration-200"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(technology.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                     hover:bg-red-50 transition-colors duration-200"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => onToggleStatus(technology.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-['Nunito_Sans'] transition-all duration-300
                     ${technology.status === 'active' 
                       ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                       : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'}`}
          >
            {technology.status.charAt(0).toUpperCase() + technology.status.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologyCard;