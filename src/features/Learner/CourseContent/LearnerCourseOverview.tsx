// src/features/Learner/CourseContent/LearnerCourseOverview.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX like Google/Microsoft
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getLearnerCourseDetails, markDocumentCompleted, clearCourseCaches } from '../../../api/services/Course/learnerCourseService';
import { logCourseAccess } from '../../../api/services/Course/courseAccessService';
import { useBadgeChecker } from '../../../hooks/useBadgeChecker';
import { AxiosError } from 'axios';
import { emitLearnerDashboardRefreshNeeded } from '../../../utils/learnerDashboardEvents';

const CERTIFICATE_GEN_STORAGE_KEY = 'recentCertificateGens';

// ENTERPRISE: Enhanced progress tracking with optimistic updates
type ProgressItem = {
  isCompleted: boolean;
  isProcessing: boolean;
  optimisticComplete?: boolean;
};

// ENTERPRISE: Loading states for professional UX
const LoadingStates = {
  INITIAL: 'initial',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  REFRESHING: 'refreshing'
} as const;

type LoadingState = typeof LoadingStates[keyof typeof LoadingStates];

// ENTERPRISE: Professional skeleton components for instant loading experience
const CourseHeaderSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="w-24 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
));

const ProgressSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between items-center mb-2">
      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
    </div>
    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
  </div>
));

const LessonSkeleton: React.FC = React.memo(() => (
  <div className="border border-[#52007C] rounded-lg overflow-hidden animate-pulse">
    <div className="p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  </div>
));

const CourseContentSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-6"></div>
    <div className="space-y-4">
      {Array(4).fill(0).map((_, index) => (
        <LessonSkeleton key={`lesson-skeleton-${index}`} />
      ))}
    </div>
  </div>
));

