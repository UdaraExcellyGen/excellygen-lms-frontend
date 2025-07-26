import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getLearnerCourseDetails, markDocumentCompleted } from '../../../api/services/Course/learnerCourseService';
import { logCourseAccess } from '../../../api/services/Course/courseAccessService';
import { useBadgeChecker } from '../../../hooks/useBadgeChecker';
import { AxiosError } from 'axios';

const CERTIFICATE_GEN_STORAGE_KEY = 'recentCertificateGens';

type ProgressItem = {
  isCompleted: boolean;
  isProcessing: boolean;
};

const LearnerCourseOverview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

  const [docProgress, setDocProgress] = useState<Record<number, ProgressItem>>({});
  const [quizProgress, setQuizProgress] = useState<Record<number, boolean>>({});

  const [courseCompletionTrigger, setCourseCompletionTrigger] = useState(0);
  useBadgeChecker(courseCompletionTrigger);

  const [isCertificateGenerated, setIsCertificateGenerated] = useState(false);
  const [hasProcessedQuizCompletion, setHasProcessedQuizCompletion] = useState(false);

  // Main data fetching and state initialization effect
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }

    const certificateGeneratedForCourse = sessionStorage.getItem(`certificateGenerated_${courseId}`);
    if (certificateGeneratedForCourse) {
      setIsCertificateGenerated(true);
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const course = await getLearnerCourseDetails(courseId);
        
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

        logCourseAccess(courseId);

      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details.");
        navigate("/learner/course-categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId, navigate]);

  // Progress calculation effect
  useEffect(() => {
    if (!courseData) return;

    let totalItems = 0;
    let completedItems = 0;
    
    courseData.lessons.forEach(lesson => {
      totalItems += lesson.documents.length + (lesson.hasQuiz ? 1 : 0);
      completedItems += lesson.documents.filter(doc => docProgress[doc.id]?.isCompleted).length;
      if (lesson.quizId && quizProgress[lesson.quizId]) {
        completedItems++;
      }
    });
    
    const newProgressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    if (courseData.progressPercentage === newProgressPercentage) {
      return;
    }
    
    if (newProgressPercentage === 100 && courseData.progressPercentage < 100) {
      toast.success("Congratulations! You've completed the course!", { 
        duration: 4000,
        id: `course-completed-${courseId}`
      });
      setCourseCompletionTrigger(count => count + 1);
    }
    
    setCourseData(prevCourseData => ({
      ...prevCourseData!,
      progressPercentage: newProgressPercentage
    }));
  }, [docProgress, quizProgress, courseData?.progressPercentage, courseId]);

// REPLACE the quiz completion useEffect with this version that bypasses ALL caching

useEffect(() => {
  if (location.state?.quizCompleted && courseId && !hasProcessedQuizCompletion) {
    const { quizId, attemptId } = location.state;
    
    const refreshCourseData = async (retryCount = 0) => {
      try {
        // Add delay for backend processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`🚀 DIRECT API CALL (attempt ${retryCount + 1}) - BYPASSING ALL CACHE`);
        
        // DIRECT API CALL - BYPASS ALL CACHING MECHANISMS
        const authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const baseURL = window.location.origin;
        const apiEndpoint = `${baseURL}/api/LearnerCourses/${courseId}?_t=${Date.now()}&nocache=true`;
        
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
        
        // Check if quiz completion is reflected in the fresh data
        const targetLesson = updatedCourse.lessons?.find(lesson => lesson.quizId === quizId);
        const isQuizMarkedComplete = targetLesson?.isQuizCompleted;
        
        console.log(`📊 Quiz ${quizId} completion in DIRECT API:`, isQuizMarkedComplete);
        
        // If still not updated and we haven't retried much, try again
        if (!isQuizMarkedComplete && retryCount < 2) {
          console.log(`⏳ Backend still processing, retrying in 2 seconds...`);
          setTimeout(() => refreshCourseData(retryCount + 1), 2000);
          return;
        }
        
        // Update all state with the fresh data
        setCourseData(updatedCourse);
        
        const updatedDocs: Record<number, ProgressItem> = {};
        const updatedQuizzes: Record<number, boolean> = {};

        updatedCourse.lessons.forEach(lesson => {
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
        
        // Force immediate progress calculation
        let totalItems = 0;
        let completedItems = 0;
        
        updatedCourse.lessons.forEach(lesson => {
          totalItems += lesson.documents.length + (lesson.hasQuiz ? 1 : 0);
          completedItems += lesson.documents.filter(doc => doc.isCompleted).length;
          if (lesson.quizId && lesson.isQuizCompleted) {
            completedItems++;
          }
        });
        
        const newProgressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        console.log(`📈 DIRECT API PROGRESS: ${completedItems}/${totalItems} = ${newProgressPercentage}%`);
        
        // Update progress immediately
        setCourseData(prev => ({
          ...prev!,
          progressPercentage: newProgressPercentage
        }));
        
        // Show toast only if not coming from quiz results and first attempt
        if (!attemptId && retryCount === 0) {
          toast.success("Quiz completed! Your progress has been updated.", {
            id: `quiz-completed-${quizId}`,
            duration: 3000
          });
        }
        
        console.log(`✅ SUCCESS: DIRECT API UPDATE COMPLETE`);
        
      } catch (error) {
        console.error('DIRECT API CALL FAILED:', error);
        
        // If direct API fails, at least force the local state
        console.log(`🆘 FORCING LOCAL STATE UPDATE for quiz ${quizId}`);
        setQuizProgress(prev => ({ ...prev, [quizId]: true }));
        
        // Calculate manual progress update
        if (courseData) {
          let totalItems = 0;
          let completedItems = 0;
          
          courseData.lessons.forEach(lesson => {
            totalItems += lesson.documents.length + (lesson.hasQuiz ? 1 : 0);
            completedItems += lesson.documents.filter(doc => docProgress[doc.id]?.isCompleted).length;
            if (lesson.quizId === quizId || quizProgress[lesson.quizId]) {
              completedItems++;
            }
          });
          
          const newProgressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          setCourseData(prev => ({
            ...prev!,
            progressPercentage: newProgressPercentage
          }));
          
          console.log(`🔧 MANUAL PROGRESS UPDATE: ${newProgressPercentage}%`);
        }
        
        // Show toast if not coming from quiz results
        if (!attemptId) {
          toast.success("Quiz completed! Your progress has been updated.", {
            id: `quiz-completed-${quizId}`,
            duration: 3000
          });
        }
      }
    };
    
    // Execute the refresh
    refreshCourseData();
    setHasProcessedQuizCompletion(true);
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, courseId, navigate, location.pathname, hasProcessedQuizCompletion, docProgress, quizProgress, courseData]);

  // Additional effect to ensure quiz button updates correctly
  useEffect(() => {
    // Force update quiz button states when quizProgress changes
    if (courseData && Object.keys(quizProgress).length > 0) {
      console.log(`🔄 Quiz progress updated:`, quizProgress);
    }
  }, [quizProgress, courseData]);

  const handleQuizAction = (lesson: LearnerLessonDto) => {
    if (!lesson.quizId) return;
    
    // Check both local state and backend state for quiz completion
    const isQuizDone = quizProgress[lesson.quizId] || lesson.isQuizCompleted;
    
    console.log(`🎯 Quiz ${lesson.quizId} status: local=${quizProgress[lesson.quizId]}, backend=${lesson.isQuizCompleted}, combined=${isQuizDone}`);

    if (isQuizDone && lesson.lastAttemptId) {
      navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { state: { courseId } });
    } else {
      navigate(`/learner/take-quiz/${lesson.quizId}`, { state: { courseId } });
    }
  };

  const handleMarkDocumentComplete = async (documentId: number) => {
    if (!courseId || docProgress[documentId]?.isCompleted || docProgress[documentId]?.isProcessing) return;

    setDocProgress(prev => ({ ...prev, [documentId]: { ...prev[documentId], isProcessing: true } }));
    try {
      const result = await markDocumentCompleted(documentId);
      setDocProgress(prev => ({ ...prev, [documentId]: { isCompleted: true, isProcessing: false } }));
      
      toast.success("Progress saved!", {
        id: `doc-completed-${documentId}`,
        duration: 2000
      });
      
      console.log(`✅ Document ${documentId} completed, course ${result.courseId} progress will refresh`);
    } catch (error) {
      console.error("Error marking document as complete:", error);
      toast.error("Failed to save progress. Please try again.");
      setDocProgress(prev => ({ ...prev, [documentId]: { ...prev[documentId], isCompleted: false, isProcessing: false } }));
    }
  };
  
  const handleGenerateCertificate = async () => {
    if (!courseData || !courseId || isGeneratingCertificate || isCertificateGenerated) return;
    
    if (courseData.progressPercentage < 100) {
      toast.error("You must complete 100% of the course to generate a certificate.");
      return;
    }
    
    setIsGeneratingCertificate(true);
    try {
      await generateCertificate(courseId);
      
      sessionStorage.setItem(`certificateGenerated_${courseId}`, 'true');
      setIsCertificateGenerated(true);

      try {
        const existingGensRaw = sessionStorage.getItem(CERTIFICATE_GEN_STORAGE_KEY);
        const existingGens = existingGensRaw ? JSON.parse(existingGensRaw) : [];
        
        const newGen = {
          courseId: courseId,
          courseTitle: courseData.title,
          generationTime: new Date().toISOString(),
        };

        const updatedGens = [newGen, ...existingGens].slice(0, 5);
        sessionStorage.setItem(CERTIFICATE_GEN_STORAGE_KEY, JSON.stringify(updatedGens));
      } catch (e) {
        console.error("Could not save certificate generation to session storage:", e);
      }
      
      toast.success("Certificate generated successfully!");
      navigate(`/learner/certificate`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      const axiosError = error as AxiosError<{ message?: string, data?: any }>;
      const serverMessage = axiosError.response?.data?.message || (typeof axiosError.response?.data === 'string' ? axiosError.response.data : null);
      toast.error(serverMessage || "Failed to generate certificate. An unknown error occurred.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleGoBack = () => {
    if (courseData?.category?.id) {
      navigate(`/learner/courses/${courseData.category.id}`);
    } else {
      navigate("/learner/course-categories");
    }
  };

  const toggleLessonExpand = (lessonId: number) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };
  
  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-white text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Course Details...
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
        <div className="text-white text-xl">Course not found.</div>
      </div>
    );
  }

  const isCourseCompleted = courseData.progressPercentage === 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <button onClick={handleGoBack} className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {courseData.isInactive && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">This Course is Currently Inactive</h3>
              <p className="text-sm">You can still view your progress and access content, but this course is no longer available for new enrollments.</p>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="mb-2">
                <span className="bg-[#34137C]/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {courseData.category.title || courseData.category.name}
                </span>
              </div>
            
              {courseData.thumbnailUrl ? (
                <img src={courseData.thumbnailUrl} alt={courseData.title} className="w-full h-48 object-cover rounded-xl shadow-lg" />
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
              <div className="flex flex-wrap gap-2 mb-4">
                {courseData.technologies.map(tech => (
                  <span key={tech.id} className="bg-[#34137C] text-white px-3 py-2 rounded-full text-sm">{tech.name}</span>
                ))}
              </div>
              <p className="text-gray-800 mb-4">{courseData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />Estimated time: {courseData.estimatedTime} hours</div>
                <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />Lessons: {courseData.totalLessons}</div>
                <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />Completed: {courseData.completedLessons}/{courseData.totalLessons}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-[#BF4BF6] font-semibold">Your Progress</h2>
            <span className="text-[#1B0A3F] font-semibold">{courseData.progressPercentage}%</span>
          </div>
          <div className="w-full border border-[#34137C] rounded-full h-4">
            <div className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]" style={{ width: `${courseData.progressPercentage}%` }}></div>
          </div>
          {isCourseCompleted && (
            <div className="mt-4 flex justify-end">
              <button onClick={handleGenerateCertificate} disabled={isGeneratingCertificate || isCertificateGenerated} className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed">
                {isGeneratingCertificate ? (<> ... Generating ... </>) : isCertificateGenerated ? (<> Certificate Generated </>) : (<> Generate Certificate </>)}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-c mb-6">Course Content</h2>
          <div className="space-y-4">
            {courseData.lessons.map((lesson) => {
              // Enhanced quiz status checking
              const localQuizStatus = lesson.quizId ? quizProgress[lesson.quizId] : false;
              const backendQuizStatus = lesson.isQuizCompleted;
              const isQuizCompleted = localQuizStatus || backendQuizStatus;
              
              return (
                <div key={lesson.id} className="border border-[#52007C] rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleLessonExpand(lesson.id)}>
                    <div className="flex items-center space-x-3 flex-1">
                      {expandedLessons[lesson.id] ? (<ArrowLeft className="text-[#BF4BF6] w-5 h-5 transform rotate-90" />) : (<ArrowLeft className="text-[#A845E8] w-5 h-5 transform -rotate-90" />)}
                      <div className="flex-1"><div className="flex items-center"><h3 className="text-[#1B0A3F] font-medium">{lesson.lessonName}</h3>{lesson.isCompleted && (<CheckCircle className="w-4 h-4 ml-2 text-green-500" />)}</div></div>
                    </div>
                  </div>
                  {expandedLessons[lesson.id] && (
                    <div className="p-4 pt-0 border-t border-[#BF4BF6]/20 space-y-4">
                      {lesson.documents && lesson.documents.length > 0 && (
                        <div>
                          <h4 className="text-[#BF4BF6] text-sm font-semibold my-2">Materials</h4>
                          <div className="space-y-2">
                            {lesson.documents.map((doc) => {
                              const status = docProgress[doc.id] || { isCompleted: false, isProcessing: false };
                              return (
                                <div key={doc.id} className="bg-[#34137C]/80 p-2 rounded-md flex justify-between items-center">
                                  <div className="flex items-center text-white text-sm">
                                    {doc.documentType === 'PDF' ? (<FileText className="w-4 h-4 mr-2" />) : (<PlayCircle className="w-4 h-4 mr-2" />)}
                                    <span>{doc.name}</span>
                                    {status.isCompleted && <CheckCircle className="w-4 h-4 ml-2 text-green-400" />}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {!status.isCompleted && (
                                      <button onClick={() => handleMarkDocumentComplete(doc.id)} disabled={status.isProcessing} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50 disabled:cursor-wait">
                                        {status.isProcessing ? "Saving..." : "Mark Complete"}
                                      </button>
                                    )}
                                    <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} className="text-white hover:text-[#D68BF9]"><Download className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {lesson.hasQuiz && lesson.quizId && (
                        <div>
                          <h4 className="text-[#BF4BF6] text-sm font-semibold my-2">Quiz Assessment</h4>
                          <div className="bg-[#34137C]/80 p-3 rounded-md">
                             <div className="flex justify-between items-center">
                              <div className="flex items-center text-white text-sm">
                                <List className="w-4 h-4 mr-2" /><span >Lesson Quiz</span>
                                {isQuizCompleted && (<span className="ml-2 text-green-400 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Completed</span>)}
                              </div>
                              <button onClick={() => handleQuizAction(lesson)} className="bg-[#BF4BF6] hover:bg-[#BF4BF6]/50 text-white text-xs py-1 px-3 rounded-full">
                                {isQuizCompleted ? 'View Result' : 'Start Quiz'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (<div className="text-gray-400 text-sm italic py-2">No content available for this lesson.</div>)}
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