// src/features/Learner/CourseContent/LearnerCourseOverview.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen,User, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertCircle, Award, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';
import { logCourseAccess } from '../../../api/services/Course/courseAccessService';
import { useBadgeChecker } from '../../../hooks/useBadgeChecker';

const CERTIFICATE_GEN_STORAGE_KEY = 'recentCertificateGens';

const LearnerCourseOverview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

  const [courseCompletionTrigger, setCourseCompletionTrigger] = useState(0);
  useBadgeChecker(courseCompletionTrigger);

  // Centralized function to refetch data from the backend
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      const data = await getLearnerCourseDetails(courseId);
      setCourseData(data);
      
      if (Object.keys(expandedLessons).length === 0) {
        const initialExpandedState: Record<number, boolean> = {};
        data.lessons.forEach(lesson => {
          initialExpandedState[lesson.id] = false;
        });
        setExpandedLessons(initialExpandedState);
      }
    } catch (error) {
      if ((error as any).name !== 'CanceledError') {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details.");
      }
    }
  }, [courseId, expandedLessons]);

  // Effect 1: Handles the INITIAL data load for the component (from Code 2)
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const course = await getLearnerCourseDetails(courseId);
        
        const initialExpandedState: Record<number, boolean> = {};
        course.lessons.forEach(lesson => {
          initialExpandedState[lesson.id] = false;
        });
        
        setCourseData(course);
        setExpandedLessons(initialExpandedState);

        if (courseId) {
          logCourseAccess(courseId);
        }

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

  // Effect 2: Handles the MANUAL state update when returning from a quiz (from Code 2)
  useEffect(() => {
    if (location.state?.quizCompleted && courseData) {
      const { quizId, attemptId } = location.state;
      
      const lessonToUpdate = courseData.lessons.find(l => l.quizId === quizId);

      if (lessonToUpdate && !lessonToUpdate.isQuizCompleted) {
        const newCourseData = JSON.parse(JSON.stringify(courseData)) as LearnerCourseDto;
        const lessonInNewData = newCourseData.lessons.find(l => l.quizId === quizId)!;
        
        lessonInNewData.isQuizCompleted = true;
        lessonInNewData.lastAttemptId = attemptId;
        
        const hasDocuments = lessonInNewData.documents && lessonInNewData.documents.length > 0;
        if (!hasDocuments) {
          lessonInNewData.isCompleted = true;
          markLessonCompleted(lessonInNewData.id).catch(err => {
            console.error("Background sync for auto-completion failed:", err);
          });
          toast.success("Lesson completed automatically!");
        } else {
          toast.success("Quiz completed! Mark the lesson as complete when you're ready.");
        }
        
        const completedLessons = newCourseData.lessons.filter(l => l.isCompleted).length;
        newCourseData.completedLessons = completedLessons;
        newCourseData.progressPercentage = Math.round((completedLessons / newCourseData.totalLessons) * 100);
        setCourseData(newCourseData);
      }
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, courseData, navigate, location.pathname]);

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

  const handleMarkLessonComplete = async (lessonId: number) => {
    if (isMarkingComplete[lessonId]) return;
    
    const lesson = courseData?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.hasQuiz && !lesson.isQuizCompleted) {
      toast.error("Please complete the quiz for this lesson first.");
      return;
    }
    
    setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
    try {
      await markLessonCompleted(lessonId);
      
      let courseIsNowComplete = false;
      setCourseData(prev => {
        if (!prev) return null;
        
        const updatedLessons = prev.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l);
        const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
        const progressPercentage = Math.round((completedLessons / updatedLessons.length) * 100);
        
        if (progressPercentage === 100 && prev.progressPercentage < 100) {
          courseIsNowComplete = true;
        }
        
        return { ...prev, lessons: updatedLessons, completedLessons, progressPercentage };
      });
      
      if (courseIsNowComplete) {
        setCourseCompletionTrigger(count => count + 1);
      }
      
      toast.success("Lesson marked as completed!");
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast.error("Failed to mark lesson as completed.");
    } finally {
      setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleQuizAction = (lesson: LearnerLessonDto) => {
    if (!lesson.quizId) return;
    
    if (lesson.isQuizCompleted && lesson.lastAttemptId) {
      navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { state: { courseId } });
    } else {
      navigate(`/learner/take-quiz/${lesson.quizId}`, { state: { courseId } });
    }
  };

  // THIS IS THE MERGED AND CORRECTED FUNCTION
  const handleGenerateCertificate = async () => {
    if (!courseData || !courseId || isGeneratingCertificate) return;
    
    if (courseData.progressPercentage < 100) {
      toast.error("You must complete 100% of the course to generate a certificate.");
      return;
    }
    
    setIsGeneratingCertificate(true);
    try {
      await generateCertificate(courseId);
      
      // THIS IS THE CRITICAL LOGIC FROM CODE 1 TO LOG THE ACTIVITY
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
      toast.error("Failed to generate certificate.");
    } finally {
      setIsGeneratingCertificate(false);
    }
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

        {/* Course Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#34137C]/80 text-white px-3 py-1 rounded-lg text-sm">{courseData.category.title || courseData.category.name}</span>
                </div>
              {courseData.thumbnailUrl || courseData.thumbnailImagePath ? (
                <img src={courseData.thumbnailUrl || courseData.thumbnailImagePath} alt={courseData.title} className="w-full h-48 object-cover rounded-xl shadow-lg" />
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
                <span className="bg-[#34137C] text-white px-3 py-2 rounded-full text-sm">{courseData.category.title || courseData.category.name}</span>
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

        {/* Progress Bar */}
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
              <button onClick={handleGenerateCertificate} disabled={isGeneratingCertificate} className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium">
                {isGeneratingCertificate ? (
                  <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>
                ) : (
                  <><Award className="w-4 h-4 mr-2" />Generate Certificate</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-c mb-6">Course Content</h2>
          <div className="space-y-4">
            {courseData.lessons.map((lesson) => (
              <div key={lesson.id} className="border border-[#52007C] rounded-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleLessonExpand(lesson.id)}>
                  <div className="flex items-center space-x-3 flex-1">
                    {expandedLessons[lesson.id] ? (<ArrowLeft className="text-[#BF4BF6] w-5 h-5 transform rotate-90" />) : (<ArrowLeft className="text-[#A845E8] w-5 h-5 transform -rotate-90" />)}
                    <div className="flex-1"><div className="flex items-center"><h3 className="text-[#1B0A3F] font-medium">{lesson.lessonName}</h3>{lesson.isCompleted && (<CheckCircle className="w-4 h-4 ml-2 text-green-500" />)}</div></div>
                  </div>
                  {!lesson.isCompleted && (<button onClick={(e) => { e.stopPropagation(); handleMarkLessonComplete(lesson.id); }} disabled={isMarkingComplete[lesson.id]} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50">{isMarkingComplete[lesson.id] ? (<span className="flex items-center"><svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Marking...</span>) : "Mark Complete"}</button>)}
                </div>
                {expandedLessons[lesson.id] && (
                  <div className="p-4 pt-0 border-t border-[#BF4BF6]/20 space-y-4">
                    {lesson.documents && lesson.documents.length > 0 && (
                      <div>
                        <h4 className="text-[#BF4BF6] text-sm font-semibold mb-2">Materials</h4>
                        <div className="space-y-2">
                          {lesson.documents.map((doc) => (<div key={doc.id} className="bg-[#34137C]/80 p-2 rounded-md flex justify-between items-center"><div className="flex items-center">{doc.documentType === 'PDF' ? (<FileText className="w-4 h-4 text-white mr-2" />) : (<PlayCircle className="w-4 h-4 text-white mr-2" />)}<span className="text-white text-sm">{doc.name}</span></div><button onClick={() => handleDownloadDocument(doc.fileUrl || doc.filePath, doc.name)} className="text-white hover:text-[#D68BF9]"><Download className="w-4 h-4" /></button></div>))}
                        </div>
                      </div>
                    )}
                    {lesson.hasQuiz && (
                      <div>
                        <h4 className="text-[#BF4BF6] text-sm font-semibold mb-2">Quiz Assessment</h4>
                        <div className="bg-[#34137C]/80 p-3 rounded-md"><div className="flex justify-between items-center"><div className="flex items-center"><List className="w-4 h-4 text-white mr-2" /><span className="text-white text-sm">Lesson Quiz</span>{lesson.isQuizCompleted && (<span className="ml-2 text-green-500 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>)}</div><button onClick={() => handleQuizAction(lesson)} className="bg-[#BF4BF6] hover:bg-[#BF4BF6]/50 text-white text-xs py-1 px-3 rounded-full">{lesson.isQuizCompleted ? 'View Result' : 'Start Quiz'}</button></div></div>
                      </div>
                    )}
                    {(lesson.documents && lesson.documents.length > 0) && !lesson.isCompleted && (
                      <div className="mt-4 flex justify-end">
                        <button onClick={() => handleMarkLessonComplete(lesson.id)} disabled={lesson.isCompleted || isMarkingComplete[lesson.id]} className={`px-4 py-2 text-xs font-medium rounded-full flex items-center transition-all ${lesson.isCompleted ? 'bg-green-500/20 text-green-300 cursor-default' : 'bg-[#BF4BF6] hover:bg-[#D68BF9] text-white disabled:opacity-50'}`}>{lesson.isCompleted ? (<><CheckCircle className="w-4 h-4 mr-2" />Completed</>) : (isMarkingComplete[lesson.id] ? "Marking..." : "Mark as Completed")}</button>
                      </div>
                    )}
                    {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (<div className="text-gray-400 text-sm italic py-2">No content available for this lesson.</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseOverview;