// src/features/Coordinator/Analytics/CourseCoordinatorAnalytics.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

import EnrollmentChart from "./components/EnrollmentChart";
import QuizPerformance from "./components/QuizPerformance";

import {
  getEnrollmentAnalytics,
  getCourseCategories,
  getCoordinatorCourses,
  getQuizzesForCourse,
  getQuizPerformance,
  processEnrollmentDataForChart,
} from "../../../api/services/Course/CourseAnalyticsServices";

import {
  ApiEnrollmentData,
  ApiCoordinatorCourse,
  ApiCourseQuiz,
  ApiMarkRangeData,
  ApiCourseCategory,
  EnrollmentStatus,
  AnalyticsFilters,
  ProcessedEnrollmentData,
} from "./types/analytics";

const CourseCoordinatorAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // State for enrollment analytics
  const [enrollmentData, setEnrollmentData] = useState<ApiEnrollmentData[]>([]);
  const [categories, setCategories] = useState<ApiCourseCategory[]>([]);
  const [processedEnrollmentData, setProcessedEnrollmentData] = useState<ProcessedEnrollmentData[]>([]);

  // State for quiz analytics
  const [availableCourses, setAvailableCourses] = useState<ApiCoordinatorCourse[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<ApiCourseQuiz[]>([]);
  const [quizPerformanceData, setQuizPerformanceData] = useState<ApiMarkRangeData[]>([]);

  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilters>({
    selectedCategoryId: null, // Now string | null
    enrollmentStatus: EnrollmentStatus.ALL,
    selectedCourseId: null,
    selectedQuizId: null,
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    enrollments: true,
    categories: true,
    courses: true,
    quizzes: false,
    performance: false,
  });

  // Update loading state helper
  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        updateLoadingState('categories', true);
        const categoriesData = await getCourseCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch course categories:", error);
        toast.error("Failed to load course categories");
      } finally {
        updateLoadingState('categories', false);
      }
    };
    fetchCategories();
  }, [updateLoadingState]);

  // Fetch enrollment data when filters change
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        updateLoadingState('enrollments', true);
        const response = await getEnrollmentAnalytics(
          filters.selectedCategoryId,
          filters.enrollmentStatus
        );
        setEnrollmentData(response.enrollments);
        
        // Process data for chart display
        const processed = processEnrollmentDataForChart(
          response.enrollments,
          filters.enrollmentStatus
        );
        setProcessedEnrollmentData(processed);
      } catch (error) {
        console.error("Failed to fetch enrollment data:", error);
        toast.error("Failed to load enrollment analytics");
        setEnrollmentData([]);
        setProcessedEnrollmentData([]);
      } finally {
        updateLoadingState('enrollments', false);
      }
    };

    fetchEnrollmentData();
  }, [filters.selectedCategoryId, filters.enrollmentStatus, updateLoadingState]);

  // Fetch coordinator courses when category filter changes
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        updateLoadingState('courses', true);
        const courses = await getCoordinatorCourses(filters.selectedCategoryId);
        setAvailableCourses(courses);
        
        // Reset course and quiz selections if current course is not in new list
        if (filters.selectedCourseId && !courses.find(c => c.courseId === filters.selectedCourseId)) {
          setFilters(prev => ({
            ...prev,
            selectedCourseId: null,
            selectedQuizId: null
          }));
        }
      } catch (error) {
        console.error("Failed to fetch coordinator courses:", error);
        toast.error("Failed to load courses");
        setAvailableCourses([]);
      } finally {
        updateLoadingState('courses', false);
      }
    };
    fetchCourses();
  }, [filters.selectedCategoryId, filters.selectedCourseId, updateLoadingState]);

  // Fetch quizzes when course is selected
  useEffect(() => {
    if (filters.selectedCourseId !== null) {
      const fetchQuizzes = async () => {
        try {
          updateLoadingState('quizzes', true);
          setAvailableQuizzes([]);
          setFilters(prev => ({ ...prev, selectedQuizId: null }));
          setQuizPerformanceData([]);
          
          const quizzes = await getQuizzesForCourse(filters.selectedCourseId!);
          setAvailableQuizzes(quizzes);
        } catch (error) {
          console.error(`Failed to fetch quizzes for course ${filters.selectedCourseId}:`, error);
          toast.error("Failed to load quizzes");
        } finally {
          updateLoadingState('quizzes', false);
        }
      };
      fetchQuizzes();
    } else {
      setAvailableQuizzes([]);
      setFilters(prev => ({ ...prev, selectedQuizId: null }));
      setQuizPerformanceData([]);
    }
  }, [filters.selectedCourseId, updateLoadingState]);

  // Fetch quiz performance when quiz is selected
  useEffect(() => {
    if (filters.selectedQuizId !== null) {
      const fetchPerformance = async () => {
        try {
          updateLoadingState('performance', true);
          setQuizPerformanceData([]);
          
          const response = await getQuizPerformance(filters.selectedQuizId!);
          setQuizPerformanceData(response.performanceData);
        } catch (error) {
          console.error(`Failed to fetch performance for quiz ${filters.selectedQuizId}:`, error);
          toast.error("Failed to load quiz performance data");
        } finally {
          updateLoadingState('performance', false);
        }
      };
      fetchPerformance();
    } else {
      setQuizPerformanceData([]);
    }
  }, [filters.selectedQuizId, updateLoadingState]);

  // Filter change handlers
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setFilters(prev => ({
      ...prev,
      selectedCategoryId: categoryId,
      selectedCourseId: null,
      selectedQuizId: null
    }));
  }, []);

  const handleStatusChange = useCallback((status: EnrollmentStatus) => {
    setFilters(prev => ({ ...prev, enrollmentStatus: status }));
  }, []);

  const handleCourseChange = useCallback((courseId: number) => {
    setFilters(prev => ({
      ...prev,
      selectedCourseId: courseId,
      selectedQuizId: null
    }));
  }, []);

  const handleQuizChange = useCallback((quizId: number) => {
    setFilters(prev => ({ ...prev, selectedQuizId: quizId }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        
        {/* Page Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-[#BF4BF6]/20 shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/coordinator/dashboard')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div>
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
                Advanced Course Analytics
              </h1>
              <p className="text-gray-500 font-['Nunito_Sans']">
                Comprehensive enrollment tracking and quiz performance analysis for your courses
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Analytics Section */}
        <EnrollmentChart
          data={processedEnrollmentData}
          categories={categories}
          selectedCategoryId={filters.selectedCategoryId}
          enrollmentStatus={filters.enrollmentStatus}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          loading={loadingStates.enrollments || loadingStates.categories}
        />

        {/* Quiz Performance Section */}
        <QuizPerformance
          availableCourses={availableCourses}
          selectedCourseId={filters.selectedCourseId}
          onCourseChange={handleCourseChange}
          availableQuizzes={availableQuizzes}
          selectedQuizId={filters.selectedQuizId}
          onQuizChange={handleQuizChange}
          performanceData={quizPerformanceData}
          loading={loadingStates.courses || loadingStates.quizzes || loadingStates.performance}
        />

        {/* Analytics Insights */}
        {!loadingStates.enrollments && processedEnrollmentData.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg">
            <h3 className="text-lg font-['Unbounded'] text-[#1B0A3F] mb-4">Analytics Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-[#52007C]/10 to-[#BF4BF6]/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-[#52007C]">
                  {processedEnrollmentData.length}
                </div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </div>
              <div className="bg-gradient-to-r from-[#BF4BF6]/10 to-[#52007C]/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-[#BF4BF6]">
                  {processedEnrollmentData.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {availableQuizzes.length}
                </div>
                <div className="text-sm text-gray-600">Available Quizzes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCoordinatorAnalytics;