// src/features/Learner/CourseContent/LearnerCourseOverview.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
import { QuizDto } from '../../../types/quiz.types';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';
import { logCourseAccess } from '../../../api/services/Course/courseAccessService'; // 1. IMPORT THE NEW SERVICE

const LearnerCourseOverview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const course = await getLearnerCourseDetails(courseId);
        
        // Initialize expanded state for lessons
        const initialExpandedState: Record<number, boolean> = {};
        course.lessons.forEach(lesson => {
          initialExpandedState[lesson.id] = false; // Initially collapsed
        });
        
        setCourseData(course);
        setExpandedLessons(initialExpandedState);

        // 2. LOG THE COURSE ACCESS ONCE DETAILS ARE SUCCESSFULLY LOADED
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

    fetchCourseDetails();
  }, [courseId, navigate]);

const handleGoBack = () => {
  if (courseData && courseData.category && courseData.category.id) {
    navigate(`/learner/courses/${courseData.category.id}`);
  } else {
    // Fallback if category ID is not available
    navigate("/learner/course-categories");
  }
};

  const toggleLessonExpand = (lessonId: number) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleMarkLessonComplete = async (lessonId: number) => {
    // Check if we're already processing this lesson
    if (isMarkingComplete[lessonId]) return;
    
    // Update the marking state for this specific lesson
    setIsMarkingComplete(prev => ({
      ...prev,
      [lessonId]: true
    }));
    
    try {
      await markLessonCompleted(lessonId);
      
      // Update the local state
      setCourseData(prev => {
        if (!prev) return null;
        
        const updatedLessons = prev.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
        );
        
        // Calculate new progress
        const totalLessons = updatedLessons.length;
        const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        
        return {
          ...prev,
          lessons: updatedLessons,
          completedLessons,
          progressPercentage
        };
      });
      
      toast.success("Lesson marked as completed!");
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast.error("Failed to mark lesson as completed.");
    } finally {
      // Clear the marking state for this lesson
      setIsMarkingComplete(prev => ({
        ...prev,
        [lessonId]: false
      }));
    }
  };

  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStartQuiz = (quizId: number) => {
    // Pass courseId in navigation state so it can be used in quiz results
    navigate(`/learner/take-quiz/${quizId}`, { 
      state: { courseId: courseId } 
    });
  };

  const handleGenerateCertificate = async () => {
    if (!courseData || !courseId || isGeneratingCertificate) return;
    
    // Check if course is 100% complete
    if (courseData.progressPercentage < 100) {
      toast.error("You must complete 100% of the course to generate a certificate.");
      return;
    }
    
    setIsGeneratingCertificate(true);
    try {
      const certificate = await generateCertificate(courseId);
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
        <button
          onClick={handleGoBack}
          className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {courseData.thumbnailUrl ? (
                <img 
                  src={courseData.thumbnailUrl} 
                  alt={courseData.title} 
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-[#D68BF9]" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
                  {courseData.category.title}
                </span>
                {courseData.technologies.map(tech => (
                  <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
                    {tech.name}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 mb-4">{courseData.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
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
                  Completed: {courseData.completedLessons}/{courseData.totalLessons}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-white font-semibold">Your Progress</h2>
            <span className="text-white">{courseData.progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-[#34137C] rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                isCourseCompleted 
                  ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]' 
                  : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]'
              }`}
              style={{ width: `${courseData.progressPercentage}%` }}
            ></div>
          </div>
          
          {isCourseCompleted && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerateCertificate}
                disabled={isGeneratingCertificate}
                className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                {isGeneratingCertificate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
          
          <div className="space-y-4">
            {courseData.lessons.map((lesson) => (
              <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
                {/* Lesson Header */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleLessonExpand(lesson.id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {expandedLessons[lesson.id] ? (
                      <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
                    ) : (
                      <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-white font-medium">{lesson.lessonName}</h3>
                        {lesson.isCompleted && (
                          <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {!lesson.isCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkLessonComplete(lesson.id);
                      }}
                      disabled={isMarkingComplete[lesson.id]}
                      className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
                    >
                      {isMarkingComplete[lesson.id] ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Marking...
                        </span>
                      ) : "Mark Complete"}
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                {expandedLessons[lesson.id] && (
                  <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
                    {/* Documents Section */}
                    {lesson.documents && lesson.documents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
                        <div className="space-y-2">
                          {lesson.documents.map((doc) => (
                            <div 
                              key={doc.id} 
                              className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                {doc.documentType === 'PDF' ? (
                                  <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />
                                )}
                                <span className="text-white text-sm">{doc.name}</span>
                              </div>
                              <button 
                                onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
                                className="text-[#D68BF9] hover:text-white"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quiz Section */}
                    {lesson.hasQuiz && (
                      <div>
                        <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
                        <div className="bg-[#34137C]/50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <List className="w-4 h-4 text-[#D68BF9] mr-2" />
                              <span className="text-white text-sm">Lesson Quiz</span>
                              {lesson.isQuizCompleted && (
                                <span className="ml-2 text-green-500 text-xs flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => lesson.quizId && handleStartQuiz(lesson.quizId)}
                              className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
                            >
                              {lesson.isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Content Message */}
                    {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
                      <div className="text-gray-400 text-sm italic">
                        No content available for this lesson.
                      </div>
                    )}
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