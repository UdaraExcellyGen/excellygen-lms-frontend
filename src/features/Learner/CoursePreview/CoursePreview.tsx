// src/features/Learner/CoursePreview/CoursePreview.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, Clock, FileText, PlayCircle, AlertTriangle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto } from '../../../types/course.types';
import { getCoursePreview } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment } from '../../../api/services/Course/enrollmentService';

const CoursePreview: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        
        // Use new course preview API that includes lesson names
        const course = await getCoursePreview(courseId);
        
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
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
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
              <h1 className="text-2xl font-bold text-[#1B0A3F] mb-3 font-nunito">{courseData.title}</h1>
              <div className="flex items-center text-[#52007C] text-sm mb-4">
                <User className="w-4 h-4 mr-2 text-[#BF4BF6]" />
                <span className="font-medium font-nunito">Created by {courseData.creator?.name || 'ExcellyGen Team'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {courseData.technologies.map(tech => (
                  <span key={tech.id} className="bg-[#F6E6FF] text-[#52007C] px-3 py-2 rounded-full text-sm font-medium font-nunito">{tech.name}</span>
                ))}
              </div>
              <p className="text-[#52007C] mb-4 leading-relaxed font-nunito">{courseData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-[#52007C] mb-4">
                <div className="flex items-center font-nunito"><Clock className="w-4 h-4 mr-2 text-[#BF4BF6]" />Estimated time: {courseData.estimatedTime} hours</div>
                <div className="flex items-center font-nunito"><BookOpen className="w-4 h-4 mr-2 text-[#BF4BF6]" />Lessons: {courseData.totalLessons || courseData.lessons?.length || 0}</div>
                <div className="flex items-center font-nunito"><User className="w-4 h-4 mr-2 text-[#BF4BF6]" />Enrolled Students: {courseData.activeLearnersCount || 0}</div>
              </div>
              
              
              
            </div>
          </div>
        </div>

        {/* Course Subtopics Preview */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
          <h2 className="text-xl font-bold text-[#1B0A3F] mb-6 font-nunito">
            Course Subtopics ({courseData.lessons?.length || courseData.totalLessons || 0} Lessons)
          </h2>
          
          {/* Check if we have lessons data */}
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
            /* Show message when no lessons data available */
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
          
          {/* Enrollment CTA at bottom */}
          {!courseData.isInactive && (
            <div className="mt-6 pt-6 border-t border-[#BF4BF6]/20 text-center">
              <p className="text-[#52007C] mb-4 font-nunito">Ready to start learning? Enroll now to access all lessons and track your progress!</p>
              <button 
                onClick={handleEnrollNow}
                disabled={isEnrolling}
                className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed font-nunito"
              >
                {isEnrolling ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enrolling...
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