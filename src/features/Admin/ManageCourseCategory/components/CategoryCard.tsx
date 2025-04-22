import React from 'react';
import { Pencil, Trash2, BookOpen } from 'lucide-react';
import { Category } from '../types/category.types';
import { renderIcon } from './IconSelector';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  isLoading: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewCourses,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md flex flex-col h-full min-h-[250px]">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#F6E6FF] text-[#BF4BF6]">
            {renderIcon(category.icon)}
          </div>
          <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">{category.title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                    hover:bg-[#F6E6FF] transition-colors duration-200"
            disabled={isLoading}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                    hover:bg-red-50 transition-colors duration-200"
            disabled={isLoading}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Card Content - with flex-grow to push footer to bottom */}
      <p className="text-gray-600 mb-4 flex-grow font-['Nunito_Sans']">{category.description}</p>
      
      {/* Card Footer - this will stick to the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-['Nunito_Sans']">
            {category.totalCourses} Courses
          </span>
          <div className="flex items-center">
            <span className={`text-sm font-medium mr-2
              ${category.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
              {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={category.status === 'active'}
                onChange={() => onToggleStatus(category.id)}
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
        </div>
        
        {/* View Courses button */}
        <button
          onClick={() => onViewCourses(category.id)}
          className="w-full mt-3 px-4 py-2 bg-[#F6E6FF] text-[#BF4BF6] rounded-lg text-sm font-['Nunito_Sans'] 
                hover:bg-[#BF4BF6] hover:text-white transition-all duration-300 flex items-center justify-center gap-1"
        >
          <BookOpen size={14} />
          View Courses
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;