import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Category } from '../types/Category';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">{category.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                     hover:bg-[#F6E6FF] transition-colors duration-200"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                     hover:bg-red-50 transition-colors duration-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <p className="text-gray-600 mb-4 font-['Nunito_Sans']">{category.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 font-['Nunito_Sans']">
          {category.totalCourses} Courses
        </span>
        <button
          onClick={() => onToggleStatus(category.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-['Nunito_Sans'] transition-all duration-300
                   ${category.status === 'active' 
                     ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                     : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'}`}
        >
          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;