// ENTERPRISE: Enhanced error recovery with exponential backoff
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
const LearnerCourseOverview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;
  const isMountedRef = useRef(true);
  const errorRecovery = useRef(new ErrorRecovery());
  const abortController = useRef<AbortController | null>(null);

  // ENTERPRISE: Enhanced state management with granular loading
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingStates.INITIAL);
  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

  // ENTERPRISE: Enhanced progress tracking with optimistic updates
  const [docProgress, setDocProgress] = useState<Record<number, ProgressItem>>({});
  const [quizProgress, setQuizProgress] = useState<Record<number, boolean>>({});

  const [courseCompletionTrigger, setCourseCompletionTrigger] = useState(0);
  useBadgeChecker(courseCompletionTrigger);

  const [isCertificateGenerated, setIsCertificateGenerated] = useState(false);
  const [hasProcessedQuizCompletion, setHasProcessedQuizCompletion] = useState(false);

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

  // ENTERPRISE: Enhanced data fetching with smart error recovery
  const fetchCourseData = useCallback(async (forceRefresh = false) => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoadingState(forceRefresh ? LoadingStates.REFRESHING : LoadingStates.LOADING);

      if (forceRefresh) {
        clearCourseCaches();
      }

      // ENTERPRISE: Execute with retry mechanism
      const course = await errorRecovery.current.executeWithRetry(async () => {
        return await getLearnerCourseDetails(courseId);
      }, `Course details fetch for ${courseId}`);

      if (!isMountedRef.current) return;

      // ENTERPRISE: Initialize state with optimistic patterns
      const initialExpanded: Record<number, boolean> = {};
      const initialDocs: Record<number, ProgressItem> = {};
      const initialQuizzes: Record<number, boolean> = {};

      course.lessons.forEach(lesson => {
        initialExpanded[lesson.id] = false;
        
        lesson.documents.forEach(doc => {
          initialDocs[doc.id] = {
            isCompleted: doc.isCompleted,
            isProcessing: false,
          };
        });
        
        if (lesson.quizId) {
          initialQuizzes[lesson.quizId] = lesson.isQuizCompleted;
        }
      });
      
      setCourseData(course);
      setExpandedLessons(initialExpanded);
      setDocProgress(initialDocs);
      setQuizProgress(initialQuizzes);
      setLoadingState(LoadingStates.SUCCESS);

      // ENTERPRISE: Background task - log course access and notify dashboard
      try {
        if (typeof logCourseAccess === 'function') {
          logCourseAccess(courseId);
          // MODIFIED: Emit an event to notify the dashboard to refresh its active courses
          emitLearnerDashboardRefreshNeeded('active-courses-updated');
          console.log('✅ Emitted event: active-courses-updated');
        }
      } catch (err) {
        console.warn('Failed to log course access or emit refresh event:', err);
      }

    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("Error fetching course details:", error);
      setLoadingState(LoadingStates.ERROR);
      toast.error("Failed to load course details.");
      navigate("/learner/course-categories");
    }
  }, [courseId, navigate]);

  // ENTERPRISE: Initial load effect
  useEffect(() => {
    const certificateGeneratedForCourse = localStorage.getItem(`certificateGenerated_${courseId}`);
    if (certificateGeneratedForCourse) {
      setIsCertificateGenerated(true);
    }

    fetchCourseData();
  }, [courseId, fetchCourseData]);

  // ENTERPRISE: Enhanced progress calculation with memoization
  const progressCalculation = useMemo(() => {
    if (!courseData) return { totalItems: 0, completedItems: 0, newProgressPercentage: 0 };

    let totalItems = 0;
    let completedItems = 0;
    
    courseData.lessons.forEach(lesson => {
      totalItems += lesson.documents.length + (lesson.hasQuiz ? 1 : 0);
      
      // Count completed documents (including optimistic updates)
      completedItems += lesson.documents.filter(doc => {
        const progress = docProgress[doc.id];
        return progress?.isCompleted || progress?.optimisticComplete;
      }).length;
      
      // Count completed quizzes
      if (lesson.quizId && quizProgress[lesson.quizId]) {
        completedItems++;
      }
    });
    
    const newProgressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { totalItems, completedItems, newProgressPercentage };
  }, [courseData, docProgress, quizProgress]);

  // ENTERPRISE: Progress update effect with optimistic patterns
  useEffect(() => {
    if (!courseData) return;

    const { newProgressPercentage } = progressCalculation;
    
    if (courseData.progressPercentage === newProgressPercentage) {
      return;
    }
    
    // ENTERPRISE: Celebration for course completion
    if (newProgressPercentage === 100 && courseData.progressPercentage < 100) {
      toast.success("🎉 Congratulations! You've completed the course!", { 
        duration: 5000,
        id: `course-completed-${courseId}`,
        style: {
          background: 'linear-gradient(135deg, #BF4BF6 0%, #D68BF9 100%)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      setCourseCompletionTrigger(count => count + 1);
    }
    
    // ENTERPRISE: Optimistic progress update
    setCourseData(prevCourseData => ({
      ...prevCourseData!,
      progressPercentage: newProgressPercentage
    }));
  }, [progressCalculation, courseData?.progressPercentage, courseId]);

  // ENTERPRISE: Enhanced quiz completion handling with direct API bypass
  useEffect(() => {
    if (location.state?.quizCompleted && courseId && !hasProcessedQuizCompletion) {
      const { quizId, attemptId } = location.state;
      
      const refreshCourseData = async (retryCount = 0) => {
        try {
          // ENTERPRISE: Add processing delay for backend consistency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log(`🚀 DIRECT API CALL (attempt ${retryCount + 1}) - BYPASSING ALL CACHE`);
          
          // ENTERPRISE: Direct API call bypassing all caching mechanisms
          const authToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5177/api';
          const apiEndpoint = `${baseURL}/LearnerCourses/${courseId}?_t=${Date.now()}&nocache=true`;
          
          console.log(`📡 Calling: ${apiEndpoint}`);
          
          const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken ? `Bearer ${authToken}` : '',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error(`Direct API failed: ${response.status} ${response.statusText}`);
          }
          
          const updatedCourse = await response.json();
          console.log(`📊 DIRECT API RESPONSE:`, updatedCourse);
          
          // ENTERPRISE: Validate quiz completion in fresh data
          const targetLesson = updatedCourse.lessons?.find((lesson: LearnerLessonDto) => lesson.quizId === quizId);
          const isQuizMarkedComplete = targetLesson?.isQuizCompleted;
          
          console.log(`📊 Quiz ${quizId} completion in DIRECT API:`, isQuizMarkedComplete);
          
          // ENTERPRISE: Retry if backend still processing
          if (!isQuizMarkedComplete && retryCount < 2) {
            console.log(`⏳ Backend still processing, retrying in 2 seconds...`);
            setTimeout(() => refreshCourseData(retryCount + 1), 2000);
            return;
          }
          
          // ENTERPRISE: Update all state with fresh data
          setCourseData(updatedCourse);
          
          const updatedDocs: Record<number, ProgressItem> = {};
          const updatedQuizzes: Record<number, boolean> = {};

          updatedCourse.lessons.forEach((lesson: LearnerLessonDto) => {
            lesson.documents.forEach(doc => {
              updatedDocs[doc.id] = {
                isCompleted: doc.isCompleted,
                isProcessing: false,
              };
            });
            
            if (lesson.quizId) {
              updatedQuizzes[lesson.quizId] = lesson.isQuizCompleted;
            }
          });
          
          setDocProgress(updatedDocs);
          setQuizProgress(updatedQuizzes);
          
          // ENTERPRISE: Show completion toast (non-duplicate)
          if (!attemptId && retryCount === 0) {
            toast.success("Quiz completed! Your progress has been updated.", {
              id: `quiz-completed-${quizId}`,
              duration: 3000
            });
          }
          
          console.log(`✅ SUCCESS: DIRECT API UPDATE COMPLETE`);
          
        } catch (error) {
          console.error('DIRECT API CALL FAILED:', error);
          
          // ENTERPRISE: Fallback to optimistic local update
          console.log(`🆘 FORCING LOCAL STATE UPDATE for quiz ${quizId}`);
          setQuizProgress(prev => ({ ...prev, [quizId]: true }));
          
          if (!attemptId) {
            toast.success("Quiz completed! Your progress has been updated.", {
              id: `quiz-completed-${quizId}`,
              duration: 3000
            });
          }
        }
      };
      
      refreshCourseData();
      setHasProcessedQuizCompletion(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, courseId, navigate, location.pathname, hasProcessedQuizCompletion]);

  // ENTERPRISE: Enhanced document completion with optimistic updates
  const handleMarkDocumentComplete = useCallback(async (documentId: number) => {
    if (!courseId || docProgress[documentId]?.isCompleted || docProgress[documentId]?.isProcessing) return;

    // ENTERPRISE: Optimistic UI update
    setDocProgress(prev => ({ 
      ...prev, 
      [documentId]: { 
        ...prev[documentId], 
        isProcessing: true,
        optimisticComplete: true 
      } 
    }));

    const completionToast = toast.loading("Saving progress...");
    
    try {
      const result = await markDocumentCompleted(documentId);
      
      // ENTERPRISE: Update with confirmed completion
      setDocProgress(prev => ({ 
        ...prev, 
        [documentId]: { 
          isCompleted: true, 
          isProcessing: false,
          optimisticComplete: false 
        } 
      }));
      
      toast.success("Progress saved!", {
        id: completionToast,
        duration: 2000
      });
      
      // ENTERPRISE: Emit progress update event
      window.dispatchEvent(new CustomEvent('courseProgressUpdated', {
        detail: { courseId: result.courseId, documentId }
      }));
      
      console.log(`✅ Document ${documentId} completed, course ${result.courseId} progress updated`);
      
    } catch (error) {
      console.error("Error marking document as complete:", error);
      
      // ENTERPRISE: Rollback optimistic update on error
      setDocProgress(prev => ({ 
        ...prev, 
        [documentId]: { 
          ...prev[documentId], 
          isCompleted: false, 
          isProcessing: false,
          optimisticComplete: false 
        } 
      }));
      
      toast.error("Failed to save progress. Please try again.", {
        id: completionToast
      });
    }
  }, [courseId, docProgress]);

  // ENTERPRISE: Enhanced quiz action handling
  const handleQuizAction = useCallback((lesson: LearnerLessonDto) => {
    if (!lesson.quizId) return;
    
    const isQuizDone = quizProgress[lesson.quizId] || lesson.isQuizCompleted;
    
    console.log(`🎯 Quiz ${lesson.quizId} status: local=${quizProgress[lesson.quizId]}, backend=${lesson.isQuizCompleted}, combined=${isQuizDone}`);

    if (isQuizDone && lesson.lastAttemptId) {
      navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { state: { courseId } });
    } else {
      navigate(`/learner/take-quiz/${lesson.quizId}`, { state: { courseId } });
    }
  }, [quizProgress, navigate, courseId]);
  
  // ENTERPRISE: Enhanced certificate generation with better UX
  const handleGenerateCertificate = useCallback(async () => {
    if (!courseData || !courseId || isGeneratingCertificate || isCertificateGenerated) return;
    
    if (courseData.progressPercentage < 100) {
      toast.error("You must complete 100% of the course to generate a certificate.", {
        duration: 4000
      });
      return;
    }
    
    setIsGeneratingCertificate(true);
    const generationToast = toast.loading("Generating your certificate...");
    
    try {
      await generateCertificate(courseId);
      
      localStorage.setItem(`certificateGenerated_${courseId}`, 'true');
      setIsCertificateGenerated(true);

      // ENTERPRISE: Track certificate generation history in localStorage
      try {
        const existingGensRaw = localStorage.getItem(CERTIFICATE_GEN_STORAGE_KEY);
        const existingGens = existingGensRaw ? JSON.parse(existingGensRaw) : [];
        
        const newGen = {
          courseId: courseId,
          courseTitle: courseData.title,
          generationTime: new Date().toISOString(),
        };

        const updatedGens = [newGen, ...existingGens].slice(0, 5);
        localStorage.setItem(CERTIFICATE_GEN_STORAGE_KEY, JSON.stringify(updatedGens));

        // MODIFIED: Emit event to refresh recent activities on the dashboard
        emitLearnerDashboardRefreshNeeded('recent-activities-updated');
        console.log('✅ Emitted event: recent-activities-updated');

      } catch (e) {
        console.error("Could not save certificate generation to local storage:", e);
      }
      
      toast.success("🎉 Certificate generated successfully!", {
        id: generationToast,
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #BF4BF6 0%, #D68BF9 100%)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      
      navigate(`/learner/certificate`);
      
    } catch (error) {
      console.error("Error generating certificate:", error);
      const axiosError = error as AxiosError<{ message?: string, data?: any }>;
      const serverMessage = axiosError.response?.data?.message || 
        (typeof axiosError.response?.data === 'string' ? axiosError.response.data : null);
      
      toast.error(serverMessage || "Failed to generate certificate. Please try again.", {
        id: generationToast
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  }, [courseData, courseId, isGeneratingCertificate, isCertificateGenerated, navigate]);

  // ENTERPRISE: Memoized navigation handlers
  const handleGoBack = useCallback(() => {
    if (courseData?.category?.id) {
      navigate(`/learner/courses/${courseData.category.id}`);
    } else {
      navigate("/learner/course-categories");
    }
  }, [courseData, navigate]);

  const toggleLessonExpand = useCallback((lessonId: number) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  }, []);
  
  const handleDownloadDocument = useCallback((fileUrl: string, fileName: string) => {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`Downloading ${fileName}`, {
        duration: 2000
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  }, []);

  // ENTERPRISE: Enhanced loading states
  const isInitialLoading = loadingState === LoadingStates.INITIAL || loadingState === LoadingStates.LOADING;
  const isRefreshing = loadingState === LoadingStates.REFRESHING;

  // ENTERPRISE: Instant loading display with professional skeletons
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center text-[#D68BF9] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <div className="h-4 bg-gradient-to-r from-[#D68BF9]/30 to-[#D68BF9]/10 rounded w-40 animate-pulse"></div>
          </div>
          
          <CourseHeaderSkeleton />
          <ProgressSkeleton />
          <CourseContentSkeleton />
        </div>
      </div>
    );
  }

  // ENTERPRISE: Error state
  if (loadingState === LoadingStates.ERROR || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-4">Course not found or failed to load</div>
          <button 
            onClick={() => navigate('/learner/course-categories')}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Return to Categories
          </button>
        </div>
      </div>
    );
  }

  const isCourseCompleted = courseData.progressPercentage === 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ENTERPRISE: Back button with loading state */}
        <button 
          onClick={handleGoBack} 
          className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6 disabled:opacity-50"
          disabled={isRefreshing}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {/* ENTERPRISE: Inactive course warning */}
        {courseData.isInactive && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">This Course is Currently Inactive</h3>
              <p className="text-sm">You can still view your progress and access content, but this course is no longer available for new enrollments.</p>
            </div>
          </div>
        )}

        {/* ENTERPRISE: Course header with enhanced layout */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="mb-2">
                <span className="bg-[#34137C]/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {courseData.category.title || courseData.category.name}
                </span>
              </div>
            
              {courseData.thumbnailUrl ? (
                <img 
                  src={courseData.thumbnailUrl} 
                  alt={courseData.title} 
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-[#D68BF9]" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold text-[#1B0A3F] mb-3">{courseData.title}</h1>
              <div className="flex items-center text-gray-600 text-sm mb-4">
                <User className="w-4 h-4 mr-2 text-[#52007C]" />
                <span>Created by {courseData.creator.name}</span>
              </div>
              
              {/* ENTERPRISE: Technology tags with better layout */}
              <div className="flex flex-wrap gap-2 mb-4">
                {courseData.technologies.map(tech => (
                  <span 
                    key={tech.id} 
                    className="bg-[#34137C] text-white px-3 py-2 rounded-full text-sm transition-all duration-200 hover:bg-[#52007C]"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-800 mb-4 leading-relaxed">{courseData.description}</p>
              
              {/* ENTERPRISE: Enhanced stats display */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
                  Estimated time: {courseData.estimatedTime} hours
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
                  Lessons: {courseData.totalLessons}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
                  Completed: {progressCalculation.completedItems}/{progressCalculation.totalItems}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE: Enhanced progress section */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-[#BF4BF6] font-semibold">Your Progress</h2>
            <span className="text-[#1B0A3F] font-semibold">
              {courseData.progressPercentage}%
              {isRefreshing && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </span>
          </div>
          <div className="w-full border border-[#34137C] rounded-full h-4 overflow-hidden">
            <div 
              className="h-4 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]" 
              style={{ width: `${courseData.progressPercentage}%` }}
            ></div>
          </div>
          
          {/* ENTERPRISE: Certificate generation with enhanced UX */}
          {isCourseCompleted && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleGenerateCertificate} 
                disabled={isGeneratingCertificate || isCertificateGenerated} 
                className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
              >
                {isGeneratingCertificate ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Generating...
                  </>
                ) : isCertificateGenerated ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Certificate Generated
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ENTERPRISE: Enhanced course content section */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-[#1B0A3F] mb-6">Course Content</h2>
          
          <div className="space-y-4">
            {courseData.lessons.map((lesson) => {
              const localQuizStatus = lesson.quizId ? quizProgress[lesson.quizId] : false;
              const backendQuizStatus = lesson.isQuizCompleted;
              const isQuizCompleted = localQuizStatus || backendQuizStatus;
              
              return (
                <div key={lesson.id} className="border border-[#52007C] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors duration-200" 
                    onClick={() => toggleLessonExpand(lesson.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <ArrowLeft 
                        className={`text-[#BF4BF6] w-5 h-5 transition-transform duration-200 ${
                          expandedLessons[lesson.id] ? 'transform rotate-90' : 'transform -rotate-90'
                        }`} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-[#1B0A3F] font-medium">{lesson.lessonName}</h3>
                          {lesson.isCompleted && (
                            <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ENTERPRISE: Enhanced lesson content */}
                  {expandedLessons[lesson.id] && (
                    <div className="p-4 pt-0 border-t border-[#BF4BF6]/20 space-y-4 bg-gray-50/50">
                      
                      {/* Materials Section */}
                      {lesson.documents && lesson.documents.length > 0 && (
                        <div>
                          <h4 className="text-[#BF4BF6] text-sm font-semibold my-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Materials ({lesson.documents.length})
                          </h4>
                          <div className="space-y-2">
                            {lesson.documents.map((doc) => {
                              const status = docProgress[doc.id] || { isCompleted: false, isProcessing: false };
                              const isCompleted = status.isCompleted || status.optimisticComplete;
                              
                              return (
                                <div 
                                  key={doc.id} 
                                  className="bg-[#34137C]/80 p-3 rounded-md flex justify-between items-center transition-all duration-200 hover:bg-[#34137C]/90"
                                >
                                  <div className="flex items-center text-white text-sm">
                                    {doc.documentType === 'PDF' ? (
                                      <FileText className="w-4 h-4 mr-2" />
                                    ) : (
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                    )}
                                    <span className="flex-1">{doc.name}</span>
                                    {isCompleted && (
                                      <CheckCircle className="w-4 h-4 ml-2 text-green-400" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {!isCompleted && (
                                      <button 
                                        onClick={() => handleMarkDocumentComplete(doc.id)} 
                                        disabled={status.isProcessing}
                                        className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center gap-1"
                                      >
                                        {status.isProcessing ? (
                                          <>
                                            <Loader2 className="animate-spin w-3 h-3" />
                                            Saving...
                                          </>
                                        ) : (
                                          'Mark Complete'
                                        )}
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} 
                                      className="text-white hover:text-[#D68BF9] transition-colors duration-200 p-1 hover:bg-white/10 rounded"
                                      title={`Download ${doc.name}`}
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz Section */}
                      {lesson.hasQuiz && lesson.quizId && (
                        <div>
                          <h4 className="text-[#BF4BF6] text-sm font-semibold my-2 flex items-center">
                            <List className="w-4 h-4 mr-2" />
                            Quiz Assessment
                          </h4>
                          <div className="bg-[#34137C]/80 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-white text-sm">
                                <List className="w-4 h-4 mr-2" />
                                <span>Lesson Quiz</span>
                                {isQuizCompleted && (
                                  <span className="ml-2 text-green-400 text-xs flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </span>
                                )}
                              </div>
                              <button 
                                onClick={() => handleQuizAction(lesson)} 
                                className="bg-[#BF4BF6] hover:bg-[#BF4BF6]/80 text-white text-xs py-1 px-3 rounded-full transition-all duration-200 hover:shadow-md"
                              >
                                {isQuizCompleted ? 'View Result' : 'Start Quiz'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Empty state */}
                      {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
                        <div className="text-gray-400 text-sm italic py-2 text-center">
                          No content available for this lesson.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseOverview;