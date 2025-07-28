// src/features/Admin/ManageCourseCategory/components/CategoryCard.tsx
// ENTERPRISE OPTIMIZED: Instant responsive interactions, professional UX
import React, { useCallback, useRef } from 'react';
import { Pencil, Trash2, BookOpen, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Category } from '../types/category.types';
import { renderIcon } from './IconSelector';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  onRestore: (id: string) => void;
  isActionInProgress: boolean; // Only for specific action feedback
}

// ENTERPRISE: Optimized card component with instant interactions
const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewCourses,
  onRestore,
  isActionInProgress
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // ENTERPRISE: Memoized handlers for optimal performance
  const handleEdit = useCallback(() => onEdit(category), [onEdit, category]);
  const handleDelete = useCallback(() => onDelete(category.id), [onDelete, category.id]);
  const handleToggleStatus = useCallback(() => onToggleStatus(category.id), [onToggleStatus, category.id]);
  const handleViewCourses = useCallback(() => onViewCourses(category.id), [onViewCourses, category.id]);
  const handleRestore = useCallback(() => onRestore(category.id), [onRestore, category.id]);

  // ENTERPRISE: Professional soft-deleted state
  if (category.isDeleted) {
    return (
      <div 
        ref={cardRef}
        className="bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 h-full flex flex-col p-6 text-center items-center justify-center transition-all duration-200 hover:border-gray-400"
      >
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="font-semibold text-gray-700 text-lg mb-2 line-clamp-2">
          {category.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4">This category is in the trash.</p>
        {category.restoreAt && (
          <p className="text-xs text-gray-400 mb-4">
            Expires: {new Date(category.restoreAt).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={handleRestore}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-blue-300"
          disabled={isActionInProgress}
        >
          {isActionInProgress ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <RefreshCw size={16} />
          )}
          Restore
        </button>
      </div>
    );
  }

  // ENTERPRISE: Professional active/inactive card
  const isActive = category.status === 'active';

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-[#BF4BF6]/30 h-full flex flex-col group"
    >
      {/* Header with icon and status */}
      <div className="relative h-24 bg-gradient-to-br from-[#34137C] to-[#52007C] flex items-center justify-center">
        <div className="text-white/90 group-hover:text-white transition-colors">
          {renderIcon(category.icon, 36)}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isActive 
              ? 'bg-emerald-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
          {category.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-3 flex-1">
          {category.description || "No description available"}
        </p>

        {/* Stats */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <BookOpen className="w-4 h-4 mr-1.5 text-[#BF4BF6]" />
          <span className="font-medium">
            {category.totalCourses} {category.totalCourses === 1 ? 'Course' : 'Courses'}
          </span>
        </div>

        {/* Creator info */}
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Created by:</span>
            <span className="font-medium text-gray-700">{category.createdBy}</span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium text-gray-700">{category.createdAtFormatted}</span>
          </div>
          {category.updatedAt && category.updatedAtFormatted !== 'Never' && (
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="font-medium text-gray-700">{category.updatedAtFormatted}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center">
            <button
              onClick={handleViewCourses}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Courses
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="p-2 border border-gray-300 text-gray-600 hover:border-[#BF4BF6] hover:text-[#BF4BF6] hover:bg-[#BF4BF6]/5 rounded-lg transition-all duration-200"
                title="Edit category"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 border border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title={category.totalCourses > 0 ? "Cannot delete category with courses" : "Delete category"}
                disabled={category.totalCourses > 0}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={handleToggleStatus}
                className="sr-only peer"
                disabled={isActionInProgress}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#BF4BF6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BF4BF6] shadow-inner">
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;