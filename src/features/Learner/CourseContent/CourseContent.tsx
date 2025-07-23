import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Pause, Info } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

import { getCoursesForCategory, clearCourseCaches } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment, deleteEnrollment } from '../../../api/services/Course/enrollmentService';
import { getCategoryById, clearCategoriesCache } from '../../../api/services/courseCategoryService';
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService';
import { OverallLmsStatsDto as OverallLmsStatsBackendDto } from '../../../types/course.types';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CategoryInfo {
  name: string;
  status: 'active' | 'inactive';
  isAccessible: boolean;
}

const CourseContent: React.FC = () => {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [activeTab, setActiveTab] = useState<'courses' | 'learning'>('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<LearnerCourseDto[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [selectedCourseForUnenroll, setSelectedCourseForUnenroll] = useState<LearnerCourseDto | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>({
    name: 'Loading Category...',
    status: 'active',
    isAccessible: true
  });
  const [overallLmsStats, setOverallLmsStats] = useState<OverallLmsStatsBackendDto | null>(null);
  const [totalCategoryDuration, setTotalCategoryDuration] = useState<string>('0 hours');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getCategoryInfo = useCallback(async (categoryId: string): Promise<CategoryInfo> => {
    try {
      const category = await getCategoryById(categoryId);
      return {
        name: category.title,
        status: category.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
        isAccessible: true
      };
    } catch (error: any) {
      console.error('Error fetching category:', error);
      
      // Handle timeout errors gracefully
      if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
        // Don't set category error for timeouts - let user retry
        return {
          name: 'Loading Category...',
          status: 'inactive',
          isAccessible: true // Allow access, will retry
        };
      }
      
      if (error.message.includes('not found') || error.message.includes('removed')) {
        setCategoryError('This category is no longer available or has been removed.');
        return {
          name: 'Category Not Available',
          status: 'inactive',
          isAccessible: false
        };
      }
      
      if (error.response?.status === 403) {
        setCategoryError('Access denied to this category.');
        return {
          name: 'Access Denied',
          status: 'inactive',
          isAccessible: false
        };
      }
      
      // For other errors, allow retry
      return {
        name: 'Unknown Category',
        status: 'inactive',
        isAccessible: true
      };
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id || !categoryIdParam || !isMountedRef.current) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setCategoryError(null);

    try {
      console.log('Fetching course data optimized...');
      
      // First check if the category is accessible
      const categoryInfo = await getCategoryInfo(categoryIdParam);
      if (isMountedRef.current) {
        setCategoryInfo(categoryInfo);
      }

      // If there's a category error, don't proceed with course fetching
      if (categoryError || !categoryInfo.isAccessible) {
        setLoading(false);
        return;
      }

      const [coursesResult, statsResult] = await Promise.allSettled([
        getCoursesForCategory(categoryIdParam),
        getOverallLmsStatsForLearner()
      ]);

      if (!isMountedRef.current) return;

      if (coursesResult.status === 'fulfilled') {
        const { available, categoryEnrolled } = coursesResult.value;
        setAvailableCourses(available);
        setEnrolledCourses(categoryEnrolled);
        const allCategoryCoursesHours = [...available, ...categoryEnrolled].reduce((total, course) => total + course.estimatedTime, 0);
        setTotalCategoryDuration(`${allCategoryCoursesHours} h`);
      } else {
        console.error('Failed to fetch courses:', coursesResult.reason);
        const reason = coursesResult.reason;
        if (reason?.response?.status === 404) {
          setCategoryError("This category is no longer available.");
          toast.error("Category not found or has been removed.");
        } else if (reason?.response?.status === 403) {
          setCategoryError("Access denied to this category.");
          toast.error("You don't have permission to access this category.");
        } else {
          setError("Failed to load courses. Please try again.");
          toast.error("Failed to load courses.");
        }
      }

      if (statsResult.status === 'fulfilled') {
        setOverallLmsStats(statsResult.value);
      } else {
        console.warn('Failed to fetch stats, continuing without them');
        setOverallLmsStats(null);
      }

    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.error("Failed to fetch data:", err);
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      if (err.response?.status === 403) {
        setCategoryError("Access denied to this category. It may have been deactivated.");
        toast.error("Category access denied.");
      } else if (err.response?.status === 404) {
        setCategoryError("This category is no longer available.");
        toast.error("Category not found.");
      } else {
        setError(err.response?.data?.message || "Failed to load courses. Please try again.");
        toast.error(err.response?.data?.message || "Failed to load courses.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, categoryIdParam, getCategoryInfo, categoryError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistic UI Update for enrollment (enhanced for inactive categories)
  const handleEnroll = useCallback(async (courseId: number) => {
    if (!user?.id) {
      toast.error("You must be logged in to enroll in courses.");
      return;
    }

    // Block new enrollments in inactive categories
    if (categoryInfo.status === 'inactive') {
      toast.error("New enrollments are not allowed in paused categories.");
      return;
    }

    const courseToEnroll = availableCourses.find(c => c.id === courseId);
    if (!courseToEnroll) return;

    // Optimistically update the UI *before* the API call
    setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
    setEnrolledCourses(prev => [...prev, { ...courseToEnroll, isEnrolled: true }]);
    setActiveTab('learning');
    
    const enrollToast = toast.loading(`Enrolling in "${courseToEnroll.title}"...`);

    try {
      const newEnrollment = await createEnrollment(courseId);
      setEnrolledCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrollmentId: newEnrollment.id } : c));
      toast.success(`Successfully enrolled!`, { id: enrollToast });
      clearCourseCaches();

    } catch (err: any) {
      toast.error(`Failed to enroll: ${err.response?.data?.message || 'Please try again.'}`, { id: enrollToast });
      setAvailableCourses(prev => [...prev, courseToEnroll]);
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      setActiveTab('courses');
    }
  }, [user?.id, availableCourses, categoryInfo.status]);

  const handleUnenrollConfirmation = useCallback((course: LearnerCourseDto) => {
    setSelectedCourseForUnenroll(course);
    setIsUnenrollModalOpen(true);
  }, []);

  const handleUnenroll = useCallback(async () => {
    if (!selectedCourseForUnenroll || !user?.id) return;

    const unenrollToast = toast.loading("Unenrolling...");
    try {
      if (selectedCourseForUnenroll.isEnrolled && selectedCourseForUnenroll.enrollmentId) {
        await deleteEnrollment(selectedCourseForUnenroll.enrollmentId);
        toast.success(`Unenrolled from "${selectedCourseForUnenroll.title}" successfully!`, { id: unenrollToast });
        
        setEnrolledCourses(prev => prev.filter(c => c.id !== selectedCourseForUnenroll.id));
        setAvailableCourses(prev => [...prev, { ...selectedCourseForUnenroll, isEnrolled: false, enrollmentId: null }]);
        clearCourseCaches();

      } else {
        throw new Error("Enrollment ID not found for unenrollment.");
      }
    } catch (err: any) {
      console.error("Failed to unenroll:", err);
      toast.error(err.response?.data?.message || "Failed to unenroll.", { id: unenrollToast });
    } finally {
        setIsUnenrollModalOpen(false);
        setSelectedCourseForUnenroll(null);
    }
  }, [selectedCourseForUnenroll, user?.id]);

  const handleContinueLearning = useCallback((courseId: number) => {
    navigate(`/learner/course-view/${courseId}`);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/learner/course-categories');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    clearCourseCaches();
    clearCategoriesCache();
    // Clear individual category cache
    sessionStorage.removeItem(`category_${categoryIdParam}`);
    fetchData();
  }, [fetchData, categoryIdParam]);

  // Show category error state
  if (categoryError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-3 sm:p-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-8 space-y-4 sm:space-y-8">
            <button 
              onClick={handleBack}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors mb-3 sm:mb-6 font-nunito"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back to Course Categories</span>
            </button>

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 mb-6">
                <AlertTriangle className="w-16 h-16 text-yellow-400" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Category Not Available
              </h2>
              
              <p className="text-[#D68BF9] text-lg mb-8 max-w-md">
                {categoryError}
              </p>
              
              <div className="space-x-4">
                <button 
                  onClick={handleBack}
                  className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
                >
                  Browse Other Categories
                </button>
                
                <button 
                  onClick={handleRetry}
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check Again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-3 sm:p-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 space-y-4 sm:space-y-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-[#D68BF9] hover:text-white transition-colors mb-3 sm:mb-6 font-nunito"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Back to Course Categories</span>
          </button>
          
          <div className="text-center mb-6 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2 sm:mb-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
                {categoryInfo.name}
              </h2>
              {categoryInfo.status === 'inactive' && (
                <div className="flex items-center gap-2 bg-slate-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-400/30">
                  <Pause className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-300 text-sm font-medium">PAUSED</span>
                </div>
              )}
            </div>
            
            {categoryInfo.status === 'inactive' ? (
              <div className="bg-slate-600/20 backdrop-blur-sm border border-slate-400/30 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-slate-300 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-slate-200 font-medium mb-1">Category Temporarily Paused</p>
                    <p className="text-slate-300 text-sm">
                      You can continue learning enrolled courses, but no new enrollments are allowed at this time.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#D68BF9] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
                Explore our curated courses and start your learning journey
              </p>
            )}
          </div>

          <StatsOverview 
            availableCoursesCount={availableCourses.length}
            enrolledCoursesCount={enrolledCourses.length}
            totalCategoryDuration={totalCategoryDuration}
          />

          <CourseTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />

          {error && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-red-500 text-red-500 font-nunito text-sm sm:text-base">
              {error}
              <button 
                onClick={handleRetry}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40 sm:h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4 text-lg">Loading courses...</p>
              </div>
            </div>
          ) : (
            <CourseGrid
              activeTab={activeTab}
              availableCourses={availableCourses}
              enrolledCourses={enrolledCourses}
              loading={loading}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenrollConfirmation}
              onContinueLearning={handleContinueLearning}
              categoryStatus={categoryInfo.status} // Pass category status to CourseGrid
            />
          )}
        </div>

        <ConfirmationModal
          isOpen={isUnenrollModalOpen}
          onClose={() => {
            setIsUnenrollModalOpen(false);
            setSelectedCourseForUnenroll(null);
          }}
          onConfirm={handleUnenroll}
          title="Confirm Unenrollment"
          courseName={selectedCourseForUnenroll?.title || ''}
        />
      </div>
    </Layout>
  );
};

export default CourseContent;