// src/features/Learner/CourseContent/CourseContent.tsx
// ENTERPRISE OPTIMIZED: Ultra-fast loading, professional UX like Google/Microsoft
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, BookOpen, Users, Clock, RefreshCw, X, AlertCircle } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

import { getCoursesForCategory, clearCourseCaches, preloadCoursesForCategory, refreshCourseData } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment, deleteEnrollment, clearEnrollmentCaches } from '../../../api/services/Course/enrollmentService';
import { getCategoryById, invalidateCategoryCache } from '../../../api/services/courseCategoryService';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

// ENTERPRISE: Enhanced skeleton components for instant loading experience
const StatsCardSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 animate-pulse">
    <div className="flex items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mr-5 shimmer"></div>
      <div className="flex-1">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 mb-2 shimmer"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 shimmer"></div>
      </div>
    </div>
  </div>
));

const CourseCardSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 h-full flex flex-col animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 shimmer"></div>
    <div className="p-6 flex-1 flex flex-col space-y-3">
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 shimmer"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 shimmer"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 shimmer"></div>
      </div>
      <div className="mt-auto space-y-3">
        <div className="flex gap-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20 shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24 shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 shimmer"></div>
        </div>
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer"></div>
      </div>
    </div>
  </div>
));

const CoursesGridSkeleton: React.FC = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array(6).fill(0).map((_, index) => (
      <CourseCardSkeleton key={`skeleton-${index}`} />
    ))}
  </div>
));

// ENTERPRISE: Enhanced loading states for immediate feedback
const LoadingStates = {
  INITIAL: 'initial',
  LOADING: 'loading', 
  SUCCESS: 'success',
  ERROR: 'error',
  RETRYING: 'retrying'
} as const;

type LoadingState = typeof LoadingStates[keyof typeof LoadingStates];

// ENTERPRISE: Advanced error recovery with exponential backoff
class ErrorRecovery {
  private retryCount = 0;
  private maxRetries = 3;
  private baseDelay = 1000;

