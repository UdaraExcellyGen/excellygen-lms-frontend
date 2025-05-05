import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, Trash2, Search, X, Check, 
  BookOpen, User, Calendar, BookMarked
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getCategoryById,
  getCoursesByCategory,
  updateCourseAdmin,
  deleteCourse,
} from './data/api';
import { Course, CourseCategory, UpdateCourseAdminDto } from './types/course.types';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

// Debug function to test API connectivity
const testApiConnection = async (categoryId: string) => {
  try {
    const token = localStorage.getItem('access_token');
    // Make a simple fetch request to check if the API is reachable
    console.log(`Testing API connection to: http://localhost:5177/api/CourseCategories/${categoryId}`);
    const response = await fetch(`http://localhost:5177/api/CourseCategories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('API connection test:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

const CategoryCoursesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CourseCategory | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit course form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });
  
  // Inject styles to remove any pseudo-elements that might be creating the blue edge
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      body::before, body::after,
      #root::before, #root::after,
      div::before, div::after {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Fetch data when component mounts or categoryId changes
  useEffect(() => {
    if (categoryId) {
      // Test API connection first
      testApiConnection(categoryId).then(isConnected => {
        console.log('API is reachable:', isConnected);
        if (isConnected) {
          fetchCategoryData();
        } else {
          setIsLoading(false);
          setError('Cannot connect to the API. Please check if the backend server is running.');
          toast.error('Cannot connect to the API. Please check if the backend server is running.');
        }
      });
    }
  }, [categoryId]);
  
  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch category details
      console.log(`Fetching category with ID ${categoryId}`);
      const categoryData = await getCategoryById(categoryId!);
      console.log('Received category data:', categoryData);
      setCategory(categoryData);
      
      // Fetch courses for this category
      console.log(`Fetching courses for category ID ${categoryId}`);
      const coursesData = await getCoursesByCategory(categoryId!);
      console.log('Received courses data:', coursesData);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      
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
      
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter courses when searchTerm changes
  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.creator && course.creator.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);
  
  // Handle edit course submission
  const handleSubmitEdit = async () => {
    try {
      if (!editForm.title || !editForm.description) {
        toast.error('Please fill all required fields');
        return;
      }
      
      setIsSubmitting(true);
      
      if (editingCourse) {
        console.log(`Updating course with ID ${editingCourse.id}`, editForm);
        
        // Prepare update data
        const updateData: UpdateCourseAdminDto = {
          title: editForm.title,
          description: editForm.description
        };
        
        // Update via API
        const updatedCourse = await updateCourseAdmin(editingCourse.id, updateData);
        console.log('Course updated successfully:', updatedCourse);
        
        // Update local state
        setCourses(courses.map(course => 
          course.id === editingCourse.id ? updatedCourse : course
        ));
        
        // Also update filtered courses
        setFilteredCourses(prevFiltered => prevFiltered.map(course => 
          course.id === editingCourse.id ? updatedCourse : course
        ));
        
        toast.success('Course updated successfully');
        
        // Reset form and close modal
        resetForm();
      }
    } catch (err: any) {
      console.error('Error updating course:', err);
      
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
  
  // Delete course
  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteCourse = async () => {
    if (courseToDelete && category) {
      try {
        setIsDeleting(true);
        console.log(`Deleting course with ID ${courseToDelete}`);
        
        // Delete via API
        await deleteCourse(courseToDelete);
        console.log('Course deleted successfully');
        
        // Update local state
        const updatedCourses = courses.filter(course => course.id !== courseToDelete);
        setCourses(updatedCourses);
        setFilteredCourses(prev => prev.filter(course => course.id !== courseToDelete));
        
        toast.success('Course deleted successfully');
        setShowDeleteModal(false);
        setCourseToDelete(null);
        
        // Refresh category data to update the course count
        const categoryData = await getCategoryById(categoryId!);
        setCategory(categoryData);
      } catch (err: any) {
        console.error('Error deleting course:', err);
        
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
  
  // Edit course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description
    });
    setShowEditModal(true);
  };
  
  // Reset form
  const resetForm = () => {
    setEditForm({
      title: '',
      description: ''
    });
    setEditingCourse(null);
    setShowEditModal(false);
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/course-categories')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <div>
                <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
                  {category?.title || 'Category'} Courses
                </h1>
                <p className="text-gray-600 font-['Nunito_Sans'] mt-1">
                  {category?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)}
          >
            <X size={20} />
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses by title, description or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        /* Courses List */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredCourses.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-xl text-gray-600 font-['Nunito_Sans']">
                {searchTerm 
                  ? 'No courses match your search criteria.' 
                  : 'No courses found for this category.'}
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Creator</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created On</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lessons</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody style={{ position: 'relative' }}>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-200 hover:bg-[#F6E6FF] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#F6E6FF] rounded-lg flex items-center justify-center">
                            <BookOpen size={24} className="text-[#BF4BF6]" />
                          </div>
                          <div>
                            <h4 className="text-[#1B0A3F] font-medium">{course.title}</h4>
                            <p className="text-sm text-gray-500">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#F6E6FF] rounded-full flex items-center justify-center">
                            <User size={16} className="text-[#BF4BF6]" />
                          </div>
                          <p className="text-sm font-medium text-[#1B0A3F]">
                            {course.creator?.name || 'Unknown Creator'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {course.createdAtFormatted || formatDate(course.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <BookMarked size={16} className="text-gray-400" />
                          <p className="text-sm text-gray-600">{course.lessons} lessons</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-full 
                                     hover:bg-[#F6E6FF] transition-colors duration-200"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-gray-500 hover:text-red-500 rounded-full 
                                     hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-[#1B0A3F] font-['Unbounded']">
                Edit Course
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-[#BF4BF6]"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitEdit();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    placeholder="Enter course title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans']"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Enter course description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#BF4BF6] font-['Nunito_Sans'] min-h-[100px]"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Update Course</span>
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
          setCourseToDelete(null);
        }}
        onConfirm={confirmDeleteCourse}
        isDeleting={isDeleting}
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
    </div>
  );
};

export default CategoryCoursesPage;