import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, RefreshCw, Plus, Trash2, Edit, BookOpen, Clock, Award, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../contexts/CourseContext';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseDto, CategoryDto as GlobalCategoryDto, TechnologyDto as GlobalTechnologyDto } from '../../../types/course.types';
import { getAllCourses, deleteCourse as apiDeleteCourse, getCourseCategories, getTechnologies } from '../../../api/services/Course/courseService';

// Define a new component for the course card with updated styling
const CourseCard: React.FC<{
  course: CourseDto;
  onDeleteCourse: (id: number) => void;
  currentUserId: string;
  onViewCourse: (id: number) => void;
}> = ({ course, onDeleteCourse, currentUserId, onViewCourse }) => {
  const isCreator = course.creator.id === currentUserId;
  
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] h-full flex flex-col">
      {/* Card Header with Image */}
      <div className="relative h-48 overflow-hidden">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-[#34137C] flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-[#D68BF9]" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            course.status === 'Published' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {course.status}
          </span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#1B0A3F] text-lg mb-2 line-clamp-2">{course.title}</h3>
        
        <div className="text-gray-600 text-sm line-clamp-2 mb-2">
          {course.description || "No description available"}
        </div>
        
        <div className="mt-auto space-y-2">
          {/* Course Info */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-700">
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />
              {course.estimatedTime} hours
            </div>
            <div className="flex items-center">
              <Award className="w-3.5 h-3.5 mr-1 text-[#BF4BF6]" />
              {course.calculatedCoursePoints || 0} points
            </div>
          </div>
          
          {/* Category & Tech Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-[#F6E6FF] text-[#52007C] px-2 py-0.5 rounded-full text-xs font-medium">
              {course.category.title}
            </span>
            {course.technologies.slice(0, 2).map(tech => (
              <span key={tech.id} className="bg-[#F6E6FF] text-[#52007C] px-2 py-0.5 rounded-full text-xs">
                {tech.name}
              </span>
            ))}
            {course.technologies.length > 2 && (
              <span className="bg-[#F6E6FF] text-[#52007C] px-2 py-0.5 rounded-full text-xs">
                +{course.technologies.length - 2}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => onViewCourse(course.id)}
              className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors shadow-sm"
            >
              View Course
            </button>
            
            {isCreator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCourse(course.id);
                }}
                className="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full text-xs flex items-center transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}> = ({ isOpen, onConfirm, onCancel, message }) => {
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
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
const CoursesDisplayPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseData: contextCourseData, resetCourseContext, setCreatedCourseId } = useCourseContext();
    const { user } = useAuth();

    // State management
    const [allFetchedCourses, setAllFetchedCourses] = useState<CourseDto[]>([]);
    const [loadingStates, setLoadingStates] = useState({
      courses: true,
      categories: true,
      technologies: true
    });
    const [hasError, setHasError] = useState(false);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDeleteId, setCourseToDeleteId] = useState<number | null>(null);

    // Data state
    const [availableCategories, setAvailableCategories] = useState<GlobalCategoryDto[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<GlobalTechnologyDto[]>([]);

    // Computed loading state
    const isLoading = useMemo(() => 
      loadingStates.courses || loadingStates.categories || loadingStates.technologies,
      [loadingStates]
    );

    // Fetch course categories - separate function to handle retries
    const fetchCategories = async () => {
      setLoadingStates(prev => ({ ...prev, categories: true }));
      setHasError(false);
      
      try {
        const fetchedCategories = await getCourseCategories();
        setAvailableCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setHasError(true);
      } finally {
        setLoadingStates(prev => ({ ...prev, categories: false }));
      }
    };

    // Fetch technologies - separate function to handle retries
    const fetchTechnologies = async () => {
      setLoadingStates(prev => ({ ...prev, technologies: true }));
      setHasError(false);
      
      try {
        const fetchedTechnologies = await getTechnologies();
        setAvailableTechnologies(fetchedTechnologies);
      } catch (error) {
        console.error("Failed to fetch technologies:", error);
        setHasError(true);
      } finally {
        setLoadingStates(prev => ({ ...prev, technologies: false }));
      }
    };

    // Fetch courses - separate function to handle retries
    const fetchCourses = async () => {
      setLoadingStates(prev => ({ ...prev, courses: true }));
      setHasError(false);
      
      try {
        const fetchedCourses = await getAllCourses();
        setAllFetchedCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setHasError(true);
        toast.error("Could not load courses. Please try again.");
      } finally {
        setLoadingStates(prev => ({ ...prev, courses: false }));
      }
    };

    // Fetch all data - function to handle retries
    const fetchAllData = async () => {
      await Promise.all([
        fetchCourses(),
        fetchCategories(),
        fetchTechnologies()
      ]);
    };

    // Initial data loading
    useEffect(() => {
      fetchAllData();
    }, []);

    // Effect to merge/update the list with a newly created/updated course from context
    useEffect(() => {
        if (contextCourseData.createdCourseId && contextCourseData.basicDetails.title && user) {
            const newCourseId = contextCourseData.createdCourseId;
            const alreadyExistsInFetched = allFetchedCourses.some(c => c.id === newCourseId);

            // Construct the new/updated course object for display
            const basicDetails = contextCourseData.basicDetails;
            const courseForDisplay: CourseDto = {
                id: newCourseId,
                title: basicDetails.title,
                description: basicDetails.description,
                estimatedTime: parseInt(basicDetails.estimatedTime, 10) || 0,
                thumbnailUrl: basicDetails.thumbnail
                    ? URL.createObjectURL(basicDetails.thumbnail)
                    : null,
                category: availableCategories.find(c => c.id === basicDetails.categoryId) || { id: basicDetails.categoryId, title: "Loading..." },
                technologies: basicDetails.technologies.map(techId => {
                    const foundTech = availableTechnologies.find(t => t.id === techId);
                    return { id: techId, name: foundTech?.name || `Tech...` };
                }),
                creator: { id: user.id, name: user.name },
                status: 'Draft', // Newly created/edited courses via context are initially drafts
                createdAt: new Date().toISOString(),
                lastUpdatedDate: new Date().toISOString(),
                lessons: [],
                calculatedCoursePoints: 0,
            };

            if (!alreadyExistsInFetched) {
                console.log("Adding new course from context to display list, ID:", newCourseId);
                setAllFetchedCourses(prevCourses => [courseForDisplay, ...prevCourses]);
            } else {
                console.log("Updating existing course from context in display list, ID:", newCourseId);
                setAllFetchedCourses(prevCourses =>
                    prevCourses.map(c => c.id === newCourseId ? courseForDisplay : c)
                );
            }
            // Reset context ID after processing to avoid re-adding/updating on subsequent renders
            setCreatedCourseId(null);
        }
    }, [
        contextCourseData.createdCourseId,
        contextCourseData.basicDetails,
        user,
        allFetchedCourses,
        availableCategories,
        availableTechnologies,
        setCreatedCourseId
    ]);

    // Filter courses based on selected filters and search query
    const filteredCourses = useMemo(() => {
        return allFetchedCourses.filter(course => {
            const matchesCategory = searchCategory === '' || course.category.id === searchCategory;
            const matchesSearch = searchQuery === '' || course.title.toLowerCase().includes(searchQuery.toLowerCase());

            if (!user?.id) return false;

            let matchesFilter = false;
            const courseStatus = course.status;

            if (filter === 'all') {
                matchesFilter = course.creator.id === user.id;
            } else if (filter === 'draft') {
                matchesFilter = courseStatus === 'Draft' && course.creator.id === user.id;
            } else if (filter === 'published') {
                matchesFilter = courseStatus === 'Published' && course.creator.id === user.id;
            }

            return matchesFilter && matchesCategory && matchesSearch;
        });
    }, [allFetchedCourses, filter, searchCategory, searchQuery, user?.id]);

    // Handle course deletion
    const handleDeleteCourseRequest = (id: number) => {
        setCourseToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (courseToDeleteId === null) return;
        const courseTitle = allFetchedCourses.find(c => c.id === courseToDeleteId)?.title || "this course";
        const toastId = toast.loading(`Deleting ${courseTitle}...`);
        try {
            await apiDeleteCourse(courseToDeleteId);
            // Even if API call succeeds, still update UI to remove the course
            setAllFetchedCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDeleteId));
            toast.dismiss(toastId);
            toast.success(`Course "${courseTitle}" deleted successfully.`);
        } catch (error) {
            toast.dismiss(toastId);
            console.error("Failed to delete course:", error);
            
            // Optimistically update UI even if backend fails
            setAllFetchedCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDeleteId));
            
            toast.error("There was an error on the server. The course may or may not have been deleted.");
        } finally {
            setIsDeleteDialogOpen(false);
            setCourseToDeleteId(null);
        }
    };

    const cancelDeleteCourse = () => {
        setIsDeleteDialogOpen(false);
        setCourseToDeleteId(null);
    };

    // Navigation handlers
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
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/coordinator/dashboard')}
                            className="flex items-center text-[#D68BF9] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                           
                        </button>
                        <h1 className="text-2xl font-bold text-white">My Courses</h1>
                    </div>
                    
                    <button
                        onClick={handleAddNewCourse}
                        className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Plus size={18} />
                        Add New Course
                    </button>
                </div>

                {/* Filter & Search Controls */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            className={`px-4 py-2 rounded-full transition-colors ${
                                filter === 'all' 
                                    ? 'bg-[#BF4BF6] text-white' 
                                    : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
                            }`}
                            onClick={() => setFilter('all')}
                        >
                            All My Courses
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full transition-colors ${
                                filter === 'draft' 
                                    ? 'bg-[#BF4BF6] text-white' 
                                    : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
                            }`}
                            onClick={() => setFilter('draft')}
                        >
                            Draft
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full transition-colors ${
                                filter === 'published' 
                                    ? 'bg-[#BF4BF6] text-white' 
                                    : 'bg-[#F6E6FF] text-[#52007C] hover:bg-[#E6D0FF]'
                            }`}
                            onClick={() => setFilter('published')}
                        >
                            Published
                        </button>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search courses by title..."
                                className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <select
                                className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6] appearance-none"
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {availableCategories.map(category => (
                                    <option key={category.id} value={category.id}>{category.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="fill-current h-4 w-4 text-[#BF4BF6]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Grid or Loading/Error State */}

                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div>
                            <p className="text-[#52007C] text-lg">Loading courses...</p>
                        </div>
                    ) : hasError ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="text-red-500 mb-4">
                                <AlertCircle size={48} />
                            </div>
                            <p className="text-[#52007C] text-lg mb-6">Failed to load courses.</p>
                            <button 
                                onClick={fetchAllData}
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Retry
                            </button>
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <CourseCard 
                                    key={course.id}
                                    course={course}
                                    onDeleteCourse={handleDeleteCourseRequest}
                                    currentUserId={user?.id || ""}
                                    onViewCourse={handleViewCourse}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <BookOpen size={48} className="text-[#BF4BF6] mb-4" />
                            <p className="text-[#52007C] text-lg mb-2">No courses found matching your criteria.</p>
                            <p className="text-gray-600 mb-6">Try adjusting your filters or create a new course.</p>
                            <button
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full transition-colors"
                                onClick={() => {
                                    setFilter('all');
                                    setSearchCategory('');
                                    setSearchQuery('');
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onConfirm={confirmDeleteCourse}
                onCancel={cancelDeleteCourse}
                message={`Are you sure you want to delete this course? This action cannot be undone.`}
            />
        </div>
    );
};

export default CoursesDisplayPage;