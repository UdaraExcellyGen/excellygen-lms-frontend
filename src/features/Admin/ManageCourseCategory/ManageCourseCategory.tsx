// src/features/Admin/ManageCourseCategory/ManageCourseCategory.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Plus, Search, X, Check, ArrowLeft, Trash2, BookOpen, AlertCircle, Loader2, RefreshCw, ServerCrash, Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  restoreCategory
} from './data/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from './types/category.types';
import useDebounce from './components/useDebounce';
import IconSelector, { renderIcon } from './components/IconSelector';

// ENTERPRISE: Skeleton placeholder for instant loading experience
const CategorySkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 h-full flex flex-col animate-pulse">
    <div className="h-28 bg-gray-200"></div>
    <div className="p-4 flex-1 flex flex-col space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="mt-auto space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Optimized category card - No loading states
const VirtualizedCategoryCard: React.FC<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  onRestore: (id: string) => void;
  isActionInProgress: boolean; // Only for specific action feedback
}> = React.memo(({ category, onEdit, onDelete, onToggleStatus, onViewCourses, onRestore, isActionInProgress }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit = useCallback(() => onEdit(category), [onEdit, category]);
  const handleDelete = useCallback(() => onDelete(category.id), [onDelete, category.id]);
  const handleToggleStatus = useCallback(() => onToggleStatus(category.id), [onToggleStatus, category.id]);
  const handleViewCourses = useCallback(() => onViewCourses(category.id), [onViewCourses, category.id]);
  const handleRestore = useCallback(() => onRestore(category.id), [onRestore, category.id]);

  // Soft deleted category rendering
  if (category.isDeleted) {
    return (
      <div 
        ref={cardRef}
        className="bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-400/80 h-full flex flex-col p-4 text-center items-center justify-center"
      >
        <AlertCircle className="w-10 h-10 text-gray-500 mb-2" />
        <h3 className="font-semibold text-gray-700 text-lg mb-1 line-clamp-2">{category.title}</h3>
        <p className="text-gray-500 text-sm mb-2">This category is in the trash.</p>
        {category.restoreAt && (
          <p className="text-xs text-gray-400 mb-4">
            Expires: {new Date(category.restoreAt).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={handleRestore}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm disabled:bg-blue-300"
          disabled={isActionInProgress}
        >
          {isActionInProgress ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={16} />}
          Restore
        </button>
      </div>
    );
  }

  const isActive = category.status === 'active';

  return (
    <div
      ref={cardRef}
      className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col"
    >
      <div className="relative h-28 overflow-hidden bg-[#34137C] flex items-center justify-center">
        <div className="text-[#D68BF9]">
          {renderIcon(category.icon, 40)}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            isActive 
              ? 'bg-emerald-500 text-white shadow-sm' 
              : 'bg-orange-500 text-white shadow-sm'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-lg mb-2 line-clamp-2">
          {category.title}
        </h3>
        
        <div className="text-gray-600 text-sm line-clamp-3 mb-2 min-h-[40px]">
          {category.description || "No description available"}
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center text-xs text-gray-700">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />
            {category.totalCourses} {category.totalCourses === 1 ? 'Course' : 'Courses'}
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between items-center">
              <span>Created by:</span>
              <span className="font-medium">{category.createdBy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Created:</span>
              <span className="font-medium">{category.createdAtFormatted}</span>
            </div>
            {category.updatedAt && category.updatedAtFormatted !== 'Never' && (
              <div className="flex justify-between items-center">
                <span>Updated:</span>
                <span className="font-medium">{category.updatedAtFormatted}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleViewCourses}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm"
            >
              View Courses
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="border-[#BF4BF6] text-[#BF4BF6] hover:bg-[#BF4BF6] hover:text-white border p-1.5 rounded-full text-xs flex items-center transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white border p-1.5 rounded-full text-xs flex items-center transition-colors"
                title={category.totalCourses > 0 ? "Cannot delete category with courses" : "Delete category"}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
            <span>Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={handleToggleStatus}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BF4BF6] shadow-inner">
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

// CategoryFormModal Component (unchanged - keeping your interface)
const CategoryFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  category: { title: string; description: string; icon: string; };
  setCategory: React.Dispatch<React.SetStateAction<{ title: string; description: string; icon: string; }>>;
  isEditing: boolean;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, category, setCategory, isEditing, isSubmitting }) => {
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowIconDropdown(false);
    }
  }, [isOpen]);

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

  const toggleIconDropdown = useCallback(() => {
    setShowIconDropdown(prev => !prev);
  }, []);

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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6]" 
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] min-h-[100px] resize-none" 
                required 
                disabled={isSubmitting} 
              />
            </div>
            <IconSelector 
              selectedIcon={category.icon} 
              onChange={handleIconChange}
              showDropdown={showIconDropdown}
              toggleDropdown={toggleIconDropdown}
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
};

// ConfirmationDialog Component (unchanged)
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
  isLoading: boolean;
}> = ({ isOpen, onConfirm, onCancel, title, message, confirmButtonText = "Confirm", isDestructive = false, isLoading }) => {
  if (!isOpen) return null;

  const buttonClass = isDestructive 
    ? "bg-red-500 hover:bg-red-600 text-white" 
    : "bg-blue-500 hover:bg-blue-600 text-white";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
        <h3 className="text-xl font-semibold text-[#1B0A3F] mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors" 
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`${buttonClass} px-4 py-2 rounded-full transition-colors flex items-center gap-2`} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Processing...
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ENTERPRISE MAIN COMPONENT - Optimized for instant loading
const ManageCourseCategory: React.FC = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<string>>(new Set());

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    title: string;
    message: string;
    isDestructive: boolean;
  }>({ title: '', message: '', isDestructive: false });
  
  const [newCategory, setNewCategory] = useState({ title: '', description: '', icon: 'Code2' });

  // ENTERPRISE: Instant data loading - no blocking loading state
  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllCategories(true);
      setCategories(data);
      setInitialLoadComplete(true);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load categories.';
      setError(errorMessage);
      toast.error(errorMessage);
      setInitialLoadComplete(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = debouncedSearchTerm === '' ||
        category.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      if (filterStatus === 'deleted') {
        return matchesSearch && category.isDeleted;
      }
      if (filterStatus === 'all') {
        return matchesSearch && !category.isDeleted;
      }
      return matchesSearch && category.status === filterStatus && !category.isDeleted;
    });
  }, [categories, debouncedSearchTerm, filterStatus]);

  const handleToggleStatus = useCallback(async (categoryId: string) => {
    setLoadingCategoryIds(prev => new Set(prev).add(categoryId));
    try {
      const updatedCategory = await toggleCategoryStatus(categoryId);
      setCategories(prev => prev.map(cat => cat.id === categoryId ? updatedCategory : cat));
      
      const action = updatedCategory.status === 'active' ? 'activated' : 'deactivated';
      toast.success(`Category ${action} successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoadingCategoryIds(prev => { const newSet = new Set(prev); newSet.delete(categoryId); return newSet; });
    }
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    setCategoryToDelete(id);
    
    if (category.totalCourses > 0) {
      setDeleteConfirmation({
        title: "Cannot Delete Category",
        message: `Cannot delete "${category.title}" because it contains ${category.totalCourses} course(s). Please move or remove all courses first, or set the category to inactive instead.`,
        isDestructive: false
      });
    } else {
      setDeleteConfirmation({
        title: "Move to Trash",
        message: `Are you sure you want to move "${category.title}" to trash? You can restore it later within 30 days.`,
        isDestructive: true
      });
    }
    
    setShowDeleteModal(true);
  }, [categories]);

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;
    
    const category = categories.find(c => c.id === categoryToDelete);
    if (!category || category.totalCourses > 0) {
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete);
      setCategories(prev => prev.map(cat => 
        cat.id === categoryToDelete ? { ...cat, isDeleted: true, deletedAt: new Date().toISOString() } : cat
      ));
      toast.success('Category moved to trash successfully.');
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, categories]);

  const handleRestoreCategory = useCallback(async (id: string) => {
    setLoadingCategoryIds(prev => new Set(prev).add(id));
    try {
      const restoredCategory = await restoreCategory(id);
      setCategories(prev => prev.map(cat => (cat.id === id ? restoredCategory : cat)));
      toast.success('Category restored successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore category.');
    } finally {
      setLoadingCategoryIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    }
  }, []);

  const handleAddCategory = useCallback(async () => {
    if (!newCategory.title || !newCategory.description) {
      toast.error('Title and description are required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updateData: UpdateCategoryDto = { ...newCategory, status: editingCategory.status };
        const updatedCategory = await updateCategory(editingCategory.id, updateData);
        setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
        toast.success('Category updated successfully!');
      } else {
        const createData: CreateCategoryDto = newCategory;
        const newCat = await createCategory(createData);
        setCategories(prev => [newCat, ...prev]);
        toast.success('Category created successfully!');
      }
      setShowAddModal(false);
      setNewCategory({ title: '', description: '', icon: 'Code2' });
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }, [newCategory, editingCategory]);

  const handleViewCourses = useCallback((categoryId: string) => {
    navigate(`/admin/categories/${categoryId}`);
  }, [navigate]);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setNewCategory({ title: category.title, description: category.description, icon: category.icon });
    setShowAddModal(true);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setEditingCategory(null);
    setNewCategory({ title: '', description: '', icon: 'Code2' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 mr-2 text-[#D68BF9] hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white font-['Unbounded']">Course Category Management</h1>
          </div>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ title: '', description: '', icon: 'Code2' });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={20} />
            Add New Category
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
            <ServerCrash className="h-5 w-5"/>
            <span>{error}</span>
            <button className="ml-auto text-red-300 hover:text-white" onClick={() => setError(null)}>
              <X size={20} />
            </button>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['all', 'active', 'inactive', 'deleted'].map(status => (
              <button 
                key={status} 
                onClick={() => setFilterStatus(status)} 
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${
                  filterStatus === status 
                    ? 'bg-[#BF4BF6] text-white' 
                    : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* ENTERPRISE: Instant content display */}
        <div className="min-h-[400px]">
          {!initialLoadComplete ? (
            // Show skeleton placeholders during initial load
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <CategorySkeleton key={index} />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center border border-[#BF4BF6]/20 shadow-lg">
              <BookOpen size={48} className="text-[#BF4BF6] mx-auto mb-4" />
              <p className="text-[#52007C] text-lg mb-2">No categories match your criteria.</p>
              <button onClick={resetFilters} className="mt-2 text-sm text-[#BF4BF6] hover:underline">
                Reset Filters
              </button>
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
                  onRestore={handleRestoreCategory} 
                  isActionInProgress={loadingCategoryIds.has(category.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CategoryFormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
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
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
        confirmButtonText={deleteConfirmation.isDestructive ? "Move to Trash" : "OK"}
        isDestructive={deleteConfirmation.isDestructive}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageCourseCategory;