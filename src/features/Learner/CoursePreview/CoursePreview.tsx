// src/features/Learner/CoursePreview/CoursePreview.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX like Google/Microsoft
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, Clock, FileText, PlayCircle, AlertTriangle, Eye, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto } from '../../../types/course.types';
import { getCoursePreview } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment } from '../../../api/services/Course/enrollmentService';

// ENTERPRISE: Loading states for professional UX
const LoadingStates = {
  INITIAL: 'initial',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  ENROLLING: 'enrolling'
} as const;

type LoadingState = typeof LoadingStates[keyof typeof LoadingStates];

// ENTERPRISE: Professional skeleton components for instant loading experience
const PreviewBannerSkeleton: React.FC = React.memo(() => (
  <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 flex items-center gap-4 shadow-lg animate-pulse">
    <div className="w-8 h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/3"></div>
      <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-3/4"></div>
    </div>
  </div>
));

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

const LessonSkeleton: React.FC = React.memo(() => (
  <div className="border border-[#BF4BF6]/30 rounded-lg p-4 bg-[#F6E6FF]/20 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full"></div>
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
        <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded w-20"></div>
      </div>
    </div>
  </div>
));

const CourseContentSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mb-6"></div>
    <div className="space-y-3">
      {Array(4).fill(0).map((_, index) => (
        <LessonSkeleton key={`lesson-skeleton-${index}`} />
      ))}
    </div>
    <div className="mt-6 pt-6 border-t border-[#BF4BF6]/20 text-center space-y-4">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto"></div>
      <div className="h-12 bg-gradient-to-r from-purple-200 to-purple-300 rounded w-32 mx-auto"></div>
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
const CoursePreview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;
  const isMountedRef = useRef(true);
  const errorRecovery = useRef(new ErrorRecovery());
  const abortController = useRef<AbortController | null>(null);

  // ENTERPRISE: Enhanced state management with granular loading
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingStates.INITIAL);
  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

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
  const fetchCourseData = useCallback(async () => {
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
      setLoadingState(LoadingStates.LOADING);

      // ENTERPRISE: Execute with retry mechanism
      const course = await errorRecovery.current.executeWithRetry(async () => {
        return await getCoursePreview(courseId);
      }, `Course preview fetch for ${courseId}`);

      if (!isMountedRef.current) return;

      // DEBUG: Log the course data to see what we're getting
      console.log('🔍 CoursePreview - Found course:', {
        id: course.id,
        title: course.title,
        lessonsLength: course.lessons?.length || 0,
        lessons: course.lessons,
        totalLessons: course.totalLessons,
        lessonNames: course.lessons?.map(l => l.lessonName)
      });
      
      setCourseData(course);
      setLoadingState(LoadingStates.SUCCESS);

    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("Error fetching course details:", error);
      setLoadingState(LoadingStates.ERROR);
      toast.error("Failed to load course details. You may already be enrolled in this course.");
      navigate("/learner/course-categories");
    }
  }, [courseId, navigate]);

  // ENTERPRISE: Initial load effect
  useEffect(() => {
    fetchCourseData();
  }, [courseId, fetchCourseData]);

  // ENTERPRISE: Enhanced enrollment with optimistic updates and event emission
  const handleEnrollNow = useCallback(async () => {
    if (!courseData || isEnrolling || enrollmentSuccess) return;
    
    setIsEnrolling(true);
    const enrollmentToast = toast.loading("Enrolling you in the course...");
    
    try {
      // ENTERPRISE: Optimistic UI update
      setEnrollmentSuccess(true);
      
      const newEnrollment = await createEnrollment(courseData.id);
      
      toast.success(`Successfully enrolled in "${courseData.title}"!`, {
        id: enrollmentToast,
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #BF4BF6 0%, #D68BF9 100%)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      
      // ENTERPRISE: Emit enrollment events for other components to listen
      window.dispatchEvent(new CustomEvent('enrollment-created', { 
        detail: { 
          courseId: courseData.id, 
          enrollmentId: newEnrollment.id,
          categoryId: courseData.category?.id 
        }
      }));
      
      window.dispatchEvent(new CustomEvent('dashboard-refresh-needed', { 
        detail: { eventType: 'enrollment-created' }
      }));
      
      console.log('🎉 Enrollment events emitted for course:', courseData.id);
      
      // ENTERPRISE: Navigate to the actual course view after enrollment
      setTimeout(() => {
        navigate(`/learner/course-view/${courseData.id}`);
      }, 1000); // Small delay for better UX
      
    } catch (error: any) {
      console.error('Enrollment error:', error);
      
      // ENTERPRISE: Rollback optimistic update on error
      setEnrollmentSuccess(false);
      
      const errorMessage = error.response?.data?.message || 'Please try again.';
      toast.error(`Failed to enroll: ${errorMessage}`, {
        id: enrollmentToast,
        duration: 4000
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [courseData, isEnrolling, enrollmentSuccess, navigate]);

  // ENTERPRISE: Memoized navigation handler
  const handleGoBack = useCallback(() => {
    if (courseData?.category?.id) {
      navigate(`/learner/courses/${courseData.category.id}`);
    } else {
      navigate("/learner/course-categories");
    }
  }, [courseData, navigate]);

  // ENTERPRISE: Memoized course statistics
  const courseStats = useMemo(() => {
    if (!courseData) return null;
    
    return {
      estimatedTime: courseData.estimatedTime || 0,
      totalLessons: courseData.totalLessons || courseData.lessons?.length || 0,
      activeLearnersCount: courseData.activeLearnersCount || 0
    };
  }, [courseData]);

  // ENTERPRISE: Enhanced loading states
  const isInitialLoading = loadingState === LoadingStates.INITIAL || loadingState === LoadingStates.LOADING;

  // ENTERPRISE: Instant loading display with professional skeletons
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center text-[#D68BF9] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <div className="h-4 bg-gradient-to-r from-[#D68BF9]/30 to-[#D68BF9]/10 rounded w-32 animate-pulse"></div>
          </div>
          
          <PreviewBannerSkeleton />
          <CourseHeaderSkeleton />
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
          <div className="text-white text-xl mb-4">Course not found or you may already be enrolled</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ENTERPRISE: Back button */}
        <button 
          onClick={handleGoBack} 
          className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {/* ENTERPRISE: Preview Mode Banner */}
        <div className="bg-blue-500/20 border-2 border-blue-500 text-blue-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
          <Eye className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Course Preview Mode</h3>
            <p className="text-sm">You're viewing this course in preview mode. Enroll to access lessons and track your progress.</p>
          </div>
        </div>

        {/* ENTERPRISE: Inactive course warning */}
        {courseData.isInactive && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">This Course is Currently Inactive</h3>
              <p className="text-sm">This course is no longer available for new enrollments.</p>
            </div>
          </div>
        )}

        {/* ENTERPRISE: Course Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="mb-2">
                <span className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white px-3 py-1 rounded-lg text-sm font-semibold">
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
              <h1 className="text-2xl font-bold text-[#1B0A3F] mb-3 font-nunito">{courseData.title}</h1>
              <div className="flex items-center text-[#52007C] text-sm mb-4">
                <User className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                <span className="font-medium font-nunito">Created by {courseData.creator?.name || 'ExcellyGen Team'}</span>
              </div>
              
              {/* ENTERPRISE: Technology tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {courseData.technologies.map(tech => (
                  <span 
                    key={tech.id} 
                    className="bg-[#F6E6FF] text-[#52007C] px-3 py-2 rounded-full text-sm font-medium font-nunito transition-all duration-200 hover:bg-[#E6D0FF]"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
              
              <p className="text-[#52007C] mb-4 leading-relaxed font-nunito">{courseData.description}</p>
              
              {/* ENTERPRISE: Enhanced stats display */}
              <div className="flex flex-wrap gap-4 text-sm text-[#52007C] mb-4">
                <div className="flex items-center font-nunito">
                  <Clock className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                  Estimated time: {courseStats?.estimatedTime} hours
                </div>
                <div className="flex items-center font-nunito">
                  <BookOpen className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                  Lessons: {courseStats?.totalLessons}
                </div>
                <div className="flex items-center font-nunito">
                  <User className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                  Enrolled Students: {courseStats?.activeLearnersCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE: Course Subtopics Preview */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
          <h2 className="text-xl font-bold text-[#1B0A3F] mb-6 font-nunito">
            Course Subtopics ({courseData.lessons?.length || courseData.totalLessons || 0} Lessons)
          </h2>
          
          {/* ENTERPRISE: Enhanced lessons display or fallback */}
          {courseData.lessons && courseData.lessons.length > 0 ? (
            <div className="space-y-3">
              {courseData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="border border-[#BF4BF6]/30 rounded-lg p-4 bg-[#F6E6FF]/20 hover:bg-[#F6E6FF]/40 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white px-3 py-1 rounded-full text-sm font-semibold font-nunito min-w-[2rem] text-center">
                        {index + 1}
                      </span>
                      <h3 className="text-[#1B0A3F] font-semibold font-nunito">{lesson.lessonName}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-[#52007C] text-sm font-nunito">
                      {/* Show generic material indicator since we don't have document count in preview */}
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1 text-[#BF4BF6]" />
                        <span>Materials</span>
                      </div>
                      {lesson.hasQuiz && (
                        <div className="flex items-center">
                          <PlayCircle className="w-4 h-4 mr-1 text-[#BF4BF6]" />
                          <span>Quiz</span>
                        </div>
                      )}
                      <div className="bg-[#E6D0FF] text-[#52007C] px-2 py-1 rounded-full text-xs font-semibold">
                        Preview Only
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ENTERPRISE: Enhanced fallback when no lessons data available */
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-[#BF4BF6] mx-auto mb-4 opacity-50" />
              <h3 className="text-[#52007C] font-semibold mb-2 font-nunito">Lesson Details Not Available in Preview</h3>
              <p className="text-[#52007C] text-sm font-nunito mb-4">
                This course contains {courseData.totalLessons || 'multiple'} lesson{(courseData.totalLessons || 0) !== 1 ? 's' : ''}, but detailed lesson information is only available after enrollment.
              </p>
              <div className="bg-[#F6E6FF] border border-[#BF4BF6]/30 rounded-lg p-4 text-[#52007C]">
                <p className="text-sm font-nunito">
                  🎓 <strong>What you'll get after enrollment:</strong>
                  <br />• Access to all lesson materials and resources
                  <br />• Interactive quizzes and assessments  
                  <br />• Progress tracking and completion certificates
                  <br />• Full course content and downloadable materials
                </p>
              </div>
            </div>
          )}
          
          {/* ENTERPRISE: Enhanced Enrollment CTA */}
          {!courseData.isInactive && (
            <div className="mt-6 pt-6 border-t border-[#BF4BF6]/20 text-center">
              <p className="text-[#52007C] mb-4 font-nunito">Ready to start learning? Enroll now to access all lessons and track your progress!</p>
              <button 
                onClick={handleEnrollNow}
                disabled={isEnrolling || enrollmentSuccess}
                className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-nunito"
              >
                {isEnrolling ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Enrolling...
                  </div>
                ) : enrollmentSuccess ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enrolled! Redirecting...
                  </div>
                ) : (
                  'Enroll Now'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;