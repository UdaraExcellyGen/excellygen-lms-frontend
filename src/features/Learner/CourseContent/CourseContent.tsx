// src/features/Learner/CourseContent/CourseContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types'; 
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview'; 
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

import { getAvailableCoursesForLearner, getEnrolledCoursesForLearner } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment, deleteEnrollment } from '../../../api/services/Course/enrollmentService';
import { getCategories as getCourseCategoriesApi, CourseCategoryDtoBackend } from '../../../api/services/courseCategoryService'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService'; 
import { OverallLmsStatsDto as OverallLmsStatsBackendDto } from '../../../types/course.types';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CourseContent: React.FC = () => {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>(); 
  const navigate = useNavigate();
  const { user } = useAuth(); 

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

  const fetchCoursesAndCategory = useCallback(async () => {
    if (!user?.id || !categoryIdParam) {
      setError(null); 
      setLoading(true); 
      return; 
    }

    setLoading(true);
    setError(null);
    try {
      const allCategories = await getCourseCategoriesApi();
      const matchedCategory = allCategories.find(cat => cat.id === categoryIdParam);

      if (!matchedCategory) {
        setError("Invalid category specified in URL.");
        toast.error("Invalid category specified.");
        navigate('/learner/course-categories', { replace: true });
        return;
      }
      
      setCategoryName(matchedCategory.title); 

      // Fetch courses and overall LMS stats concurrently
      const [available, enrolled, overallStats] = await Promise.all([
        getAvailableCoursesForLearner(categoryIdParam), 
        getEnrolledCoursesForLearner(),
        getOverallLmsStatsForLearner()
      ]);

      setOverallLmsStats(overallStats); 

      setAvailableCourses(available);
      const enrolledInThisCategory = enrolled.filter(c => c.category.id === categoryIdParam);
      setEnrolledCourses(enrolledInThisCategory);

      // Calculate total duration for all courses in this category
      const allCategoryCoursesHours = [...available, ...enrolledInThisCategory]
        .reduce((total, course) => total + course.estimatedTime, 0);
      
      // Format as string with hours
      setTotalCategoryDuration(`${allCategoryCoursesHours} h`);

    } catch (err: any) {
      console.error("Failed to fetch courses or overall stats:", err);
      if (err.response?.status === 403) { 
        setError("Access denied to overall statistics. Displaying category-specific content only.");
        toast.error("Access denied to overall statistics.");
        setOverallLmsStats(null); 
      } else {
        setError(err.response?.data?.message || "Failed to load courses. Please try again.");
        toast.error(err.response?.data?.message || "Failed to load courses.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, categoryIdParam, navigate]); 

  useEffect(() => {
    fetchCoursesAndCategory();
  }, [fetchCoursesAndCategory]);

  const handleEnroll = async (courseId: number) => {
    if (!user?.id) {
      toast.error("You must be logged in to enroll in courses.");
      return;
    }

    setLoading(true);
    const enrollToast = toast.loading("Enrolling...");
    try {
      const newEnrollment = await createEnrollment(courseId); 
      toast.success(`Enrolled in "${newEnrollment.courseTitle}" successfully!`, { id: enrollToast });
      await fetchCoursesAndCategory(); 
      setActiveTab('learning'); 
    } catch (err: any) {
      console.error("Failed to enroll:", err);
      toast.error(err.response?.data?.message || "Failed to enroll in the course. Please try again.", { id: enrollToast });
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollConfirmation = (course: LearnerCourseDto) => {
    setSelectedCourseForUnenroll(course);
    setIsUnenrollModalOpen(true);
  };

  const handleUnenroll = async () => {
    if (!selectedCourseForUnenroll || !user?.id) return;

    setLoading(true);
    const unenrollToast = toast.loading("Unenrolling...");
    try {
      if (selectedCourseForUnenroll.isEnrolled && selectedCourseForUnenroll.enrollmentId) {
          await deleteEnrollment(selectedCourseForUnenroll.enrollmentId); 
          toast.success(`Unenrolled from "${selectedCourseForUnenroll.title}" successfully!`, { id: unenrollToast });
      } else {
          throw new Error("Enrollment ID not found for unenrollment. Course may not be correctly enrolled.");
      }
      
      await fetchCoursesAndCategory(); 
      setIsUnenrollModalOpen(false);
      setSelectedCourseForUnenroll(null);
    } catch (err: any) {
      console.error("Failed to unenroll:", err);
      toast.error(err.response?.data?.message || "Failed to unenroll from the course. Please try again.", { id: unenrollToast });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: number) => {
    navigate(`/learner/course-view/${courseId}`); 
  };

  const handleBack = () => {
    navigate('/learner/course-categories'); 
  };

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
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-unbounded mb-2 sm:mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
            {categoryName}
          </h2>
          <p className="text-[#D68BF9] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
            Explore our curated courses and start your learning journey
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          availableCoursesCount={availableCourses.length}
          enrolledCoursesCount={enrolledCourses.length}
          totalCategoryDuration={totalCategoryDuration}
        />

        {/* Tabs */}
        <CourseTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Error Message */}
        {error && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-red-500 text-red-500 font-nunito text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-40 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-white"></div>
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

      {/* Unenroll Confirmation Modal */}
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