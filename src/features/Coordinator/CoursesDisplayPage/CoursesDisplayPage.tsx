import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Search, RefreshCw, Plus, Trash2, BookOpen, Clock, Award, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../contexts/CourseContext';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseDto, CategoryDto as GlobalCategoryDto, TechnologyDto as GlobalTechnologyDto, CourseStatus, UserDto } from '../../../types/course.types';
import { 
    getAllCourses, 
    deactivateCourse as apiDeactivateCourse, 
    reactivateCourse as apiReactivateCourse, 
    hardDeleteCourse as apiHardDeleteCourse, 
    getCourseCategories, 
    getTechnologies 
} from '../../../api/services/Course/courseService';

const CourseCard: React.FC<{
  course: CourseDto;
  onDeleteRequest: (course: CourseDto) => void;
  onReactivateCourse: (id: number) => void;
  currentUserId: string;
  onViewCourse: (id: number) => void;
}> = ({ course, onDeleteRequest, onReactivateCourse, currentUserId, onViewCourse }) => {
  const isCreator = course.creator.id === currentUserId;
  
  return (
    <div className={`bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col ${course.isInactive ? 'opacity-60' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#34137C] flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-[#D68BF9]" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
          {course.isInactive && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-600 text-white">
                Inactive
            </span>
          )}
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            course.status === CourseStatus.Published 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {course.status}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-lg mb-2 line-clamp-2">{course.title}</h3>
        <div className="text-gray-600 text-sm line-clamp-2 mb-2">
          {course.description || "No description available"}
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex flex-wrap gap-2 text-xs text-gray-700">
            <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />{course.estimatedTime} hours</div>
            <div className="flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />{course.calculatedCoursePoints || 0} points</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-[#F6E6FF] text-[#52007C] px-2 py-0.5 rounded-full text-xs font-medium">{course.category.title}</span>
            {course.technologies.slice(0, 2).map(tech => (<span key={tech.id} className="bg-[#F6E6FF] text-[#52007C] px-2 py-0.5 rounded-full text-xs">{tech.name}</span>))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button onClick={() => onViewCourse(course.id)} className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm disabled:opacity-50">
              View Course
            </button>
            {isCreator && (
              <>
                {course.isInactive ? (
                  <button onClick={(e) => { e.stopPropagation(); onReactivateCourse(course.id); }} className="bg-green-100 border border-green-500 text-green-700 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors">
                    <RotateCcw size={14} className="mr-1" /> Reactivate
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(course); }} className="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors">
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title: string;
  confirmText: string;
}> = ({ isOpen, onConfirm, onCancel, message, title, confirmText }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
        <h3 className="text-xl font-semibold text-[#1B0A3F] mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2">
            <Trash2 size={16} /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const CoursesDisplayPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseData: contextCourseData, resetCourseContext, setCreatedCourseId } = useCourseContext();
    const { user } = useAuth();

    const [allFetchedCourses, setAllFetchedCourses] = useState<CourseDto[]>([]);
    const [loadingStates, setLoadingStates] = useState({ courses: true, categories: true, technologies: true });
    const [hasError, setHasError] = useState(false);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'inactive'>('all');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        message: string;
        title: string;
        confirmText: string;
        onConfirm: () => void;
    } | null>(null);

    const [availableCategories, setAvailableCategories] = useState<GlobalCategoryDto[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<GlobalTechnologyDto[]>([]);

    const isLoading = useMemo(() => loadingStates.courses || loadingStates.categories || loadingStates.technologies, [loadingStates]);

    const fetchAllData = async () => {
      setLoadingStates({ courses: true, categories: true, technologies: true });
      try {
        const [courses, categories, technologies] = await Promise.all([ getAllCourses(), getCourseCategories(), getTechnologies() ]);
        setAllFetchedCourses(courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setAvailableCategories(categories);
        setAvailableTechnologies(technologies);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setHasError(true);
        toast.error("Could not load course data.");
      } finally {
        setLoadingStates({ courses: false, categories: false, technologies: false });
      }
    };

    useEffect(() => {
      fetchAllData();
    }, []);

    useEffect(() => {
        if (contextCourseData.createdCourseId && contextCourseData.basicDetails.title && user) {
            const newCourseId = contextCourseData.createdCourseId;
            const alreadyExists = allFetchedCourses.some(c => c.id === newCourseId);
            const basicDetails = contextCourseData.basicDetails;

            const displayCategory: GlobalCategoryDto = availableCategories.find(c => c.id === basicDetails.categoryId) || {
                id: basicDetails.categoryId, title: 'Loading...', name: 'Loading...', isActive: false, description: '', iconName: ''
            };

            const displayCreator: UserDto = {
                id: user.id, name: user.name, email: user.email, roles: user.roles
            };

            const courseForDisplay: CourseDto = {
                id: newCourseId, title: basicDetails.title, description: basicDetails.description,
                estimatedTime: parseInt(basicDetails.estimatedTime, 10) || 0,
                isInactive: false, thumbnailUrl: basicDetails.thumbnail ? URL.createObjectURL(basicDetails.thumbnail) : null,
                category: displayCategory, creator: displayCreator, status: CourseStatus.Draft,
                technologies: basicDetails.technologies.map(techId => ({ id: techId, name: availableTechnologies.find(t => t.id === techId)?.name || '...' })),
                createdAt: new Date().toISOString(), lastUpdatedDate: new Date().toISOString(),
                lessons: [], calculatedCoursePoints: 0, creatorId: user.id,
                categoryId: basicDetails.categoryId, 
                thumbnailImagePath: undefined
            };

            if (!alreadyExists) {
                setAllFetchedCourses(prevCourses => [courseForDisplay, ...prevCourses]);
            } else {
                setAllFetchedCourses(prevCourses => prevCourses.map(c => (c.id === newCourseId ? courseForDisplay : c)));
            }
            setCreatedCourseId(null);
        }
    }, [contextCourseData, user, allFetchedCourses, availableCategories, availableTechnologies, setCreatedCourseId]);

    const filteredCourses = useMemo(() => {
        return allFetchedCourses.filter(course => {
            const matchesCategory = !searchCategory || course.category.id === searchCategory;
            const matchesSearch = !searchQuery || course.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!user?.id || course.creator.id !== user.id) return false;

            switch (filter) {
                case 'all': return !course.isInactive && matchesCategory && matchesSearch;
                case 'draft': return course.status === CourseStatus.Draft && !course.isInactive && matchesCategory && matchesSearch;
                case 'published': return course.status === CourseStatus.Published && !course.isInactive && matchesCategory && matchesSearch;
                case 'inactive': return course.isInactive && matchesCategory && matchesSearch;
                default: return false;
            }
        });
    }, [allFetchedCourses, filter, searchCategory, searchQuery, user?.id]);

    const confirmHardDelete = async (courseId: number) => {
        const toastId = toast.loading('Permanently deleting draft...');
        try {
            await apiHardDeleteCourse(courseId);
            setAllFetchedCourses(prev => prev.filter(c => c.id !== courseId));
            toast.success('Draft course permanently deleted.', { id: toastId });
        } catch (error) {
            toast.error('Failed to delete draft.', { id: toastId });
        } finally {
            setDialogConfig(null);
        }
    };

    const confirmDeactivate = async (courseId: number) => {
        const toastId = toast.loading('Deactivating course...');
        try {
            await apiDeactivateCourse(courseId);
            setAllFetchedCourses(prev => prev.map(c => (c.id === courseId ? { ...c, isInactive: true } : c)));
            toast.success('Course deactivated successfully.', { id: toastId });
        } catch (error) {
            toast.error('Failed to deactivate course.', { id: toastId });
        } finally {
            setDialogConfig(null);
        }
    };

    const handleDeleteRequest = (course: CourseDto) => {
        if (course.status === CourseStatus.Draft) {
            setDialogConfig({
                isOpen: true,
                title: 'Confirm Permanent Deletion',
                message: `Are you sure you want to permanently delete the draft "${course.title}"? This action cannot be undone.`,
                confirmText: 'Delete Permanently',
                onConfirm: () => confirmHardDelete(course.id)
            });
        } else if (course.status === CourseStatus.Published) {
            setDialogConfig({
                isOpen: true,
                title: 'Confirm Deactivation',
                message: `Are you sure you want to deactivate the course "${course.title}"? It will be hidden from the catalog.`,
                confirmText: 'Deactivate',
                onConfirm: () => confirmDeactivate(course.id)
            });
        }
    };

    const handleReactivateCourse = async (id: number) => {
        const toastId = toast.loading("Reactivating course...");
        try {
            await apiReactivateCourse(id);
            setAllFetchedCourses(prev => prev.map(c => c.id === id ? { ...c, isInactive: false } : c));
            toast.success("Course reactivated successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to reactivate course.", { id: toastId });
        }
    };

    const cancelAction = () => {
        setDialogConfig(null);
    };

    const handleAddNewCourse = () => {
        resetCourseContext();
        navigate('/coordinator/course-details');
    };

    const handleViewCourse = (courseId: number) => {
        navigate(`/coordinator/course-view/${courseId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/coordinator/dashboard')} className="flex items-center text-[#D68BF9] hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 mr-2" /></button>
                        <h1 className="text-2xl font-bold text-white">My Courses</h1>
                    </div>
                    <button onClick={handleAddNewCourse} className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"><Plus size={18} /> Add New Course</button>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <button className={`px-4 py-2 rounded-full transition-colors ${filter === 'all' ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'}`} onClick={() => setFilter('all')}>All My Courses</button>
                        <button className={`px-4 py-2 rounded-full transition-colors ${filter === 'draft' ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'}`} onClick={() => setFilter('draft')}>Draft</button>
                        <button className={`px-4 py-2 rounded-full transition-colors ${filter === 'published' ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'}`} onClick={() => setFilter('published')}>Published</button>
                        <button className={`px-4 py-2 rounded-full transition-colors ${filter === 'inactive' ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'}`} onClick={() => setFilter('inactive')}>Inactive</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
                            <input type="text" placeholder="Search courses by title..." className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="relative">
                            <select className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6] appearance-none" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                <option value="">All Categories</option>
                                {availableCategories.map(category => (<option key={category.id} value={category.id}>{category.title}</option>))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="fill-current h-4 w-4 text-[#BF4BF6]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div><p className="text-white text-lg">Loading courses...</p></div>
                    ) : hasError ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center"><AlertCircle size={48} className="text-red-400 mb-4" /><p className="text-white text-lg mb-6">Failed to load courses.</p><button onClick={fetchAllData} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"><RefreshCw size={16} /> Retry</button></div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} onDeleteRequest={handleDeleteRequest} onReactivateCourse={handleReactivateCourse} currentUserId={user?.id || ""} onViewCourse={handleViewCourse} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center"><BookOpen size={48} className="text-[#BF4BF6] mb-4" /><p className="text-white text-lg mb-2">No courses found matching your criteria.</p><p className="text-gray-400 mb-6">Try adjusting your filters or create a new course.</p><button className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full transition-colors" onClick={() => { setFilter('all'); setSearchCategory(''); setSearchQuery(''); }}>Clear All Filters</button></div>
                    )}
                </div>
            </div>

            {dialogConfig && (
                <ConfirmationDialog isOpen={dialogConfig.isOpen} onConfirm={dialogConfig.onConfirm} onCancel={cancelAction} message={dialogConfig.message} title={dialogConfig.title} confirmText={dialogConfig.confirmText} />
            )}
        </div>
    );
};

export default CoursesDisplayPage;