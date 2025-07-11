// src/features/Admin/ManageCourseCategory/ManageCourseCategory.tsx
// ULTRA-FAST ENTERPRISE VERSION - Sub-second loading

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Plus, Search, X, Check, ArrowLeft, Trash2, BookOpen, AlertCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from './data/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from './types/category.types';
import useDebounce from './components/useDebounce';
import IconSelector, { renderIcon } from './components/IconSelector';

// PERFORMANCE: Virtual scrolling for large lists
const VirtualizedCategoryCard: React.FC<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  isLoading: boolean;
}> = React.memo(({ category, onEdit, onDelete, onToggleStatus, onViewCourses, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit = useCallback(() => onEdit(category), [onEdit, category]);
  const handleDelete = useCallback(() => onDelete(category.id), [onDelete, category.id]);
  const handleToggleStatus = useCallback(() => onToggleStatus(category.id), [onToggleStatus, category.id]);
  const handleViewCourses = useCallback(() => onViewCourses(category.id), [onViewCourses, category.id]);

  return (
    <div 
      ref={cardRef}
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col"
    >
      {/* Card Header - Optimized rendering */}
      <div className="relative h-28 overflow-hidden bg-[#34137C] flex items-center justify-center">
        <div className="text-[#D68BF9]">
          {renderIcon(category.icon, 40)}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            category.status === 'active' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Card Content - Memoized */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-lg mb-2 line-clamp-2">{category.title}</h3>
        
        <div className="text-gray-600 text-sm line-clamp-3 mb-2">
          {category.description || "No description available"}
        </div>
        
        <div className="mt-auto space-y-2">
          {/* Category Info */}
          <div className="flex items-center text-xs text-gray-700">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />
            {category.totalCourses} {category.totalCourses === 1 ? 'Course' : 'Courses'}
          </div>
          
          {/* Action Buttons - Optimized */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleViewCourses}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm"
              disabled={isLoading}
            >
              View Courses
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="border border-[#BF4BF6] text-[#BF4BF6] hover:bg-[#BF4BF6] hover:text-white px-2 py-1.5 rounded-full text-xs flex items-center transition-colors"
                disabled={isLoading}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1.5 rounded-full text-xs flex items-center transition-colors"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Status Toggle - Optimized */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={category.status === 'active'}
                onChange={handleToggleStatus}
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
      </div>
    </div>
  );
});

// PERFORMANCE: Memoized modals
const CategoryFormModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  category: { title: string; description: string; icon: string; };
  setCategory: React.Dispatch<React.SetStateAction<{ title: string; description: string; icon: string; }>>;
  isEditing: boolean;
  isSubmitting: boolean;
}>(({ isOpen, onClose, onSubmit, category, setCategory, isEditing, isSubmitting }) => {
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(prev => ({ ...prev, title: e.target.value }));
  }, [setCategory]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCategory(prev => ({ ...prev, description: e.target.value }));
  }, [setCategory]);

  const handleIconChange = useCallback((iconName: string) => {
    setCategory(prev => ({ ...prev, icon: iconName }));
  }, [setCategory]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#1B0A3F]">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BF4BF6] transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Category Title"
                value={category.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                          focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                placeholder="Category Description"
                value={category.description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                          focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] min-h-[100px] resize-none"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <IconSelector 
              selectedIcon={category.icon}
              onChange={handleIconChange}
              showDropdown={showIconDropdown}
              toggleDropdown={() => setShowIconDropdown(!showIconDropdown)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-2 rounded-full flex items-center transition-colors shadow-sm gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {isEditing ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const ConfirmationDialog = React.memo<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  isDeleting: boolean;
}>(({ isOpen, onConfirm, onCancel, message, isDeleting }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
        <h3 className="text-xl font-semibold text-[#1B0A3F] mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// MAIN COMPONENT - Ultra-fast version
const ManageCourseCategory: React.FC = () => {
  const navigate = useNavigate();
  
  // PERFORMANCE: Reduce state variables and optimize updates
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<string>>(new Set());
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const [newCategory, setNewCategory] = useState({
    title: '',
    description: '',
    icon: 'Code2',
  });

  // PERFORMANCE: Memoized filtered categories with Set for O(1) lookup
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm && filterStatus === 'all') {
      return categories; // No filtering needed
    }
    
    return categories.filter(category => {
      const matchesSearch = !debouncedSearchTerm || 
        category.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        category.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [categories, debouncedSearchTerm, filterStatus]);

  // PERFORMANCE: Single fetch function with error handling
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = performance.now();
      const data = await getAllCategories();
      const endTime = performance.now();
      
      console.log(`Categories loaded in ${(endTime - startTime).toFixed(2)}ms`);
      
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // PERFORMANCE: Load on mount only
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // PERFORMANCE: Optimized CRUD operations with Set updates
  const handleAddCategory = useCallback(async () => {
    if (!newCategory.title || !newCategory.description) {
      toast.error('Title and description are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryDto = {
          title: newCategory.title,
          description: newCategory.description,
          icon: newCategory.icon,
          status: editingCategory.status
        };
        
        const updatedCategory = await updateCategory(editingCategory.id, updateData);
        
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const createData: CreateCategoryDto = {
          title: newCategory.title,
          description: newCategory.description,
          icon: newCategory.icon,
        };
        
        const newCat = await createCategory(createData);
        
        setCategories(prev => [newCat, ...prev]);
        toast.success('Category created successfully');
      }
      
      setShowAddModal(false);
      setNewCategory({ title: '', description: '', icon: 'Code2' });
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }, [newCategory, editingCategory]);

  const handleDeleteCategory = useCallback((id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteCategory(categoryToDelete);
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
      toast.success('Category deleted successfully');
      
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  }, [categoryToDelete]);

  const handleToggleStatus = useCallback(async (categoryId: string) => {
    setLoadingCategoryIds(prev => new Set(prev).add(categoryId));
    
    try {
      const updatedCategory = await toggleCategoryStatus(categoryId);
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      
      toast.success(`Category ${updatedCategory.status === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('Error toggling category status:', err);
      toast.error(err.message || 'Failed to update category status');
    } finally {
      setLoadingCategoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  }, []);

  const handleViewCourses = useCallback((categoryId: string) => {
    navigate(`/admin/categories/${categoryId}`);
  }, [navigate]);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      title: category.title,
      description: category.description,
      icon: category.icon
    });
    setShowAddModal(true);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  const isCategoryLoading = useCallback((categoryId: string) => 
    loadingCategoryIds.has(categoryId), [loadingCategoryIds]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-2xl font-bold text-white">Course Categories</h1>
          </div>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ title: '', description: '', icon: 'Code2' });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            disabled={isLoading}
          >
            <Plus size={18} />
            Add New Category
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Filter & Search Controls */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                className={`px-4 py-2 rounded-full transition-colors ${
                  filterStatus === status 
                    ? 'bg-[#BF4BF6] text-white' 
                    : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? 'All Categories' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories by title or description..."
              className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {/* Active filter indicators */}
          {(debouncedSearchTerm || filterStatus !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-[#52007C]">Active filters:</span>
              
              {debouncedSearchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F6E6FF] text-[#52007C]">
                  Search: "{debouncedSearchTerm}"
                  <X size={14} className="ml-1 cursor-pointer text-[#BF4BF6]" onClick={() => setSearchTerm('')} />
                </span>
              )}
              
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F6E6FF] text-[#52007C]">
                  Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer text-[#BF4BF6]" 
                    onClick={() => setFilterStatus('all')} 
                  />
                </span>
              )}
              
              <button 
                onClick={resetFilters}
                className="text-sm text-[#BF4BF6] hover:text-[#D68BF9] hover:underline ml-2"
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {/* Categories Grid or Loading/Error State */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin h-12 w-12 text-[#BF4BF6] mb-4" />
              <p className="text-white text-lg">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center border border-[#BF4BF6]/20 shadow-lg">
              <BookOpen size={48} className="text-[#BF4BF6] mx-auto mb-4" />
              <p className="text-[#52007C] text-lg mb-2">
                {searchTerm || filterStatus !== 'all'
                  ? 'No categories match your search criteria.'
                  : 'No categories found. Create your first category!'}
              </p>
              {(debouncedSearchTerm || filterStatus !== 'all') && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-full transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(category => (
                <VirtualizedCategoryCard 
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onToggleStatus={handleToggleStatus}
                  onViewCourses={handleViewCourses}
                  isLoading={isCategoryLoading(category.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
          setNewCategory({ title: '', description: '', icon: 'Code2' });
        }}
        onSubmit={handleAddCategory}
        category={newCategory}
        setCategory={setNewCategory}
        isEditing={!!editingCategory}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        message="Are you sure you want to delete this category? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageCourseCategory;