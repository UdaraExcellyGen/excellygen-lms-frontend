import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, X, Check, ArrowLeft, RefreshCw, Trash2, BookOpen, AlertCircle
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

// Debug function to test API connectivity
const testApiConnection = async () => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('Testing API connection to: http://localhost:5177/api/CourseCategories');
    const response = await fetch('http://localhost:5177/api/CourseCategories', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('API connection test:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Category Card Component - Redesigned to match CoursesDisplayPage style
const CategoryCard: React.FC<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewCourses: (id: string) => void;
  isLoading: boolean;
}> = ({ category, onEdit, onDelete, onToggleStatus, onViewCourses, isLoading }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col">
      {/* Card Header */}
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
      
      {/* Card Content */}
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
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => onViewCourses(category.id)}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm"
              disabled={isLoading}
            >
              View Courses
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(category)}
                className="border border-[#BF4BF6] text-[#BF4BF6] hover:bg-[#BF4BF6] hover:text-white px-2 py-1.5 rounded-full text-xs flex items-center transition-colors"
                disabled={isLoading}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1.5 rounded-full text-xs flex items-center transition-colors"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Status Toggle */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Status:</span>
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
      </div>
    </div>
  );
};

// Confirmation Dialog Component - Matching CoursesDisplayPage style
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  isDeleting: boolean;
}> = ({ isOpen, onConfirm, onCancel, message, isDeleting }) => {
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
};

