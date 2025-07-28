// src/features/Admin/CategoryCourses/CategoryCoursesPage.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, Trash2, Search, X, Check, 
  BookOpen, User, Calendar, BookMarked, EyeOff, Loader2
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

// ENTERPRISE: Skeleton components for instant loading experience
const CategoryHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm mb-6 p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const CourseRowSkeleton: React.FC = () => (
  <tr className="border-b animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-8"></div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);

const CoursesTableSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Course</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Creator</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created On</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lessons</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(5).fill(0).map((_, index) => (
            <CourseRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ENTERPRISE: Optimized course row component with memoization
const CourseRow: React.FC<{
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: number) => void;
  isActionInProgress: boolean;
}> = React.memo(({ course, onEdit, onDelete, isActionInProgress }) => {
  const handleEdit = useCallback(() => onEdit(course), [onEdit, course]);
  const handleDelete = useCallback(() => onDelete(course.id), [onDelete, course.id]);
  
  const formatDate = useCallback((dateString: string) => 
    new Date(dateString).toLocaleDateString(), []);

  return (
    <tr className={`border-b hover:bg-[#F6E6FF] transition-colors duration-200 ${
      course.isInactive ? 'bg-gray-50 opacity-75' : ''
    }`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#F6E6FF] rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-[#BF4BF6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#1B0A3F] font-medium truncate">{course.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {course.isInactive ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
            <EyeOff size={14}/> Inactive
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
            <Check size={14}/> Active
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-700">{course.creator?.name || 'N/A'}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-700">{formatDate(course.createdAt)}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-700">{course.lessons?.length || 0}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={handleEdit}
            disabled={isActionInProgress}
            className="p-2 text-gray-500 hover:text-[#BF4BF6] transition-colors rounded-lg hover:bg-[#BF4BF6]/10 disabled:opacity-50"
            title="Edit course"
          >
            {isActionInProgress ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Pencil size={18} />
            )}
          </button>
          <button 
            onClick={handleDelete}
            disabled={isActionInProgress}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
            title="Delete course"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
});

CourseRow.displayName = 'CourseRow';

// ENTERPRISE: Professional edit modal with optimistic updates
const EditCourseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  editForm: { title: string; description: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  isSubmitting: boolean;
}> = React.memo(({ isOpen, onClose, onSubmit, editForm, setEditForm, isSubmitting }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, title: e.target.value }));
  }, [setEditForm]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditForm(prev => ({ ...prev, description: e.target.value }));
  }, [setEditForm]);

  // ENTERPRISE: Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1B0A3F]">Edit Course</h2>
          {!isSubmitting && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input 
                type="text" 
                value={editForm.title} 
                onChange={handleTitleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]" 
                required
                disabled={isSubmitting}
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                value={editForm.description} 
                onChange={handleDescriptionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] min-h-[100px] resize-none" 
                required
                disabled={isSubmitting}
                placeholder="Enter course description"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !editForm.title.trim() || !editForm.description.trim()}
              className="px-6 py-2 bg-[#BF4BF6] hover:bg-[#A845E8] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Updating...
                </>
              ) : (
                'Update Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditCourseModal.displayName = 'EditCourseModal';

// ENTERPRISE: Main component with instant loading and optimistic updates
const CategoryCoursesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // ENTERPRISE: Replace blocking loading with instant display
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CourseCategory | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [loadingCourseIds, setLoadingCourseIds] = useState<Set<number>>(new Set());

  // ENTERPRISE: Optimized data fetching with smart error handling
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;
    
    try {
      setError(null);
      const [categoryData, coursesData] = await Promise.all([
        getCategoryById(categoryId),
        getCoursesByCategory(categoryId)
      ]);
      
      setCategory(categoryData);
      setCourses(coursesData);
      setInitialLoadComplete(true);
    } catch (err: any) {
      console.error('Error fetching category data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data.';
      setError(errorMessage);
      toast.error(errorMessage);
      setInitialLoadComplete(true);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  // ENTERPRISE: Optimized search with debouncing through useMemo
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    
    const term = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(term) ||
      (course.description && course.description.toLowerCase().includes(term))
    );
  }, [searchTerm, courses]);

  // ENTERPRISE: Optimistic course updates
  const handleSubmitEdit = useCallback(async () => {
    if (!editingCourse) return;
    
    setIsSubmitting(true);
    setLoadingCourseIds(prev => new Set(prev).add(editingCourse.id));
    
    // ENTERPRISE: Optimistic update
    const optimisticCourse = {
      ...editingCourse,
      title: editForm.title,
      description: editForm.description
    };
    
    setCourses(prev => prev.map(course => 
      course.id === editingCourse.id ? optimisticCourse : course
    ));
    
    try {
      const updateData: UpdateCourseAdminDto = { 
        title: editForm.title, 
        description: editForm.description 
      };
      const updatedCourse = await updateCourseAdmin(editingCourse.id, updateData);
      
      // ENTERPRISE: Update with real data
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      
      toast.success('Course updated successfully');
      setShowEditModal(false);
      setEditingCourse(null);
    } catch (err: any) {
      // ENTERPRISE: Rollback optimistic update
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? editingCourse : course
      ));
      toast.error(err.response?.data?.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
      setLoadingCourseIds(prev => { 
        const newSet = new Set(prev); 
        newSet.delete(editingCourse.id); 
        return newSet; 
      });
    }
  }, [editingCourse, editForm]);

  // ENTERPRISE: Optimistic course deletion
  const confirmDeleteCourse = useCallback(async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    
    // ENTERPRISE: Store original state for rollback
    const originalCourses = [...courses];
    
    // ENTERPRISE: Optimistic removal
    setCourses(prev => prev.filter(course => course.id !== courseToDelete));
    
    try {
      await deleteCourse(courseToDelete);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err: any) {
      // ENTERPRISE: Rollback on error
      setCourses(originalCourses);
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  }, [courseToDelete, courses]);

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    setEditForm({ title: course.title, description: course.description || '' });
    setShowEditModal(true);
  }, []);

  const handleDeleteCourse = useCallback((courseId: number) => {
    setCourseToDelete(courseId);
    setShowDeleteModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingCourse(null);
    setEditForm({ title: '', description: '' });
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate('/admin/course-categories');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#52007C] p-6">
      {/* ENTERPRISE: Instant header display with skeleton fallback */}
      {!initialLoadComplete ? (
        <CategoryHeaderSkeleton />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNavigateBack}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1B0A3F]">
                {category?.title || 'Category'} Courses
              </h1>
              <p className="text-gray-600 mt-1">{category?.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE: Professional error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <X className="h-5 w-5 text-red-500" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm} 
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
          />
        </div>
      </div>

      {/* ENTERPRISE: Instant content display */}
      {!initialLoadComplete ? (
        <CoursesTableSkeleton />
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-10 text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">
              {searchTerm ? 'No courses found matching your search.' : 'No courses found for this category.'}
            </h3>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-[#BF4BF6] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Creator</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created On</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lessons</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    isActionInProgress={loadingCourseIds.has(course.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENTERPRISE: Professional modals */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEdit}
        editForm={editForm}
        setEditForm={setEditForm}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal 
        isOpen={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          setCourseToDelete(null);
        }} 
        onConfirm={confirmDeleteCourse} 
        isDeleting={isDeleting} 
        message="Are you sure you want to delete this course? This action is permanent."
      />
    </div>
  );
};

export default CategoryCoursesPage;