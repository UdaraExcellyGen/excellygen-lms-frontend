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
  OwnershipFilter,
  AnalyticsFilters,
  ProcessedEnrollmentData,
} from "./types/analytics";

const CourseCoordinatorAnalytics: React.FC = () => {
  const navigate = useNavigate();

  const [enrollmentData, setEnrollmentData] = useState<ApiEnrollmentData[]>([]);
  const [categories, setCategories] = useState<ApiCourseCategory[]>([]);
  const [processedEnrollmentData, setProcessedEnrollmentData] = useState<ProcessedEnrollmentData[]>([]);

  const [availableCourses, setAvailableCourses] = useState<ApiCoordinatorCourse[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<ApiCourseQuiz[]>([]);
  const [quizPerformanceData, setQuizPerformanceData] = useState<ApiMarkRangeData[]>([]);

  const [filters, setFilters] = useState<AnalyticsFilters>({
    selectedCategoryId: null,
    enrollmentStatus: EnrollmentStatus.ALL,
    ownershipFilter: OwnershipFilter.MINE,
    selectedCourseId: null,
    selectedQuizId: null,
  });

  const [loadingStates, setLoadingStates] = useState({
    enrollments: true,
    categories: true,
    courses: true,
    quizzes: false,
    performance: false,
  });

  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

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

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        updateLoadingState('enrollments', true);
        const response = await getEnrollmentAnalytics(
          filters.selectedCategoryId,
          filters.enrollmentStatus,
          filters.ownershipFilter
        );
        setEnrollmentData(response.enrollments);
        const processed = processEnrollmentDataForChart(response.enrollments, filters.enrollmentStatus);
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
  }, [filters.selectedCategoryId, filters.enrollmentStatus, filters.ownershipFilter, updateLoadingState]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        updateLoadingState('courses', true);
        const courses = await getCoordinatorCourses(filters.selectedCategoryId, filters.ownershipFilter);
        setAvailableCourses(courses);
        if (filters.selectedCourseId && !courses.find(c => c.courseId === filters.selectedCourseId)) {
          setFilters(prev => ({ ...prev, selectedCourseId: null, selectedQuizId: null }));
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
  }, [filters.selectedCategoryId, filters.ownershipFilter, updateLoadingState]);

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

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setFilters(prev => ({ ...prev, selectedCategoryId: categoryId, selectedCourseId: null, selectedQuizId: null }));
  }, []);

  const handleStatusChange = useCallback((status: EnrollmentStatus) => {
    setFilters(prev => ({ ...prev, enrollmentStatus: status }));
  }, []);

  const handleOwnershipChange = useCallback((ownership: OwnershipFilter) => {
    setFilters(prev => ({ ...prev, ownershipFilter: ownership, selectedCourseId: null, selectedQuizId: null }));
  }, []);

  const handleCourseChange = useCallback((courseId: number | null) => {
    setFilters(prev => ({ ...prev, selectedCourseId: courseId, selectedQuizId: null }));
  }, []);

  const handleQuizChange = useCallback((quizId: number | null) => {
    setFilters(prev => ({ ...prev, selectedQuizId: quizId }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/coordinator/dashboard')} className="p-2 bg-white/10 rounded-full text-[#F6E6FF] hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white font-['Unbounded']">Advanced Course Analytics</h1>
        </div>

        <EnrollmentChart
          data={processedEnrollmentData}
          categories={categories}
          selectedCategoryId={filters.selectedCategoryId}
          enrollmentStatus={filters.enrollmentStatus}
          ownershipFilter={filters.ownershipFilter}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onOwnershipChange={handleOwnershipChange}
          loading={loadingStates.enrollments || loadingStates.categories}
        />

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

      </div>
    </div>
  );
};

export default CourseCoordinatorAnalytics;