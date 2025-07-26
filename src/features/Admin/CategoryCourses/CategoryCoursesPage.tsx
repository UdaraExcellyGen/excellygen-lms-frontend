// src/features/Admin/CategoryCourses/CategoryCoursesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, Trash2, Search, X, Check, 
  BookOpen, User, Calendar, BookMarked, EyeOff
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

const CategoryCoursesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CourseCategory | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;
    setIsLoading(true);
    setError(null);
    try {
      const categoryData = await getCategoryById(categoryId);
      const coursesData = await getCoursesByCategory(categoryId);
      setCategory(categoryData);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);
  
  useEffect(() => {
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);
  
  const handleSubmitEdit = async () => {
    if (!editingCourse) return;
    setIsSubmitting(true);
    try {
      const updateData: UpdateCourseAdminDto = { title: editForm.title, description: editForm.description };
      await updateCourseAdmin(editingCourse.id, updateData);
      toast.success('Course updated successfully');
      fetchCategoryData(); // Refetch for consistency
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete);
      toast.success('Course deleted successfully');
      fetchCategoryData(); // Refetch for consistency
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditForm({ title: course.title, description: course.description || '' });
    setShowEditModal(true);
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-[#52007C] p-6">
      <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/course-categories')} className="p-2 hover:bg-[#F6E6FF] rounded-full"><ArrowLeft size={24} className="text-[#BF4BF6]" /></button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B0A3F]">{category?.title || 'Category'} Courses</h1>
            <p className="text-gray-600 mt-1">{category?.description}</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm mb-6 p-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6]"/></div></div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredCourses.length === 0 ? (
            <div className="p-10 text-center"><h3 className="text-xl text-gray-600">No courses found for this category.</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b"><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Course</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Creator</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created On</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lessons</th><th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th></tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className={`border-b hover:bg-[#F6E6FF] ${course.isInactive ? 'bg-gray-50 opacity-75' : ''}`}>
                      <td className="px-6 py-4"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-[#F6E6FF] rounded-lg flex items-center justify-center"><BookOpen size={24} className="text-[#BF4BF6]" /></div><div><h4 className="text-[#1B0A3F] font-medium">{course.title}</h4><p className="text-sm text-gray-500 line-clamp-1">{course.description}</p></div></div></td>
                      <td className="px-6 py-4">
                        {course.isInactive ? (<span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800"><EyeOff size={14}/> Inactive</span>) : (<span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800"><Check size={14}/> Active</span>)}
                      </td>
                      <td className="px-6 py-4"><p className="text-sm">{course.creator?.name || 'N/A'}</p></td>
                      <td className="px-6 py-4"><p className="text-sm">{formatDate(course.createdAt)}</p></td>
                      <td className="px-6 py-4"><p className="text-sm">{course.lessons?.length || 0}</p></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end space-x-2"><button onClick={() => handleEditCourse(course)} className="p-2 text-gray-500 hover:text-[#BF4BF6]"><Pencil size={18} /></button><button onClick={() => { setCourseToDelete(course.id); setShowDeleteModal(true); }} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={18} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitEdit(); }}>
              <div className="space-y-4">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full p-2 border rounded" required/>
                <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full p-2 border rounded" required/>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDeleteCourse} isDeleting={isDeleting} message="Are you sure you want to delete this course? This action is permanent."/>
    </div>
  );
};

export default CategoryCoursesPage;