// Add/Edit Modal - Matching CoursesDisplayPage style
const CategoryFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  category: {
    title: string;
    description: string;
    icon: string;
  };
  setCategory: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    icon: string;
  }>>;
  isEditing: boolean;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, category, setCategory, isEditing, isSubmitting }) => {
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  
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
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}>
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
                onChange={(e) => setCategory({...category, title: e.target.value})}
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
                onChange={(e) => setCategory({...category, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                          focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] min-h-[100px] resize-none"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {/* Icon Selector */}
            <IconSelector 
              selectedIcon={category.icon}
              onChange={(iconName) => setCategory({...category, icon: iconName})}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

// Main component
const ManageCourseCategory: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // Cache for client-side filtering
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<string[]>([]);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search input
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

  // Fetch categories when component mounts
  useEffect(() => {
    // Test API connection first
    testApiConnection().then(isConnected => {
      console.log('API is reachable:', isConnected);
      if (isConnected) {
        fetchCategories();
      } else {
        setIsLoading(false);
        setError('Cannot connect to the API. Please check if the backend server is running.');
        toast.error('Cannot connect to the API. Please check if the backend server is running.');
      }
    });
  }, []);

  // Client-side filtering implementation
  const filteredCategories = useMemo(() => {
    // If we have all the data, filter client-side for better UX
    if (allCategories.length > 0) {
      return allCategories.filter(category => {
        const matchesSearch = !debouncedSearchTerm || 
          category.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          category.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
          category.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
    }
    return categories;
  }, [allCategories, debouncedSearchTerm, filterStatus]);

  // Update filtered categories when search or filter changes
  useEffect(() => {
    if (allCategories.length > 0) {
      // We already filtered client-side in the useMemo above, so just update the UI
      setCategories(filteredCategories);
    }
  }, [debouncedSearchTerm, filterStatus, allCategories.length, filteredCategories]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories();
      console.log('Fetched categories:', data);
      setCategories(data);
      setAllCategories(data); // Cache the complete dataset for client-side filtering
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Response error:', err.response.data);
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response from server:', err.request);
        setError('No response from server. Check if backend is running.');
      } else {
        console.error('Request error:', err.message);
        setError(err.message);
      }
      
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.title || !newCategory.description) {
        toast.error('Title and description are required');
        return;
      }
      
      setIsSubmitting(true);
      
      if (editingCategory) {
        // Prepare update data
        const updateData: UpdateCategoryDto = {
          title: newCategory.title,
          description: newCategory.description,
          icon: newCategory.icon,
          status: editingCategory.status
        };
        
        // Optimistic UI update
        const optimisticCategory = {
          ...editingCategory,
          ...updateData
        };
        
        // Update UI immediately
        setCategories(prevCategories => prevCategories.map(cat => 
          cat.id === editingCategory.id ? optimisticCategory : cat
        ));
        
        if (allCategories.length > 0) {
          // Also update the cached data
          setAllCategories(prevCategories => prevCategories.map(cat => 
            cat.id === editingCategory.id ? optimisticCategory : cat
          ));
        }
        
        // Close modal immediately for better UX
        setShowAddModal(false);
        
        try {
          console.log(`Updating category ${editingCategory.id}:`, updateData);
          const updatedCategory = await updateCategory(editingCategory.id, updateData);
          console.log('Category updated:', updatedCategory);
          
          // Update with server response
          setCategories(prevCategories => prevCategories.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          ));
          
          if (allCategories.length > 0) {
            // Also update the cached data
            setAllCategories(prevCategories => prevCategories.map(cat => 
              cat.id === editingCategory.id ? updatedCategory : cat
            ));
          }
          
          toast.success('Category updated successfully');
        } catch (error) {
          // Revert optimistic update on error
          setCategories(prevCategories => prevCategories.map(cat => 
            cat.id === editingCategory.id ? editingCategory : cat
          ));
          
          if (allCategories.length > 0) {
            // Also revert the cached data
            setAllCategories(prevCategories => prevCategories.map(cat => 
              cat.id === editingCategory.id ? editingCategory : cat
            ));
          }
          
          throw error;
        }
      } else {
        // Prepare create data
        const createData: CreateCategoryDto = {
          title: newCategory.title,
          description: newCategory.description,
          icon: newCategory.icon,
        };
        
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempCategory = {
          id: tempId,
          ...createData,
          status: 'active',
          totalCourses: 0
        };
        
        // Add to UI immediately (optimistic)
        setCategories(prevCategories => [...prevCategories, tempCategory]);
        
        if (allCategories.length > 0) {
          // Also update the cached data
          setAllCategories(prevCategories => [...prevCategories, tempCategory]);
        }
        
        // Close modal immediately for better UX
        setShowAddModal(false);
        
        try {
          console.log('Creating new category:', createData);
          const category = await createCategory(createData);
          console.log('Category created:', category);
          
          // Replace temp category with real one
          setCategories(prevCategories => prevCategories.map(cat => 
            cat.id === tempId ? category : cat
          ));
          
          if (allCategories.length > 0) {
            // Also update the cached data
            setAllCategories(prevCategories => prevCategories.map(cat => 
              cat.id === tempId ? category : cat
            ));
          }
          
          toast.success('Category created successfully');
        } catch (error) {
          // Remove temp category on error
          setCategories(prevCategories => prevCategories.filter(cat => cat.id !== tempId));
          
          if (allCategories.length > 0) {
            // Also update the cached data
            setAllCategories(prevCategories => prevCategories.filter(cat => cat.id !== tempId));
          }
          
          throw error;
        }
      }
      
      setNewCategory({ title: '', description: '', icon: 'Code2' });
      setEditingCategory(null);
      setError(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Response error:', err.response.data);
        toast.error(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response from server:', err.request);
        toast.error('No response from server. Check if backend is running.');
      } else {
        console.error('Request error:', err.message);
        toast.error(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        setIsDeleting(true);
        
        // Find the category to delete for potential rollback
        const categoryToDeleteRecord = categories.find(cat => cat.id === categoryToDelete);
        const categoryIndex = categories.findIndex(cat => cat.id === categoryToDelete);
        
        // Optimistic UI update - remove category from UI immediately
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryToDelete));
        
        if (allCategories.length > 0) {
          // Also update the cached data
          setAllCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryToDelete));
        }
        
        // Close modal immediately for better UX
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        
        try {
          console.log(`Deleting category with ID ${categoryToDelete}`);
          
          await deleteCategory(categoryToDelete);
          console.log('Category deleted successfully');
          
          toast.success('Category deleted successfully');
        } catch (error) {
          // Revert optimistic update on error
          if (categoryToDeleteRecord && categoryIndex !== -1) {
            // Re-insert at the original position
            setCategories(prevCategories => {
              const newCategories = [...prevCategories];
              newCategories.splice(categoryIndex, 0, categoryToDeleteRecord);
              return newCategories;
            });
            
            if (allCategories.length > 0) {
              // Also update the cached data
              setAllCategories(prevCategories => {
                const newCategories = [...prevCategories];
                newCategories.splice(categoryIndex, 0, categoryToDeleteRecord);
                return newCategories;
              });
            }
          }
          throw error;
        }
      } catch (err: any) {
        console.error('Error deleting category:', err);
        
        // Detailed error logging
        if (err.response) {
          console.error('Response error:', err.response.data);
          toast.error(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          console.error('No response from server:', err.request);
          toast.error('No response from server. Check if backend is running.');
        } else {
          console.error('Request error:', err.message);
          toast.error(err.message);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      // Add this category ID to loading state
      setLoadingCategoryIds(prev => [...prev, categoryId]);
      
      // Find the category
      const targetCategory = categories.find(cat => cat.id === categoryId);
      if (!targetCategory) return;
      
      // Optimistic UI update
      const newStatus = targetCategory.status === 'active' ? 'inactive' : 'active';
      
      setCategories(prevCategories => prevCategories.map(cat => 
        cat.id === categoryId ? {...cat, status: newStatus} : cat
      ));
      
      if (allCategories.length > 0) {
        // Also update the cached data
        setAllCategories(prevCategories => prevCategories.map(cat => 
          cat.id === categoryId ? {...cat, status: newStatus} : cat
        ));
      }
      
      try {
        console.log(`Toggling status for category with ID ${categoryId}`);
        const updatedCategory = await toggleCategoryStatus(categoryId);
        console.log('Category status toggled successfully:', updatedCategory);
        
        // Update with server response
        setCategories(prevCategories => prevCategories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ));
        
        if (allCategories.length > 0) {
          // Also update the cached data
          setAllCategories(prevCategories => prevCategories.map(cat => 
            cat.id === categoryId ? updatedCategory : cat
          ));
        }
        
        toast.success(`Category ${updatedCategory.status === 'active' ? 'activated' : 'deactivated'}`);
      } catch (error) {
        // Revert optimistic update on error
        setCategories(prevCategories => prevCategories.map(cat => 
          cat.id === categoryId ? targetCategory : cat
        ));
        
        if (allCategories.length > 0) {
          // Also update the cached data
          setAllCategories(prevCategories => prevCategories.map(cat => 
            cat.id === categoryId ? targetCategory : cat
          ));
        }
        
        throw error;
      }
    } catch (err: any) {
      console.error('Error toggling category status:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Response error:', err.response.data);
        toast.error(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response from server:', err.request);
        toast.error('No response from server. Check if backend is running.');
      } else {
        console.error('Request error:', err.message);
        toast.error(err.message);
      }
    } finally {
      // Remove this category ID from loading state
      setLoadingCategoryIds(prev => prev.filter(id => id !== categoryId));
    }
  };

  // Check if a category is currently loading
  const isCategoryLoading = (categoryId: string) => loadingCategoryIds.includes(categoryId);

  const handleViewCourses = (categoryId: string) => {
    navigate(`/admin/categories/${categoryId}`);
  };

  // Reset filter
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

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
            <span 
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setError(null)}
            >
              <X size={20} />
            </span>
          </div>
        )}

        {/* Filter & Search Controls */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-[#BF4BF6] text-white' 
                  : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              All Categories
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                filterStatus === 'active' 
                  ? 'bg-[#BF4BF6] text-white' 
                  : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
              }`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                filterStatus === 'inactive' 
                  ? 'bg-[#BF4BF6] text-white' 
                  : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
              }`}
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive
            </button>
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
          
          {/* Active filter indicators and reset */}
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div>
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
                <CategoryCard 
                  key={category.id}
                  category={category}
                  onEdit={(category) => {
                    setEditingCategory(category);
                    setNewCategory({
                      title: category.title,
                      description: category.description,
                      icon: category.icon
                    });
                    setShowAddModal(true);
                  }}
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

      {/* Category Form Modal */}
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        message={`Are you sure you want to delete this category? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageCourseCategory;