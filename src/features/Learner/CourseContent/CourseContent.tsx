import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

import { getCoursesForCategory, clearCourseCaches } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment, deleteEnrollment } from '../../../api/services/Course/enrollmentService';
import { getCategories as getCourseCategoriesApi } from '../../../api/services/courseCategoryService';
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService';
import { OverallLmsStatsDto as OverallLmsStatsBackendDto } from '../../../types/course.types';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CourseContent: React.FC = () => {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [activeTab, setActiveTab] = useState<'courses' | 'learning'>('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<LearnerCourseDto[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [selectedCourseForUnenroll, setSelectedCourseForUnenroll] = useState<LearnerCourseDto | null>(null);
  const [categoryName, setCategoryName] = useState<string>('Loading Category...');
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

  const getCategoryName = useCallback(async (categoryId: string): Promise<string> => {
    const cachedCategories = sessionStorage.getItem('course_categories_simple');
    if (cachedCategories) {
      try {
        const categories = JSON.parse(cachedCategories);
        const category = categories.find((cat: any) => cat.id === categoryId);
        if (category) return category.title;
      } catch (error) {
        console.error('Error parsing cached categories:', error);
      }
    }
    try {
      const allCategories = await getCourseCategoriesApi();
      sessionStorage.setItem('course_categories_simple', JSON.stringify(allCategories));
      const matchedCategory = allCategories.find(cat => cat.id === categoryId);
      return matchedCategory ? matchedCategory.title : 'Unknown Category';
    } catch (error) {
      console.error('Error fetching categories:', error);
      return 'Unknown Category';
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

    try {
      console.log('Fetching course data optimized...');
      getCategoryName(categoryIdParam).then(name => {
        if (isMountedRef.current) setCategoryName(name);
      });

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
          setError("Course category not found.");
          toast.error("Course category not found.");
          navigate('/learner/course-categories', { replace: true });
          return;
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
        setError("Access denied to course data. Please contact your administrator.");
        toast.error("Access denied to course data.");
      } else {
        setError(err.response?.data?.message || "Failed to load courses. Please try again.");
        toast.error(err.response?.data?.message || "Failed to load courses.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, categoryIdParam, navigate, getCategoryName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =================================================================
  // OPTIMIZATION: Implement Optimistic UI Update for enrollment
  // =================================================================
  const handleEnroll = useCallback(async (courseId: number) => {
    if (!user?.id) {
      toast.error("You must be logged in to enroll in courses.");
      return;
    }

    const courseToEnroll = availableCourses.find(c => c.id === courseId);
    if (!courseToEnroll) return;

    // 1. Optimistically update the UI *before* the API call
    setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
    setEnrolledCourses(prev => [...prev, { ...courseToEnroll, isEnrolled: true }]);
    setActiveTab('learning');
    
    const enrollToast = toast.loading(`Enrolling in "${courseToEnroll.title}"...`);

    try {
      // 2. Make the API call
      const newEnrollment = await createEnrollment(courseId);
      
      // 3. On success, update the enrolled course with the real enrollmentId and clear caches silently
      setEnrolledCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrollmentId: newEnrollment.id } : c));
      toast.success(`Successfully enrolled!`, { id: enrollToast });
      clearCourseCaches(); // Clear cache for the next full page load

    } catch (err: any) {
      // 4. On failure, revert the UI back to its original state and show an error
      toast.error(`Failed to enroll: ${err.response?.data?.message || 'Please try again.'}`, { id: enrollToast });
      setAvailableCourses(prev => [...prev, courseToEnroll]);
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      setActiveTab('courses');
    }
  }, [user?.id, availableCourses]); // Dependency on availableCourses is important

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
        
        // Instead of a full refetch, just update the state
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
    fetchData();
  }, [fetchData]);

  // The rest of the return statement remains the same...
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-unbounded mb-2 sm:mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
              {categoryName}
            </h2>
            <p className="text-[#D68BF9] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
              Explore our curated courses and start your learning journey
            </p>
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