import React from 'react';
import { Pencil, Trash2, BookOpen, RefreshCw, AlertTriangle } from 'lucide-react';
import { Category } from '../types/category.types';
import { renderIcon } from './IconSelector';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  onRestore: (id: string) => void; // New prop for restoring
  isLoading: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewCourses,
  onRestore,
  isLoading
}) => {
  // If the category is soft-deleted, render the "Trashed" card view
  if (category.isDeleted) {
    return (
      <div className="bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-400/80 h-full flex flex-col p-4 text-center items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-gray-500 mb-2" />
        <h3 className="font-semibold text-gray-700 text-lg mb-1 line-clamp-2">{category.title}</h3>
        <p className="text-gray-500 text-sm mb-4">This category is in the trash.</p>
        <button
          onClick={() => onRestore(category.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm disabled:bg-blue-300"
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          Restore
        </button>
      </div>
    );
  }

  // Default card for active/inactive (but not deleted) categories
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col">
      <div className="relative h-28 overflow-hidden bg-[#34137C] flex items-center justify-center">
        <div className="text-[#D68BF9]">{renderIcon(category.icon, 40)}</div>
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${category.status === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-lg mb-2 line-clamp-2">{category.title}</h3>
        <div className="text-gray-600 text-sm line-clamp-3 mb-2 min-h-[40px]">{category.description || "No description available"}</div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-xs text-gray-700">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />
            {category.totalCourses} {category.totalCourses === 1 ? 'Course' : 'Courses'}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => onViewCourses(category.id)}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm"
              disabled={isLoading}
            >
              View Courses
            </button>
            <div className="flex gap-1">
              <button onClick={() => onEdit(category)} className="border border-gray-300 text-gray-600 hover:bg-gray-100 p-1.5 rounded-full text-xs flex items-center transition-colors" disabled={isLoading}><Pencil size={14} /></button>
              <button onClick={() => onDelete(category.id)} className="border border-red-300 text-red-500 hover:bg-red-50 p-1.5 rounded-full text-xs flex items-center transition-colors" disabled={isLoading}><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
            <span>Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={category.status === 'active'} onChange={() => onToggleStatus(category.id)} className="sr-only peer" disabled={isLoading} />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 ${isLoading ? 'after:animate-pulse' : 'after:transition-all'} peer-checked:bg-[#BF4BF6] shadow-inner`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;