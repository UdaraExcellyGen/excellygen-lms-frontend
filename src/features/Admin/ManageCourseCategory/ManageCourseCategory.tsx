import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, X, Check, ArrowLeft
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
import StatusFilter from './components/StatusFilter';
import IconSelector from './components/IconSelector';
import CategoryCard from './components/CategoryCard';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

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

const ManageCourseCategory: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
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
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState(false);

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
  const filteredCategories = React.useMemo(() => {
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
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
                Course Categories Management
              </h1>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ title: '', description: '', icon: 'Code2' });
                  setShowAddModal(true);
                }}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                         hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus size={20} />
                Add New Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-fadeIn">
          <span className="block sm:inline">{error}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)}
          >
            <X size={20} />
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
              disabled={isLoading}
            />
          </div>
          
          <StatusFilter 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            showStatusFilter={showStatusFilter}
            setShowStatusFilter={setShowStatusFilter}
          />
        </div>
        
        {/* Active filter indicators and reset */}
        {(debouncedSearchTerm || filterStatus !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {debouncedSearchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Search: "{debouncedSearchTerm}"
                <X size={14} className="ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => setFilterStatus('all')} 
                />
              </span>
            )}
            
            <button 
              onClick={resetFilters}
              className="text-sm text-[#BF4BF6] hover:underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-fadeIn">
          <p className="text-gray-600 font-['Nunito_Sans']">
            {searchTerm || filterStatus !== 'all'
              ? 'No categories match your search criteria. Try adjusting your filters.'
              : 'No categories found. Create your first category!'}
          </p>
          {(debouncedSearchTerm || filterStatus !== 'all') && (
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-[#F6E6FF] text-[#BF4BF6] rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#BF4BF6] hover:text-white transition-all duration-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={(e) => {
            // Close modal when clicking outside the content
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setEditingCategory(null);
              setNewCategory({ title: '', description: '', icon: 'Code2' });
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategory({ title: '', description: '', icon: 'Code2' });
                }}
                className="text-gray-500 hover:text-[#BF4BF6]"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Title"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({...newCategory, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                          focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                  required
                  disabled={isSubmitting}
                />
                <textarea
                  placeholder="Category Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                          focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans'] min-h-[100px]"
                  required
                  disabled={isSubmitting}
                />
                
                {/* Icon Dropdown */}
                <IconSelector 
                  selectedIcon={newCategory.icon}
                  onChange={(iconName) => setNewCategory({...newCategory, icon: iconName})}
                  showDropdown={showIconDropdown}
                  toggleDropdown={() => setShowIconDropdown(!showIconDropdown)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setNewCategory({ title: '', description: '', icon: 'Code2' });
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-[#BF4BF6] font-['Nunito_Sans']"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                          hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingCategory ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {editingCategory ? 'Update' : 'Add'} Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default ManageCourseCategory;