  async executeWithRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error: any) {
        if (attempt === this.maxRetries) {
          console.error(`❌ ${context} failed after ${this.maxRetries + 1} attempts:`, error);
          throw error;
        }
        
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.warn(`⚠️ ${context} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error(`${context} exhausted all retry attempts`);
  }

  reset(): void {
    this.retryCount = 0;
  }
}

// ENTERPRISE: Main component with ultra-fast loading and optimistic patterns
const CourseContent: React.FC = () => {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMountedRef = useRef(true);
  const errorRecovery = useRef(new ErrorRecovery());
  const abortController = useRef<AbortController | null>(null);

  // ENTERPRISE: Enhanced state management with granular loading states
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingStates.INITIAL);
  const [activeTab, setActiveTab] = useState<'courses' | 'learning'>('courses');
  
  const [availableCourses, setAvailableCourses] = useState<LearnerCourseDto[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isCategoryInactive, setIsCategoryInactive] = useState(false);
  
  // ENTERPRISE: Enhanced error and modal state
  const [error, setError] = useState<string | null>(null);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [selectedCourseForUnenroll, setSelectedCourseForUnenroll] = useState<LearnerCourseDto | null>(null);
  
  // ENTERPRISE: Optimistic updates tracking
  const [processingEnrollments, setProcessingEnrollments] = useState<Set<number>>(new Set());
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<number, 'enrolling' | 'unenrolling'>>(new Map());
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [learningFilter, setLearningFilter] = useState<'all' | 'completed' | 'ongoing'>('all');

  // ENTERPRISE: Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // ENTERPRISE: Enhanced data validation with fallbacks
  const ensureProperCourseData = useCallback((courses: LearnerCourseDto[]): LearnerCourseDto[] => {
    return courses.map(course => {
      const totalLessons = course.lessons?.length || course.totalLessons || 0;
      const completedLessons = course.lessons?.filter(lesson => lesson.isCompleted).length || course.completedLessons || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      return {
        id: course.id || 0,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        isEnrolled: Boolean(course.isEnrolled),
        progressPercentage: Number(course.progressPercentage) || progressPercentage,
        totalLessons,
        completedLessons,
        estimatedTime: Number(course.estimatedTime) || 0,
        activeLearnersCount: Number(course.activeLearnersCount) || 0,
        creator: course.creator || { name: 'ExcellyGen Team', id: '' },
        category: course.category || { id: categoryIdParam || '', title: 'Unknown' },
        technologies: Array.isArray(course.technologies) ? course.technologies : [],
        lessons: Array.isArray(course.lessons) ? course.lessons : [],
        thumbnailUrl: course.thumbnailUrl || null,
        isInactive: Boolean(course.isInactive),
        enrollmentId: course.enrollmentId || null,
        status: course.status || 'active'
      };
    });
  }, [categoryIdParam]);

  // ENTERPRISE: Smart prefetching strategy
  const prefetchRelatedData = useCallback(async (categoryId: string) => {
    try {
      // Prefetch other categories for faster navigation
      const prefetchPromises = [
        preloadCoursesForCategory(categoryId),
        // Could add more prefetch operations here
      ];
      
      await Promise.allSettled(prefetchPromises);
      console.log('⚡ Related data prefetched successfully');
    } catch (error) {
      console.warn('Failed to prefetch related data:', error);
    }
  }, []);

  // ENTERPRISE: Enhanced data fetching with smart error recovery
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user?.id || !categoryIdParam) return;

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoadingState(forceRefresh ? LoadingStates.RETRYING : LoadingStates.LOADING);
      setError(null);

      if (forceRefresh) {
        clearCourseCaches();
        clearEnrollmentCaches();
        invalidateCategoryCache(categoryIdParam);
      }

      // ENTERPRISE: Execute with retry mechanism
      const result = await errorRecovery.current.executeWithRetry(async () => {
        // Fetch category details first for immediate header display
        const categoryDetails = await getCategoryById(categoryIdParam);
        if (!isMountedRef.current) return { categoryDetails, coursesData: null };

        setCategoryName(categoryDetails.title);
        
        let coursesData;
        if (categoryDetails.status.toLowerCase() === 'inactive') {
          setIsCategoryInactive(true);
          coursesData = await getCoursesForCategory(categoryIdParam);
          if (isMountedRef.current) {
            setActiveTab('learning');
          }
        } else {
          setIsCategoryInactive(false);
          coursesData = await getCoursesForCategory(categoryIdParam);
        }

        return { categoryDetails, coursesData };
      }, `Course data fetch for category ${categoryIdParam}`);

      if (!isMountedRef.current || !result?.coursesData) return;

      const { coursesData } = result;
      
      setAvailableCourses(ensureProperCourseData(coursesData.available));
      setEnrolledCourses(ensureProperCourseData(coursesData.categoryEnrolled));
      setLoadingState(LoadingStates.SUCCESS);
      
      // ENTERPRISE: Background prefetching for better UX
      prefetchRelatedData(categoryIdParam);
      
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      console.error("Failed to fetch data:", err);
      let errorMessage = err.response?.data?.message || err.message || "Failed to load courses for this category.";
      
      // ENTERPRISE: Enhanced 404 error handling
      if (err.response?.status === 404) {
        // Check if it's a category not found vs courses not found
        if (err.config?.url?.includes('/CourseCategories/')) {
          toast.error('Category not found');
          navigate('/learner/course-categories', { replace: true });
          return;
        } else {
          // Courses endpoint not found - this is OK, just means no courses
          console.log('No courses endpoint found for category, showing empty state');
          setAvailableCourses([]);
          setEnrolledCourses([]);
          setLoadingState(LoadingStates.SUCCESS);
          return;
        }
      }
      
      setError(errorMessage);
      setLoadingState(LoadingStates.ERROR);
      toast.error(errorMessage);
    }
  }, [user?.id, categoryIdParam, navigate, ensureProperCourseData, prefetchRelatedData]);

  // ENTERPRISE: Initial load effect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ENTERPRISE: Enhanced optimistic enrollment with rollback
  const handleEnroll = useCallback(async (courseId: number) => {
    const courseToEnroll = availableCourses.find(c => c.id === courseId);
    if (!courseToEnroll || processingEnrollments.has(courseId)) return;

    // ENTERPRISE: Optimistic UI update with tracking
    setProcessingEnrollments(prev => new Set(prev).add(courseId));
    setOptimisticUpdates(prev => new Map(prev).set(courseId, 'enrolling'));
    
    const optimisticEnrolledCourse = { 
      ...courseToEnroll, 
      isEnrolled: true,
      totalLessons: courseToEnroll.totalLessons || 0,
      completedLessons: 0,
      progressPercentage: 0
    };
    
    // ENTERPRISE: Immediate UI updates
    setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
    setEnrolledCourses(prev => [...prev, optimisticEnrolledCourse]);
    
    // ENTERPRISE: Smooth tab transition
    const tabSwitchDelay = setTimeout(() => {
      if (isMountedRef.current) {
        setActiveTab('learning');
      }
    }, 300);

    const enrollToast = toast.loading(`Enrolling in "${courseToEnroll.title}"...`);
    
    try {
      const newEnrollment = await createEnrollment(courseId);
      
      // ENTERPRISE: Update with real enrollment data
      if (isMountedRef.current) {
        setEnrolledCourses(prev => 
          prev.map(c => {
            if (c.id === courseId) {
              return { 
                ...c, 
                enrollmentId: newEnrollment.id, 
                isEnrolled: true
              };
            }
            return c;
          })
        );
        
        toast.success(`Successfully enrolled in "${courseToEnroll.title}"!`, { id: enrollToast });
        
        // ENTERPRISE: Clear caches for fresh data
        clearCourseCaches();
      }
      
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      // ENTERPRISE: Smart rollback on error
      console.error('Enrollment failed:', err);
      const errorMsg = err.response?.data?.message || 'Failed to enroll. Please try again.';
      toast.error(errorMsg, { id: enrollToast });
      
      // Rollback optimistic update
      setAvailableCourses(prev => [...prev, courseToEnroll].sort((a, b) => a.title.localeCompare(b.title)));
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      setActiveTab('courses');
      
    } finally {
      clearTimeout(tabSwitchDelay);
      setProcessingEnrollments(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(courseId);
        return newMap;
      });
    }
  }, [availableCourses, processingEnrollments]);

  // ENTERPRISE: Listen for external course progress updates
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { courseId } = event.detail;
      console.log(`🔄 Received progress update for course ${courseId}`);
      
      // ENTERPRISE: Smart refresh only for affected course
      refreshCourseData(categoryIdParam, courseId).catch(err => {
        console.warn('Failed to refresh course data:', err);
      });
    };

    const handleDashboardRefresh = (event: CustomEvent) => {
      const { eventType } = event.detail;
      if (eventType === 'enrollment-change' || eventType === 'course-progress-update') {
        console.log(`🔄 Dashboard refresh needed: ${eventType}`);
        fetchData(true);
      }
    };

    window.addEventListener('courseProgressUpdated', handleProgressUpdate as EventListener);
    window.addEventListener('dashboard-refresh-needed', handleDashboardRefresh as EventListener);
    
    return () => {
      window.removeEventListener('courseProgressUpdated', handleProgressUpdate as EventListener);
      window.removeEventListener('dashboard-refresh-needed', handleDashboardRefresh as EventListener);
    };
  }, [categoryIdParam, fetchData]);

  // ENTERPRISE: Enhanced unenrollment with optimistic updates
  const handleUnenroll = useCallback(async () => {
    if (!selectedCourseForUnenroll?.enrollmentId) return;
    
    const courseId = selectedCourseForUnenroll.id;
    setOptimisticUpdates(prev => new Map(prev).set(courseId, 'unenrolling'));
    
    const unenrollToast = toast.loading("Unenrolling...");
    try {
      await deleteEnrollment(selectedCourseForUnenroll.enrollmentId);
      toast.success(`Unenrolled successfully!`, { id: unenrollToast });
      
      // ENTERPRISE: Refresh data and clear caches
      clearCourseCaches();
      clearEnrollmentCaches();
      await fetchData(true);
      
    } catch (err: any) {
      console.error('Unenrollment failed:', err);
      toast.error(err.response?.data?.message || "Failed to unenroll.", { id: unenrollToast });
    } finally {
      setIsUnenrollModalOpen(false);
      setSelectedCourseForUnenroll(null);
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(courseId);
        return newMap;
      });
    }
  }, [selectedCourseForUnenroll, fetchData]);

  // ENTERPRISE: Smart retry with exponential backoff
  const handleRetry = useCallback(async () => {
    errorRecovery.current.reset();
    await fetchData(true);
  }, [fetchData]);

  // ENTERPRISE: Memoized navigation handlers
  const handleContinueLearning = useCallback((courseId: number) => {
    navigate(`/learner/course-view/${courseId}`);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/learner/course-categories');
  }, [navigate]);

  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  // ENTERPRISE: Optimized search and filter with advanced memoization
  const getFilteredAvailableCourses = useMemo(() => {
    if (!searchQuery.trim()) return availableCourses;
    
    const query = searchQuery.toLowerCase();
    return availableCourses.filter(course => {
      const titleMatch = course.title.toLowerCase().includes(query);
      const creatorMatch = course.creator?.name?.toLowerCase().includes(query);
      const techMatch = course.technologies?.some(tech => 
        tech.name.toLowerCase().includes(query)
      );
      const descMatch = course.description?.toLowerCase().includes(query);
      
      return titleMatch || creatorMatch || techMatch || descMatch;
    });
  }, [availableCourses, searchQuery]);

  const getFilteredEnrolledCourses = useMemo(() => {
    let filtered = enrolledCourses;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => {
        const titleMatch = course.title.toLowerCase().includes(query);
        const creatorMatch = course.creator?.name?.toLowerCase().includes(query);
        const techMatch = course.technologies?.some(tech => 
          tech.name.toLowerCase().includes(query)
        );
        const descMatch = course.description?.toLowerCase().includes(query);
        
        return titleMatch || creatorMatch || techMatch || descMatch;
      });
    }

    // Apply learning filter
    if (learningFilter === 'completed') {
      filtered = filtered.filter(course => (course.progressPercentage || 0) === 100);
    } else if (learningFilter === 'ongoing') {
      filtered = filtered.filter(course => (course.progressPercentage || 0) !== 100);
    }

    return filtered;
  }, [enrolledCourses, searchQuery, learningFilter]);

  // ENTERPRISE: Memoized handlers for better performance
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTabChange = useCallback((tab: 'courses' | 'learning') => {
    setActiveTab(tab);
  }, []);

  const handleFilterChange = useCallback((filter: 'all' | 'completed' | 'ongoing') => {
    setLearningFilter(filter);
  }, []);

  const handleUnenrollClick = useCallback((course: LearnerCourseDto) => {
    setSelectedCourseForUnenroll(course);
    setIsUnenrollModalOpen(true);
  }, []);

  // ENTERPRISE: Enhanced grid component with processing states
  const CourseGridWithProcessing = useMemo(() => (
    <CourseGrid
      activeTab={activeTab}
      availableCourses={getFilteredAvailableCourses}
      enrolledCourses={getFilteredEnrolledCourses}
      onEnroll={handleEnroll}
      onUnenroll={handleUnenrollClick}
      onContinueLearning={handleContinueLearning}
      processingEnrollments={processingEnrollments}
    />
  ), [
    activeTab,
    getFilteredAvailableCourses,
    getFilteredEnrolledCourses,
    handleEnroll,
    handleUnenrollClick,
    handleContinueLearning,
    processingEnrollments
  ]);

  const isInitialLoading = loadingState === LoadingStates.INITIAL || loadingState === LoadingStates.LOADING;
  const isRetrying = loadingState === LoadingStates.RETRYING;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          
          {/* ENTERPRISE: Back button with consistent styling */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack} 
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors font-nunito"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> 
              Back to Course Categories
            </button>
          </div>
          
          {/* ENTERPRISE: Header with instant display */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-unbounded mb-4 text-white">
              {categoryName || 'Loading Category...'}
            </h1>
            <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
              Explore our curated courses and start your learning journey
            </p>
          </div>

          {/* ENTERPRISE: Professional error display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0"/>
              <div className="flex-1">
                <p className="font-medium">Failed to load courses</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </>
                )}
              </button>
              <button 
                onClick={handleClearError}
                className="text-red-300 hover:text-white ml-2"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* ENTERPRISE: Inactive category warning */}
          {isCategoryInactive && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-4 rounded-xl flex items-center gap-4 shadow-lg backdrop-blur-md">
              <Info className="h-6 w-6 flex-shrink-0"/>
              <span className="font-medium font-nunito">
                This course category is currently inactive. New enrollments are not available, but you can still access any courses you are already enrolled in.
              </span>
            </div>
          )}

          {/* ENTERPRISE: Stats with instant skeleton loading */}
          {isInitialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <StatsOverview 
              availableCoursesCount={availableCourses.length}
              enrolledCoursesCount={enrolledCourses.length}
              totalCategoryDuration={`${[...availableCourses, ...enrolledCourses].reduce((sum, course) => sum + (course.estimatedTime || 0), 0)} h`}
            />
          )}

          {/* Search Bar - Always visible */}
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
          />
          
          {/* ENTERPRISE: Tabs with professional styling */}
          {!isCategoryInactive && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
              <CourseTabs 
                activeTab={activeTab} 
                setActiveTab={handleTabChange}
                learningFilter={learningFilter}
                setLearningFilter={handleFilterChange}
              />
            </div>
          )}
          
          {/* ENTERPRISE: Main content area with instant skeleton loading */}
          <div className="min-h-[400px]">
            {isInitialLoading ? (
              <CoursesGridSkeleton />
            ) : (
              CourseGridWithProcessing
            )}
          </div>
        </div>
        
        {/* ENTERPRISE: Professional modal */}
        <ConfirmationModal 
          isOpen={isUnenrollModalOpen} 
          onClose={() => setIsUnenrollModalOpen(false)} 
          onConfirm={handleUnenroll} 
          title="Confirm Unenrollment" 
          courseName={selectedCourseForUnenroll?.title || ''} 
        />
      </div>
    </Layout>
  );
};

export default CourseContent;