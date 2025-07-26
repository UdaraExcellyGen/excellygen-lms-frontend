// src/features/Learner/CoursePreview/CoursePreview.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, CheckCircle, List, Clock, FileText, PlayCircle, AlertTriangle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto } from '../../../types/course.types';
import { getAvailableCoursesForLearner } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment } from '../../../api/services/Course/enrollmentService';

const CoursePreview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Main data fetching effect
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }

    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        
        // FIXED: Use available courses endpoint to find the course
        const availableCourses = await getAvailableCoursesForLearner();
        const course = availableCourses.find(c => c.id === courseId);
        
        if (!course) {
          throw new Error("Course not found or you may already be enrolled");
        }
        
        // Initialize expanded lessons state
        const initialExpanded: Record<number, boolean> = {};
        course.lessons.forEach(lesson => {
          initialExpanded[lesson.id] = false;
        });
        
        setCourseData(course);
        setExpandedLessons(initialExpanded);

      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details. You may already be enrolled in this course.");
        navigate("/learner/course-categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const handleEnrollNow = async () => {
    if (!courseData || isEnrolling) return;
    
    setIsEnrolling(true);
    try {
      await createEnrollment(courseData.id);
      toast.success(`Successfully enrolled in "${courseData.title}"!`);
      // Navigate to the actual course view after enrollment
      navigate(`/learner/course-view/${courseData.id}`);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(`Failed to enroll: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsEnrolling(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito p-6 flex justify-center items-center">
        <div className="text-white text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Course Preview...
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito p-6 flex justify-center items-center">
        <div className="text-white text-xl">Course not found or you may already be enrolled.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <button onClick={handleGoBack} className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {/* Preview Mode Banner */}
        <div className="bg-blue-500/20 border-2 border-blue-500 text-blue-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
          <Eye className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Course Preview Mode</h3>
            <p className="text-sm">You're viewing this course in preview mode. Enroll to access lessons and track your progress.</p>
          </div>
        </div>

        {courseData.isInactive && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-200 p-4 rounded-xl flex items-center gap-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">This Course is Currently Inactive</h3>
              <p className="text-sm">This course is no longer available for new enrollments.</p>
            </div>
          </div>
        )}

        {/* Course Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="mb-2">
                <span className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white px-3 py-1 rounded-lg text-sm font-semibold">
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
              <div className="flex items-center text-[#52007C] text-sm mb-4">
                <User className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                <span className="font-medium">Created by {courseData.creator?.name || 'ExcellyGen Team'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {courseData.technologies.map(tech => (
                  <span key={tech.id} className="bg-[#F6E6FF] text-[#52007C] px-3 py-2 rounded-full text-sm font-medium">{tech.name}</span>
                ))}
              </div>
              <p className="text-[#52007C] mb-4 leading-relaxed">{courseData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-[#52007C] mb-4">
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#BF4BF6]" />Estimated time: {courseData.estimatedTime} hours</div>
                <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-[#BF4BF6]" />Lessons: {courseData.totalLessons || courseData.lessons?.length || 0}</div>
                <div className="flex items-center"><User className="w-4 h-4 mr-2 text-[#BF4BF6]" />Enrolled Students: {courseData.activeLearnersCount || 0}</div>
              </div>
              
              {/* Enrollment Button */}
              {!courseData.isInactive && (
                <button 
                  onClick={handleEnrollNow}
                  disabled={isEnrolling}
                  className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </div>
                  ) : (
                    'Enroll in This Course'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Content Preview */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg">
          <h2 className="text-xl font-bold text-[#1B0A3F] mb-6">Course Content Preview</h2>
          <div className="space-y-4">
            {courseData.lessons.map((lesson, index) => (
              <div key={lesson.id} className="border border-[#BF4BF6]/30 rounded-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center cursor-pointer bg-[#F6E6FF]/20 hover:bg-[#F6E6FF]/40 transition-all duration-200" onClick={() => toggleLessonExpand(lesson.id)}>
                  <div className="flex items-center space-x-3 flex-1">
                    {expandedLessons[lesson.id] ? (
                      <ArrowLeft className="text-[#BF4BF6] w-5 h-5 transform rotate-90 transition-transform duration-200" />
                    ) : (
                      <ArrowLeft className="text-[#52007C] w-5 h-5 transform -rotate-90 transition-transform duration-200" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white px-2 py-1 rounded text-xs mr-3 font-semibold">
                          {index + 1}
                        </span>
                        <h3 className="text-[#1B0A3F] font-semibold">{lesson.lessonName}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="text-[#52007C] text-sm font-medium">
                    {lesson.documents?.length || 0} materials
                    {lesson.hasQuiz && ' + Quiz'}
                  </div>
                </div>
                {expandedLessons[lesson.id] && (
                  <div className="p-4 pt-0 border-t border-[#BF4BF6]/20 space-y-4 bg-[#F6E6FF]/10">
                    {lesson.documents && lesson.documents.length > 0 && (
                      <div>
                        <h4 className="text-[#BF4BF6] text-sm font-semibold my-2">Materials</h4>
                        <div className="space-y-2">
                          {lesson.documents.map((doc) => (
                            <div key={doc.id} className="bg-[#34137C]/80 p-3 rounded-md flex justify-between items-center">
                              <div className="flex items-center text-white text-sm">
                                {doc.documentType === 'PDF' ? (
                                  <FileText className="w-4 h-4 mr-2" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                )}
                                <span className="font-medium">{doc.name}</span>
                              </div>
                              <div className="text-[#D68BF9] text-xs px-3 py-1 bg-[#1B0A3F]/50 rounded-full font-medium">
                                Preview Only
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {lesson.hasQuiz && (
                      <div>
                        <h4 className="text-[#BF4BF6] text-sm font-semibold my-2">Quiz Assessment</h4>
                        <div className="bg-[#34137C]/80 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-white text-sm">
                              <List className="w-4 h-4 mr-2" />
                              <span className="font-medium">Lesson Quiz</span>
                            </div>
                            <div className="text-[#D68BF9] text-xs px-3 py-1 bg-[#1B0A3F]/50 rounded-full font-medium">
                              Available After Enrollment
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
                      <div className="text-gray-400 text-sm italic py-2">No content preview available for this lesson.</div>
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

export default CoursePreview;