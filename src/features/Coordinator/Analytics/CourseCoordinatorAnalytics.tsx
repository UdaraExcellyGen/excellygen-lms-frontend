// CourseCoordinatorAnalytics.tsx 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnrollmentChart from "./components/EnrollmentChart";
import QuizPerformance from "./components/QuizPerformance";
import { ArrowLeft } from 'lucide-react';

import {
  getEnrollmentAnalytics,
  getCoordinatorCourses,
  getQuizzesForCourse,
  getQuizPerformance,
} from "../../../api/services/Course/CourseAnalyticsServices"; 
import {
  ApiEnrollmentData,
  ApiCoordinatorCourse,
  ApiCourseQuiz,
  ApiMarkRangeData,
} from "../Analytics/types/analytics"; 

const CourseCoordinatorAnalytics: React.FC = () => {
  const navigate = useNavigate();

  const [enrollmentChartData, setEnrollmentChartData] = useState<ApiEnrollmentData[]>([]);
  const [availableCourses, setAvailableCourses] = useState<ApiCoordinatorCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<ApiCourseQuiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizPerformanceData, setQuizPerformanceData] = useState<ApiMarkRangeData[]>([]);

  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [, setLoadingQuizzes] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Fetch enrollment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEnrollments(true);
        const data = await getEnrollmentAnalytics();
        setEnrollmentChartData(data);
      } catch (error) {
        console.error("Failed to fetch enrollment data:", error);
        // Handle error display
      } finally {
        setLoadingEnrollments(false);
      }
    };
    fetchData();
  }, []);

  // Fetch available courses for the coordinator
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const courses = await getCoordinatorCourses();
        setAvailableCourses(courses);
        if (courses.length > 0) {
          // setSelectedCourseId(courses[0].courseId); // Auto-select first course
        }
      } catch (error) {
        console.error("Failed to fetch coordinator courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch quizzes when a course is selected
  useEffect(() => {
    if (selectedCourseId !== null) {
      const fetchQuizzes = async () => {
        try {
          setLoadingQuizzes(true);
          setAvailableQuizzes([]); // Clear previous quizzes
          setSelectedQuizId(null); // Reset selected quiz
          setQuizPerformanceData([]); // Clear performance data
          const quizzes = await getQuizzesForCourse(selectedCourseId);
          setAvailableQuizzes(quizzes);
          
        } catch (error) {
          console.error(`Failed to fetch quizzes for course ${selectedCourseId}:`, error);
        } finally {
          setLoadingQuizzes(false);
        }
      };
      fetchQuizzes();
    } else {
      setAvailableQuizzes([]);
      setSelectedQuizId(null);
      setQuizPerformanceData([]);
    }
  }, [selectedCourseId]);

  // Fetch quiz performance when a quiz is selected
  useEffect(() => {
    if (selectedQuizId !== null) {
      const fetchPerformance = async () => {
        try {
          setLoadingPerformance(true);
          setQuizPerformanceData([]); // Clear previous data
          const performance = await getQuizPerformance(selectedQuizId);
          setQuizPerformanceData(performance);
        } catch (error) {
          console.error(`Failed to fetch performance for quiz ${selectedQuizId}:`, error);
        } finally {
          setLoadingPerformance(false);
        }
      };
      fetchPerformance();
    } else {
       setQuizPerformanceData([]);
    }
  }, [selectedQuizId]);

  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId);
    // Quizzes and performance will be fetched by useEffect hooks
  };

  const handleQuizChange = (quizId: number) => {
    setSelectedQuizId(quizId);
    // Performance will be fetched by useEffect hook
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
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
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">Course Analytics</h1>
              <p className="text-gray-500 font-['Nunito_Sans']">Course Enrollment and Quiz Performance Analytics</p>
            </div>
          </div>
        </div>

      

      {loadingEnrollments ? <div className="p-6">Loading enrollments...</div>: <EnrollmentChart data={enrollmentChartData} />}

      {loadingCourses ? <div className="p-6">Loading Courses...</div> : (
        <QuizPerformance
          availableCourses={availableCourses}
          selectedCourseId={selectedCourseId}
          onCourseChange={handleCourseChange}
          availableQuizzes={availableQuizzes}
          selectedQuizId={selectedQuizId}
          onQuizChange={handleQuizChange}
          performanceData={quizPerformanceData}
          // Add loading state indicators to QuizPerformance component if desired
        />
      )}
       {/* Optional: Display loading states for quizzes and performance within QuizPerformance or here */}
       
       {loadingPerformance && <p className="text-center mt-4">Loading quiz performance...</p>}
    </div>
    </div>
  );
};

export default CourseCoordinatorAnalytics;