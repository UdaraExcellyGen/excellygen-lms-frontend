// src/features/Learner/CourseContent/CourseOverview.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// FIXED: Added useLocation import
import { useLocation, useNavigate, useParams } from 'react-router-dom'; 
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  BookOpen, 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  Users, 
  ArrowLeft, 
  FileText, 
  BookCheck, 
  Search, 
  Award, 
  Layers 
} from 'lucide-react';

import Layout from '../../../components/Sidebar/Layout'; 
import VideoSearch from './VideoSearch'; 
import { VideoData, TranscriptSegment } from './VideoPlayer'; 

import { LearnerCourseDto, LearnerLessonDto, CourseDocumentDto } from '../../../types/course.types';
import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getQuizDetails as getQuizDetailsApi } from '../../../api/services/Course/quizService'; 
import { useAuth } from '../../../contexts/AuthContext'; 
import toast from 'react-hot-toast'; 

// Define simplified Material and Topic types for internal component state,
// mapping from LearnerCourseDto/LearnerLessonDto
interface CourseDisplayMaterial {
  id: number; // document ID
  title: string; // document name
  type: 'pdf' | 'video'; // documentType (from backend string)
  size: string; // formatted fileSize
  fileUrl?: string; // document url
  videoData?: VideoData; // For video materials (will be mocked/integrated later if real video storage)
}

interface CourseDisplayTopic {
  id: number; // lesson ID
  title: string; // lesson name
  description?: string; // lesson description (not directly on LessonDto, might omit or derive)
  materials: CourseDisplayMaterial[];
  hasQuiz: boolean;
  quizId?: number; // The actual quiz ID
  quizCompleted?: boolean; // Learner's quiz completion status for this lesson
  lessonCompleted?: boolean; // Learner's lesson content completion status
  lessonPoints: number; // Lesson points
}

interface CourseDisplayDetails {
  id: number;
  title: string;
  description: string;
  totalTopics: number; // Total number of lessons
  duration: string; // Estimated time (formatted)
  activeUsers: number; // Will be hardcoded/removed as not from backend
  progressPercentage: number; // Learner's overall course progress
  completedLessonsCount: number; // Learner's completed lessons count
}

const CourseOverview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ERROR WAS HERE - NOW FIXED
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

  const { user } = useAuth(); // Authenticated user

  const [courseDetails, setCourseDetails] = useState<CourseDisplayDetails | null>(null);
  const [topics, setTopics] = useState<CourseDisplayTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]); // Array of topic IDs (numbers) that are expanded
  
  const [isVideoSearchOpen, setIsVideoSearchOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);


  // --- Data Fetching ---
  const fetchCourseData = useCallback(async () => {
    if (!user?.id || !courseId) {
      setError("User not authenticated or course not specified."); // Show error for user/courseId missing
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const learnerCourseDto: LearnerCourseDto = await getLearnerCourseDetails(courseId);

      // Map LearnerCourseDto to CourseDisplayDetails
      const mappedCourseDetails: CourseDisplayDetails = {
        id: learnerCourseDto.id,
        title: learnerCourseDto.title,
        description: learnerCourseDto.description || '',
        totalTopics: learnerCourseDto.totalLessons, // Total lessons from backend
        duration: `${learnerCourseDto.estimatedTime} hours`, // Estimated time from backend
        activeUsers: 450, // Hardcoded for now as per original UI
        progressPercentage: learnerCourseDto.progressPercentage,
        completedLessonsCount: learnerCourseDto.completedLessons,
      };
      setCourseDetails(mappedCourseDetails);

      // Map LearnerLessonDto[] to CourseDisplayTopic[]
      const mappedTopics: CourseDisplayTopic[] = learnerCourseDto.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.lessonName,
        description: `Lesson on ${lesson.lessonName}`, // Simplified description if not available
        materials: lesson.documents.map(doc => ({
          id: doc.id,
          title: doc.name,
          type: doc.documentType.toLowerCase() === 'pdf' ? 'pdf' : 'video', // Assuming only PDF and other as video for type
          size: `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Format size
          fileUrl: doc.fileUrl,
          // completion status will be derived from lessonCompleted on the topic level
          // videoData will be populated dynamically if needed or mocked for now
        })),
        hasQuiz: lesson.hasQuiz,
        quizId: lesson.quizId,
        quizCompleted: lesson.isQuizCompleted,
        lessonCompleted: lesson.isCompleted, // Direct content completion from backend
        lessonPoints: lesson.lessonPoints,
      }));
      setTopics(mappedTopics);

      // Expand all topics by default on load
      setExpandedTopics(mappedTopics.map(topic => topic.id));

    } catch (err: any) {
      console.error("Failed to fetch learner course details:", err);
      setError(err.response?.data?.message || "Failed to load course details.");
      toast.error(err.response?.data?.message || "Failed to load course details.");
      // Navigate away only if it's a critical error like course not found
      navigate('/learner/course-content'); 
    } finally {
      setLoading(false);
    }
  }, [user?.id, courseId, navigate]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // --- UI Toggles ---
  const toggleTopic = (topicId: number) => { // Now takes number ID
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const openVideoSearch = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setIsVideoSearchOpen(true);
  };
  
  const closeVideoSearch = () => {
    setIsVideoSearchOpen(false);
    if (previousFocusRef.current) {
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 0);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isVideoSearchOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isVideoSearchOpen]);


  // --- Material/Lesson/Quiz Interaction Handlers ---

  // For marking lesson content as completed
  const handleMarkLessonContentCompleted = async (lessonId: number) => {
    if (!user?.id || !courseDetails) return;
    setIsMarkingComplete(true);
    const toastId = toast.loading("Updating lesson progress...");
    try {
      const updatedProgress = await markLessonCompleted(lessonId);
      // Update local state based on API response
      setTopics(prevTopics => prevTopics.map(topic =>
        topic.id === lessonId ? { ...topic, lessonCompleted: updatedProgress.isCompleted } : topic
      ));
      // Re-fetch course details to update overall progress percentage accurately
      await fetchCourseData(); 
      toast.success(`Lesson "${updatedProgress.lessonName}" marked as complete!`, { id: toastId });
    } catch (err: any) {
      console.error("Failed to mark lesson complete:", err);
      toast.error(err.response?.data?.message || "Failed to mark lesson complete.", { id: toastId });
    } finally {
      setIsMarkingComplete(false);
    }
  };


  const handleMaterialClick = (material: CourseDisplayMaterial) => {
    if (material.type === 'video' && material.videoData?.videoUrl) {
      // Navigate to the VideoPlayer component with courseId and videoId from the URL
      // Assuming VideoPlayer will fetch its own data based on videoId and courseId if needed
      navigate(`/learner/video/${courseId}/${material.id}`); // Example: /learner/video/COURSE_ID/VIDEO_ID
    } else if (material.type === 'pdf' && material.fileUrl) {
      // Handle PDF or other material types by opening the URL
      window.open(material.fileUrl, '_blank');
    } else {
      toast.error("Material cannot be opened.");
      console.warn("Attempted to open material with missing URL or videoData:", material);
    }
  };

  const handleStartQuiz = (quizId: number) => {
    if (!user?.id) {
        toast.error("You must be logged in to start a quiz.");
        return;
    }
    navigate(`/learner/take-quiz/${quizId}`); // Navigate to quiz page
  };


  const handleBack = () => {
    navigate(-1); // Go back to previous page (CourseContent)
  };
  
  const handleDownloadCertificate = async () => {
    if (!user?.id || !courseDetails?.id) {
      toast.error("User or Course ID missing for certificate generation.");
      return;
    }
    if (courseDetails.progressPercentage !== 100) {
      toast.error("Course must be 100% complete to generate a certificate.");
      return;
    }

    setIsGeneratingCertificate(true);
    const toastId = toast.loading("Generating certificate...");
    try {
        const certificate = await generateCertificate(courseDetails.id);
        toast.success("Certificate generated successfully!", { id: toastId });
        // Optionally, redirect to certificate view or show a link
        if (certificate.certificateFileUrl) {
            window.open(certificate.certificateFileUrl, '_blank');
        } else {
            toast.error("Generated certificate URL is missing.");
        }
    } catch (err: any) {
        console.error("Failed to generate certificate:", err);
        toast.error(err.response?.data?.message || "Failed to generate certificate.", { id: toastId });
    } finally {
        setIsGeneratingCertificate(false);
    }
  };

  // Determine if the certificate button should be enabled
  const isCertificateButtonEnabled = useMemo(() => {
    return courseDetails?.progressPercentage === 100;
  }, [courseDetails?.progressPercentage]);


  if (loading || !courseDetails) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center">
          <div className="text-white text-xl flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Course Details...
          </div>
        </div>
      </Layout>
    );
  }

  // Error display
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center">
          <div className="bg-red-800 text-white p-4 rounded-lg shadow-lg">
            <p className="text-xl font-bold">Error Loading Course</p>
            <p className="mt-2">{error}</p>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700">Go Back</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
          {/* Back Button & Header */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors font-nunito"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Course Content
            </button>
            
            {/* Improved Video Search Button with proper ARIA */}
            <button
              onClick={openVideoSearch}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg 
                       text-[#D68BF9] hover:bg-white/20 transition-all duration-300"
              aria-haspopup="dialog"
              aria-expanded={isVideoSearchOpen}
            >
              <Search className="w-5 h-5" />
              <span className="font-nunito">Search Videos</span>
            </button>
          </div>

          {/* Header Section - No Card */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold font-unbounded mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
              {courseDetails.title}
            </h2>
            <p className="text-[#D68BF9] text-lg max-w-2xl leading-relaxed font-nunito">
              {courseDetails.description}
            </p>
          </div>

          {/* Course Stats - White Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: BookOpen, label: 'Total Topics', value: courseDetails.totalTopics },
              { icon: Clock, label: 'Duration', value: courseDetails.duration },
              { icon: Users, label: 'Active Learners', value: courseDetails.activeUsers }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:border-[#BF4BF6]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8]">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#52007C] font-nunito font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1B0A3F] mt-1 font-unbounded">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar - White Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <BookCheck className="w-5 h-5 text-[#52007C]" />
                <span className="text-[#1B0A3F] font-medium font-nunito">Course Progress</span>
              </div>
              <span className="text-[#52007C] font-nunito">
                {courseDetails.completedLessonsCount}/{courseDetails.totalTopics} Lessons Completed
              </span>
            </div>
            <div className="h-2 bg-[#F6E6FF] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] transition-all duration-300"
                style={{ width: `${courseDetails.progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={courseDetails.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Topics Accordion - Dark Glass Cards */}
          <div className="space-y-4">
            {topics.length === 0 ? (
                <p className="text-gray-300 text-center py-8">No lessons available for this course.</p>
            ) : (
                topics.map(topic => (
                  <div 
                    key={topic.id} 
                    className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-[#BF4BF6]/5 transition-colors"
                      aria-expanded={expandedTopics.includes(topic.id)}
                      aria-controls={`topic-content-${topic.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center relative font-nunito">
                          {/* Display topic ID if available, otherwise just a placeholder or sequence number */}
                          <span className="text-white">{topic.id}</span> 
                          {topic.lessonCompleted && topic.quizCompleted && ( // Check if both content and quiz are done
                            <div 
                              className="absolute -top-1 -right-1 bg-emerald-400 rounded-full w-3 h-3" 
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="font-unbounded font-bold">{topic.title}</h3>
                          <p className="text-sm text-[#D68BF9] font-nunito">{topic.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {topic.lessonCompleted && topic.quizCompleted && (
                          <span className="text-sm text-emerald-400 font-nunito">Completed</span>
                        )}
                        <ChevronDown 
                          className={`w-5 h-5 transform transition-transform ${
                            expandedTopics.includes(topic.id) ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>

                    {expandedTopics.includes(topic.id) && (
                      <div 
                        id={`topic-content-${topic.id}`}
                        className="px-6 py-4 space-y-3 border-t border-[#BF4BF6]/20"
                      >
                        {topic.materials.map(material => (
                          <div 
                            key={material.id} // Material ID (document ID)
                            className="bg-[#1B0A3F]/60 rounded-lg p-4 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300"
                          >
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => handleMaterialClick(material)}
                              tabIndex={0}
                              role="button"
                              aria-label={`Open ${material.title}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleMaterialClick(material);
                                }
                              }}
                            >
                              {material.type === 'pdf' ? (
                                <FileText className="w-5 h-5 mr-3 text-red-400" aria-hidden="true" />
                              ) : (
                                <PlayCircle className="w-5 h-5 mr-3 text-blue-400" aria-hidden="true" />
                              )}
                              <div>
                                <p className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito">
                                  {material.title}
                                </p>
                                <p className="text-sm text-[#D68BF9]/60 font-nunito">{material.size}</p>
                              </div>
                            </div>

                            {/* Check lessonCompleted status directly from topic */}
                            {topic.lessonCompleted ? (
                              <span className="bg-[#BF4BF6]/20 text-[#D68BF9] px-4 py-2 rounded-lg flex items-center font-nunito backdrop-blur-sm">
                                <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                                Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkLessonContentCompleted(topic.id)} // Mark the whole lesson as complete
                                className="bg-[#BF4BF6]/20 text-[#D68BF9] px-4 py-2 rounded-lg hover:bg-[#BF4BF6]/30 transition-all duration-300 font-nunito backdrop-blur-sm"
                                disabled={isMarkingComplete}
                              >
                                {isMarkingComplete ? 'Marking...' : 'Mark as Completed'}
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* Quiz Section */}
                        {topic.hasQuiz && (
                          <div className="bg-[#1B0A3F]/60 rounded-lg p-4 flex items-center justify-between group hover:bg-[#1B0A3F]/80 transition-all duration-300">
                            <div className="flex items-center">
                              <BookCheck className="w-5 h-5 mr-3 text-[#D68BF9]" aria-hidden="true" />
                              <div>
                                <p className="text-white group-hover:text-[#D68BF9] transition-colors font-nunito">
                                  Topic {topic.id} Quiz
                                </p>
                                <p className="text-sm text-[#D68BF9]/60 font-nunito">Test your knowledge</p>
                              </div>
                            </div>
                            {topic.quizCompleted ? (
                              <span className="bg-[#BF4BF6]/20 text-[#D68BF9] px-4 py-2 rounded-lg flex items-center font-nunito backdrop-blur-sm">
                                <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                                Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => topic.quizId && handleStartQuiz(topic.quizId)}
                                className="px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] hover:from-[#D68BF9] hover:to-[#BF4BF6] text-white rounded-lg transition-all duration-300 font-nunito shadow-lg hover:shadow-[#BF4BF6]/25 hover:-translate-y-0.5"
                              >
                                Start Quiz
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
          
          {/* Certificate Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleDownloadCertificate}
              disabled={!isCertificateButtonEnabled || isGeneratingCertificate}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-lg font-nunito font-bold text-lg
                ${isCertificateButtonEnabled 
                  ? 'bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white shadow-lg hover:shadow-[#BF4BF6]/25 hover:-translate-y-0.5 transition-all duration-300' // Your original color
                  : 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-disabled={!isCertificateButtonEnabled}
            >
              <Award className="w-6 h-6" />
              {isGeneratingCertificate ? 'Generating...' : 'Get Your Certificate'}
            </button>
          </div>
          
          {/* Info message about certificate requirements */}
          {!isCertificateButtonEnabled && (
            <p className="text-center text-[#D68BF9]/60 mt-4 font-nunito">
              Complete all lessons and quizzes to unlock your certificate
            </p>
          )}
        </div>
      </div>

      {/* Video Search Modal - Using React Portal for better accessibility */}
      {isVideoSearchOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 overflow-hidden"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with optimized blur effect */}
          <div 
            className="absolute inset-0 backdrop-blur-md bg-black/50 transition-all duration-300"
            onClick={closeVideoSearch}
            aria-hidden="true"
          />
          
          {/* Modal container with proper positioning */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-full max-w-6xl max-h-[90vh] m-4 pointer-events-auto transform transition-all duration-300 ease-out"
              id="modal-title"
            >
              <VideoSearch 
                onClose={closeVideoSearch} 
                // No isOpen prop for VideoSearch as it's controlled by being mounted
                // isOpen={isVideoSearchOpen} 
              />
            </div>
          </div>
        </div>,
        document.body // Portal to body element for better stacking context
      )}
    </Layout>
  );
};

export default CourseOverview;