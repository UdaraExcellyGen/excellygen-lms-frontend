// // // // // // src/features/Learner/CourseContent/LearnerCourseOverview.tsx
// // // // // import React, { useEffect, useState } from 'react';
// // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertCircle, Award } from 'lucide-react';
// // // // // import toast from 'react-hot-toast';

// // // // // import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// // // // // import { QuizDto } from '../../../types/quiz.types';
// // // // // import { generateCertificate } from '../../../api/services/Course/certificateService';
// // // // // import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// // // // // const LearnerCourseOverview: React.FC = () => {
// // // // //   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
// // // // //   const navigate = useNavigate();
// // // // //   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

// // // // //   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
// // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // //   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
// // // // //   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
// // // // //   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

// // // // //   useEffect(() => {
// // // // //     if (!courseId) {
// // // // //       toast.error("Course ID is missing.");
// // // // //       navigate("/learner/course-categories");
// // // // //       return;
// // // // //     }

// // // // //     const fetchCourseDetails = async () => {
// // // // //       try {
// // // // //         setIsLoading(true);
// // // // //         const course = await getLearnerCourseDetails(courseId);
        
// // // // //         // Initialize expanded state for lessons
// // // // //         const initialExpandedState: Record<number, boolean> = {};
// // // // //         course.lessons.forEach(lesson => {
// // // // //           initialExpandedState[lesson.id] = false; // Initially collapsed
// // // // //         });
        
// // // // //         setCourseData(course);
// // // // //         setExpandedLessons(initialExpandedState);
// // // // //       } catch (error) {
// // // // //         console.error("Error fetching course details:", error);
// // // // //         toast.error("Failed to load course details.");
// // // // //         navigate("/learner/course-categories");
// // // // //       } finally {
// // // // //         setIsLoading(false);
// // // // //       }
// // // // //     };

// // // // //     fetchCourseDetails();
// // // // //   }, [courseId, navigate]);

// // // // // const handleGoBack = () => {
// // // // //   if (courseData && courseData.category && courseData.category.id) {
// // // // //     navigate(`/learner/courses/${courseData.category.id}`);
// // // // //   } else {
// // // // //     // Fallback if category ID is not available
// // // // //     navigate("/learner/course-categories");
// // // // //   }
// // // // // };

// // // // //   const toggleLessonExpand = (lessonId: number) => {
// // // // //     setExpandedLessons(prev => ({
// // // // //       ...prev,
// // // // //       [lessonId]: !prev[lessonId]
// // // // //     }));
// // // // //   };

// // // // //   const handleMarkLessonComplete = async (lessonId: number) => {
// // // // //     // Check if we're already processing this lesson
// // // // //     if (isMarkingComplete[lessonId]) return;
    
// // // // //     // Update the marking state for this specific lesson
// // // // //     setIsMarkingComplete(prev => ({
// // // // //       ...prev,
// // // // //       [lessonId]: true
// // // // //     }));
    
// // // // //     try {
// // // // //       await markLessonCompleted(lessonId);
      
// // // // //       // Update the local state
// // // // //       setCourseData(prev => {
// // // // //         if (!prev) return null;
        
// // // // //         const updatedLessons = prev.lessons.map(lesson => 
// // // // //           lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
// // // // //         );
        
// // // // //         // Calculate new progress
// // // // //         const totalLessons = updatedLessons.length;
// // // // //         const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
// // // // //         const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        
// // // // //         return {
// // // // //           ...prev,
// // // // //           lessons: updatedLessons,
// // // // //           completedLessons,
// // // // //           progressPercentage
// // // // //         };
// // // // //       });
      
// // // // //       toast.success("Lesson marked as completed!");
// // // // //     } catch (error) {
// // // // //       console.error("Error marking lesson as completed:", error);
// // // // //       toast.error("Failed to mark lesson as completed.");
// // // // //     } finally {
// // // // //       // Clear the marking state for this lesson
// // // // //       setIsMarkingComplete(prev => ({
// // // // //         ...prev,
// // // // //         [lessonId]: false
// // // // //       }));
// // // // //     }
// // // // //   };

// // // // //   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
// // // // //     // Create a temporary anchor element
// // // // //     const a = document.createElement('a');
// // // // //     a.href = fileUrl;
// // // // //     a.download = fileName || 'document';
// // // // //     document.body.appendChild(a);
// // // // //     a.click();
// // // // //     document.body.removeChild(a);
// // // // //   };

// // // // //   const handleStartQuiz = (quizId: number) => {
// // // // //     // Pass courseId in navigation state so it can be used in quiz results
// // // // //     navigate(`/learner/take-quiz/${quizId}`, { 
// // // // //       state: { courseId: courseId } 
// // // // //     });
// // // // //   };

// // // // //   const handleGenerateCertificate = async () => {
// // // // //     if (!courseData || !courseId || isGeneratingCertificate) return;
    
// // // // //     // Check if course is 100% complete
// // // // //     if (courseData.progressPercentage < 100) {
// // // // //       toast.error("You must complete 100% of the course to generate a certificate.");
// // // // //       return;
// // // // //     }
    
// // // // //     setIsGeneratingCertificate(true);
// // // // //     try {
// // // // //       const certificate = await generateCertificate(courseId);
// // // // //       toast.success("Certificate generated successfully!");
// // // // //       navigate(`/learner/certificate`);
// // // // //     } catch (error) {
// // // // //       console.error("Error generating certificate:", error);
// // // // //       toast.error("Failed to generate certificate.");
// // // // //     } finally {
// // // // //       setIsGeneratingCertificate(false);
// // // // //     }
// // // // //   };

// // // // //   if (isLoading) {
// // // // //     return (
// // // // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // // // //         <div className="text-white text-xl flex items-center">
// // // // //           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // // // //             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // // // //             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // // // //           </svg>
// // // // //           Loading Course Details...
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (!courseData) {
// // // // //     return (
// // // // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // // // //         <div className="text-white text-xl">Course not found.</div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   const isCourseCompleted = courseData.progressPercentage === 100;

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
// // // // //       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
// // // // //         <button
// // // // //           onClick={handleGoBack}
// // // // //           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
// // // // //         >
// // // // //           <ArrowLeft className="w-4 h-4 mr-2" />
// // // // //           Back to Courses
// // // // //         </button>

// // // // //         {/* Course Header */}
// // // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // // // //             <div className="md:col-span-1">
// // // // //               {courseData.thumbnailUrl ? (
// // // // //                 <img 
// // // // //                   src={courseData.thumbnailUrl} 
// // // // //                   alt={courseData.title} 
// // // // //                   className="w-full h-48 object-cover rounded-xl shadow-lg"
// // // // //                 />
// // // // //               ) : (
// // // // //                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
// // // // //                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>
            
// // // // //             <div className="md:col-span-2">
// // // // //               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              
// // // // //               <div className="flex flex-wrap gap-2 mb-4">
// // // // //                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
// // // // //                   {courseData.category.title}
// // // // //                 </span>
// // // // //                 {courseData.technologies.map(tech => (
// // // // //                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
// // // // //                     {tech.name}
// // // // //                   </span>
// // // // //                 ))}
// // // // //               </div>
              
// // // // //               <p className="text-gray-300 mb-4">{courseData.description}</p>
              
// // // // //               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
// // // // //                 <div className="flex items-center">
// // // // //                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // // //                   Estimated time: {courseData.estimatedTime} hours
// // // // //                 </div>
// // // // //                 <div className="flex items-center">
// // // // //                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // // //                   Lessons: {courseData.totalLessons}
// // // // //                 </div>
// // // // //                 <div className="flex items-center">
// // // // //                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // // //                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Progress Bar */}
// // // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // // //           <div className="mb-2 flex justify-between items-center">
// // // // //             <h2 className="text-white font-semibold">Your Progress</h2>
// // // // //             <span className="text-white">{courseData.progressPercentage}%</span>
// // // // //           </div>
          
// // // // //           <div className="w-full bg-[#34137C] rounded-full h-4">
// // // // //             <div 
// // // // //               className={`h-4 rounded-full transition-all duration-500 ${
// // // // //                 isCourseCompleted 
// // // // //                   ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]' 
// // // // //                   : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]'
// // // // //               }`}
// // // // //               style={{ width: `${courseData.progressPercentage}%` }}
// // // // //             ></div>
// // // // //           </div>
          
// // // // //           {isCourseCompleted && (
// // // // //             <div className="mt-4 flex justify-end">
// // // // //               <button
// // // // //                 onClick={handleGenerateCertificate}
// // // // //                 disabled={isGeneratingCertificate}
// // // // //                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
// // // // //               >
// // // // //                 {isGeneratingCertificate ? (
// // // // //                   <>
// // // // //                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // // // //                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // // // //                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // // // //                     </svg>
// // // // //                     Generating...
// // // // //                   </>
// // // // //                 ) : (
// // // // //                   <>
// // // // //                     <Award className="w-4 h-4 mr-2" />
// // // // //                     Generate Certificate
// // // // //                   </>
// // // // //                 )}
// // // // //               </button>
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //         {/* Course Content */}
// // // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // // //           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
          
// // // // //           <div className="space-y-4">
// // // // //             {courseData.lessons.map((lesson) => (
// // // // //               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
// // // // //                 {/* Lesson Header */}
// // // // //                 <div 
// // // // //                   className="p-4 flex justify-between items-center cursor-pointer"
// // // // //                   onClick={() => toggleLessonExpand(lesson.id)}
// // // // //                 >
// // // // //                   <div className="flex items-center space-x-3 flex-1">
// // // // //                     {expandedLessons[lesson.id] ? (
// // // // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
// // // // //                     ) : (
// // // // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
// // // // //                     )}
                    
// // // // //                     <div className="flex-1">
// // // // //                       <div className="flex items-center">
// // // // //                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
// // // // //                         {lesson.isCompleted && (
// // // // //                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
// // // // //                         )}
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   {!lesson.isCompleted && (
// // // // //                     <button
// // // // //                       onClick={(e) => {
// // // // //                         e.stopPropagation();
// // // // //                         handleMarkLessonComplete(lesson.id);
// // // // //                       }}
// // // // //                       disabled={isMarkingComplete[lesson.id]}
// // // // //                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
// // // // //                     >
// // // // //                       {isMarkingComplete[lesson.id] ? (
// // // // //                         <span className="flex items-center">
// // // // //                           <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // // // //                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // // // //                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // // // //                           </svg>
// // // // //                           Marking...
// // // // //                         </span>
// // // // //                       ) : "Mark Complete"}
// // // // //                     </button>
// // // // //                   )}
// // // // //                 </div>

// // // // //                 {/* Expanded Content */}
// // // // //                 {expandedLessons[lesson.id] && (
// // // // //                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
// // // // //                     {/* Documents Section */}
// // // // //                     {lesson.documents && lesson.documents.length > 0 && (
// // // // //                       <div className="mb-4">
// // // // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
// // // // //                         <div className="space-y-2">
// // // // //                           {lesson.documents.map((doc) => (
// // // // //                             <div 
// // // // //                               key={doc.id} 
// // // // //                               className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center"
// // // // //                             >
// // // // //                               <div className="flex items-center">
// // // // //                                 {doc.documentType === 'PDF' ? (
// // // // //                                   <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
// // // // //                                 ) : (
// // // // //                                   <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />
// // // // //                                 )}
// // // // //                                 <span className="text-white text-sm">{doc.name}</span>
// // // // //                               </div>
// // // // //                               <button 
// // // // //                                 onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
// // // // //                                 className="text-[#D68BF9] hover:text-white"
// // // // //                               >
// // // // //                                 <Download className="w-4 h-4" />
// // // // //                               </button>
// // // // //                             </div>
// // // // //                           ))}
// // // // //                         </div>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {/* Quiz Section */}
// // // // //                     {lesson.hasQuiz && (
// // // // //                       <div>
// // // // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
// // // // //                         <div className="bg-[#34137C]/50 p-3 rounded-md">
// // // // //                           <div className="flex justify-between items-center">
// // // // //                             <div className="flex items-center">
// // // // //                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
// // // // //                               <span className="text-white text-sm">Lesson Quiz</span>
// // // // //                               {lesson.isQuizCompleted && (
// // // // //                                 <span className="ml-2 text-green-500 text-xs flex items-center">
// // // // //                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
// // // // //                                 </span>
// // // // //                               )}
// // // // //                             </div>
// // // // //                             <button
// // // // //                               onClick={() => lesson.quizId && handleStartQuiz(lesson.quizId)}
// // // // //                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
// // // // //                             >
// // // // //                               {lesson.isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
// // // // //                             </button>
// // // // //                           </div>
// // // // //                         </div>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {/* No Content Message */}
// // // // //                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
// // // // //                       <div className="text-gray-400 text-sm italic">
// // // // //                         No content available for this lesson.
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>
// // // // //             ))}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default LearnerCourseOverview;

// // // // // src/features/Learner/CourseContent/LearnerCourseOverview.tsx
// // // // import React, { useEffect, useState } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertCircle, Award } from 'lucide-react';
// // // // import toast from 'react-hot-toast';

// // // // import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// // // // import { generateCertificate } from '../../../api/services/Course/certificateService';
// // // // import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// // // // const LearnerCourseOverview: React.FC = () => {
// // // //   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
// // // //   const navigate = useNavigate();
// // // //   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

// // // //   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(true);
// // // //   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
// // // //   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
// // // //   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

// // // //   useEffect(() => {
// // // //     if (!courseId) {
// // // //       toast.error("Course ID is missing.");
// // // //       navigate("/learner/course-categories");
// // // //       return;
// // // //     }

// // // //     const fetchCourseDetails = async () => {
// // // //       try {
// // // //         setIsLoading(true);
// // // //         const course = await getLearnerCourseDetails(courseId);
        
// // // //         const initialExpandedState: Record<number, boolean> = {};
// // // //         course.lessons.forEach(lesson => {
// // // //           initialExpandedState[lesson.id] = false;
// // // //         });
        
// // // //         setCourseData(course);
// // // //         setExpandedLessons(initialExpandedState);
// // // //       } catch (error) {
// // // //         console.error("Error fetching course details:", error);
// // // //         toast.error("Failed to load course details.");
// // // //         navigate("/learner/course-categories");
// // // //       } finally {
// // // //         setIsLoading(false);
// // // //       }
// // // //     };

// // // //     fetchCourseDetails();
// // // //   }, [courseId, navigate]);

// // // //   const handleGoBack = () => {
// // // //     if (courseData && courseData.category && courseData.category.id) {
// // // //       navigate(`/learner/courses/${courseData.category.id}`);
// // // //     } else {
// // // //       navigate("/learner/course-categories");
// // // //     }
// // // //   };

// // // //   const toggleLessonExpand = (lessonId: number) => {
// // // //     setExpandedLessons(prev => ({
// // // //       ...prev,
// // // //       [lessonId]: !prev[lessonId]
// // // //     }));
// // // //   };

// // // //   const handleMarkLessonComplete = async (lessonId: number) => {
// // // //     if (isMarkingComplete[lessonId]) return;
    
// // // //     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
// // // //     try {
// // // //       await markLessonCompleted(lessonId);
      
// // // //       setCourseData(prev => {
// // // //         if (!prev) return null;
        
// // // //         const updatedLessons = prev.lessons.map(lesson => 
// // // //           lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
// // // //         );
        
// // // //         const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
// // // //         const progressPercentage = Math.round((completedLessons / updatedLessons.length) * 100);
        
// // // //         return {
// // // //           ...prev,
// // // //           lessons: updatedLessons,
// // // //           completedLessons,
// // // //           progressPercentage
// // // //         };
// // // //       });
      
// // // //       toast.success("Lesson marked as completed!");
// // // //     } catch (error) {
// // // //       console.error("Error marking lesson as completed:", error);
// // // //       toast.error("Failed to mark lesson as completed.");
// // // //     } finally {
// // // //       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
// // // //     }
// // // //   };

// // // //   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
// // // //     const a = document.createElement('a');
// // // //     a.href = fileUrl;
// // // //     a.download = fileName || 'document';
// // // //     document.body.appendChild(a);
// // // //     a.click();
// // // //     document.body.removeChild(a);
// // // //   };

// // // //   /**
// // // //    * Handles navigation for quizzes.
// // // //    * If the quiz is completed, it navigates to the results page.
// // // //    * Otherwise, it navigates to the quiz-taking page for the user's single attempt.
// // // //    */
// // // //   const handleQuizAction = (lesson: LearnerLessonDto) => {
// // // //     if (!lesson.quizId) {
// // // //       toast.error("Quiz could not be found for this lesson.");
// // // //       return;
// // // //     }

// // // //     if (lesson.isQuizCompleted) {
// // // //       // User has already completed the quiz, navigate to results.
// // // //       if (lesson.lastAttemptId) {
// // // //         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
// // // //           state: { courseId: courseId } 
// // // //         });
// // // //       } else {
// // // //         // Fallback if lastAttemptId is missing. Let TakeQuiz handle the redirect.
// // // //         toast.error("Could not find your previous attempt record, checking now.");
// // // //         navigate(`/learner/take-quiz/${lesson.quizId}`, { 
// // // //           state: { courseId: courseId } 
// // // //         });
// // // //       }
// // // //     } else {
// // // //       // User has not completed the quiz, navigate to start their attempt.
// // // //       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
// // // //         state: { courseId: courseId } 
// // // //       });
// // // //     }
// // // //   };

// // // //   const handleGenerateCertificate = async () => {
// // // //     if (!courseData || !courseId || isGeneratingCertificate) return;
    
// // // //     if (courseData.progressPercentage < 100) {
// // // //       toast.error("You must complete 100% of the course to generate a certificate.");
// // // //       return;
// // // //     }
    
// // // //     setIsGeneratingCertificate(true);
// // // //     try {
// // // //       await generateCertificate(courseId);
// // // //       toast.success("Certificate generated successfully!");
// // // //       navigate(`/learner/certificate`);
// // // //     } catch (error) {
// // // //       console.error("Error generating certificate:", error);
// // // //       toast.error("Failed to generate certificate.");
// // // //     } finally {
// // // //       setIsGeneratingCertificate(false);
// // // //     }
// // // //   };

// // // //   if (isLoading) {
// // // //     return (
// // // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // // //         <div className="text-white text-xl flex items-center">
// // // //           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // // //             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // // //             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // // //           </svg>
// // // //           Loading Course Details...
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (!courseData) {
// // // //     return (
// // // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // // //         <div className="text-white text-xl">Course not found.</div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   const isCourseCompleted = courseData.progressPercentage === 100;

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
// // // //       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
// // // //         <button
// // // //           onClick={handleGoBack}
// // // //           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
// // // //         >
// // // //           <ArrowLeft className="w-4 h-4 mr-2" />
// // // //           Back to Courses
// // // //         </button>

// // // //         {/* Course Header */}
// // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // // //             <div className="md:col-span-1">
// // // //               {courseData.thumbnailUrl ? (
// // // //                 <img 
// // // //                   src={courseData.thumbnailUrl} 
// // // //                   alt={courseData.title} 
// // // //                   className="w-full h-48 object-cover rounded-xl shadow-lg"
// // // //                 />
// // // //               ) : (
// // // //                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
// // // //                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
// // // //                 </div>
// // // //               )}
// // // //             </div>
            
// // // //             <div className="md:col-span-2">
// // // //               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
// // // //               <div className="flex flex-wrap gap-2 mb-4">
// // // //                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
// // // //                   {courseData.category.title}
// // // //                 </span>
// // // //                 {courseData.technologies.map(tech => (
// // // //                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
// // // //                     {tech.name}
// // // //                   </span>
// // // //                 ))}
// // // //               </div>
// // // //               <p className="text-gray-300 mb-4">{courseData.description}</p>
// // // //               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
// // // //                 <div className="flex items-center">
// // // //                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // //                   Estimated time: {courseData.estimatedTime} hours
// // // //                 </div>
// // // //                 <div className="flex items-center">
// // // //                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // //                   Lessons: {courseData.totalLessons}
// // // //                 </div>
// // // //                 <div className="flex items-center">
// // // //                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // // //                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Progress Bar */}
// // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // //           <div className="mb-2 flex justify-between items-center">
// // // //             <h2 className="text-white font-semibold">Your Progress</h2>
// // // //             <span className="text-white">{courseData.progressPercentage}%</span>
// // // //           </div>
// // // //           <div className="w-full bg-[#34137C] rounded-full h-4">
// // // //             <div 
// // // //               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
// // // //               style={{ width: `${courseData.progressPercentage}%` }}
// // // //             ></div>
// // // //           </div>
// // // //           {isCourseCompleted && (
// // // //             <div className="mt-4 flex justify-end">
// // // //               <button
// // // //                 onClick={handleGenerateCertificate}
// // // //                 disabled={isGeneratingCertificate}
// // // //                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
// // // //               >
// // // //                 {isGeneratingCertificate ? (
// // // //                   <>
// // // //                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // // //                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // // //                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // // //                     </svg>
// // // //                     Generating...
// // // //                   </>
// // // //                 ) : (
// // // //                   <>
// // // //                     <Award className="w-4 h-4 mr-2" />
// // // //                     Generate Certificate
// // // //                   </>
// // // //                 )}
// // // //               </button>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* Course Content */}
// // // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // // //           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
// // // //           <div className="space-y-4">
// // // //             {courseData.lessons.map((lesson) => (
// // // //               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
// // // //                 <div 
// // // //                   className="p-4 flex justify-between items-center cursor-pointer"
// // // //                   onClick={() => toggleLessonExpand(lesson.id)}
// // // //                 >
// // // //                   <div className="flex items-center space-x-3 flex-1">
// // // //                     {expandedLessons[lesson.id] ? (
// // // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
// // // //                     ) : (
// // // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
// // // //                     )}
// // // //                     <div className="flex-1">
// // // //                       <div className="flex items-center">
// // // //                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
// // // //                         {lesson.isCompleted && (
// // // //                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
// // // //                         )}
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                   {!lesson.isCompleted && (
// // // //                     <button
// // // //                       onClick={(e) => {
// // // //                         e.stopPropagation();
// // // //                         handleMarkLessonComplete(lesson.id);
// // // //                       }}
// // // //                       disabled={isMarkingComplete[lesson.id]}
// // // //                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
// // // //                     >
// // // //                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
// // // //                     </button>
// // // //                   )}
// // // //                 </div>
// // // //                 {expandedLessons[lesson.id] && (
// // // //                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
// // // //                     {lesson.documents && lesson.documents.length > 0 && (
// // // //                       <div className="mb-4">
// // // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
// // // //                         <div className="space-y-2">
// // // //                           {lesson.documents.map((doc) => (
// // // //                             <div key={doc.id} className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center">
// // // //                               <div className="flex items-center">
// // // //                                 {doc.documentType === 'PDF' ? <FileText className="w-4 h-4 text-[#D68BF9] mr-2" /> : <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />}
// // // //                                 <span className="text-white text-sm">{doc.name}</span>
// // // //                               </div>
// // // //                               <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} className="text-[#D68BF9] hover:text-white">
// // // //                                 <Download className="w-4 h-4" />
// // // //                               </button>
// // // //                             </div>
// // // //                           ))}
// // // //                         </div>
// // // //                       </div>
// // // //                     )}
// // // //                     {lesson.hasQuiz && (
// // // //                       <div>
// // // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
// // // //                         <div className="bg-[#34137C]/50 p-3 rounded-md">
// // // //                           <div className="flex justify-between items-center">
// // // //                             <div className="flex items-center">
// // // //                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
// // // //                               <span className="text-white text-sm">Lesson Quiz</span>
// // // //                               {lesson.isQuizCompleted && (
// // // //                                 <span className="ml-2 text-green-500 text-xs flex items-center">
// // // //                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
// // // //                                 </span>
// // // //                               )}
// // // //                             </div>
// // // //                             <button
// // // //                               onClick={() => handleQuizAction(lesson)}
// // // //                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
// // // //                             >
// // // //                               {lesson.isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
// // // //                             </button>
// // // //                           </div>
// // // //                         </div>
// // // //                       </div>
// // // //                     )}
// // // //                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
// // // //                       <div className="text-gray-400 text-sm italic">
// // // //                         No content available for this lesson.
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 )}
// // // //               </div>
// // // //             ))}
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default LearnerCourseOverview;
// // // import React, { useEffect, useState } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, AlertCircle, Award } from 'lucide-react';
// // // import toast from 'react-hot-toast';

// // // import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// // // import { generateCertificate } from '../../../api/services/Course/certificateService';
// // // import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// // // const LearnerCourseOverview: React.FC = () => {
// // //   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
// // //   const navigate = useNavigate();
// // //   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

// // //   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
// // //   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
// // //   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

// // //   useEffect(() => {
// // //     if (!courseId) {
// // //       toast.error("Course ID is missing.");
// // //       navigate("/learner/course-categories");
// // //       return;
// // //     }

// // //     const fetchCourseDetails = async () => {
// // //       try {
// // //         setIsLoading(true);
// // //         const course = await getLearnerCourseDetails(courseId);
        
// // //         const initialExpandedState: Record<number, boolean> = {};
// // //         course.lessons.forEach(lesson => {
// // //           initialExpandedState[lesson.id] = false; // Initially all lessons are collapsed
// // //         });
        
// // //         setCourseData(course);
// // //         setExpandedLessons(initialExpandedState);
// // //       } catch (error) {
// // //         console.error("Error fetching course details:", error);
// // //         toast.error("Failed to load course details.");
// // //         navigate("/learner/course-categories");
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     };

// // //     fetchCourseDetails();
// // //   }, [courseId, navigate]);

// // //   const handleGoBack = () => {
// // //     if (courseData && courseData.category && courseData.category.id) {
// // //       navigate(`/learner/courses/${courseData.category.id}`);
// // //     } else {
// // //       navigate("/learner/course-categories");
// // //     }
// // //   };

// // //   const toggleLessonExpand = (lessonId: number) => {
// // //     setExpandedLessons(prev => ({
// // //       ...prev,
// // //       [lessonId]: !prev[lessonId]
// // //     }));
// // //   };

// // //   const handleMarkLessonComplete = async (lessonId: number) => {
// // //     if (isMarkingComplete[lessonId]) return;
    
// // //     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
// // //     try {
// // //       await markLessonCompleted(lessonId);
      
// // //       setCourseData(prev => {
// // //         if (!prev) return null;
        
// // //         const updatedLessons = prev.lessons.map(lesson => 
// // //           lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
// // //         );
        
// // //         const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
// // //         const progressPercentage = updatedLessons.length > 0 ? Math.round((completedLessons / updatedLessons.length) * 100) : 0;
        
// // //         return {
// // //           ...prev,
// // //           lessons: updatedLessons,
// // //           completedLessons,
// // //           progressPercentage
// // //         };
// // //       });
      
// // //       toast.success("Lesson marked as completed!");
// // //     } catch (error) {
// // //       console.error("Error marking lesson as completed:", error);
// // //       toast.error("Failed to mark lesson as completed.");
// // //     } finally {
// // //       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
// // //     }
// // //   };

// // //   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
// // //     const a = document.createElement('a');
// // //     a.href = fileUrl;
// // //     a.download = fileName || 'document';
// // //     document.body.appendChild(a);
// // //     a.click();
// // //     document.body.removeChild(a);
// // //   };

// // //   /**
// // //    * Handles navigation for quizzes.
// // //    * If the quiz is completed, it navigates to the results page.
// // //    * Otherwise, it navigates to the quiz-taking page for the user's single attempt.
// // //    */
// // //   const handleQuizAction = (lesson: LearnerLessonDto) => {
// // //     if (!lesson.quizId) {
// // //       toast.error("Quiz could not be found for this lesson.");
// // //       return;
// // //     }

// // //     if (lesson.isQuizCompleted) {
// // //       // User has already completed the quiz, navigate to results.
// // //       if (lesson.lastAttemptId) {
// // //         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
// // //           state: { courseId: courseId } 
// // //         });
// // //       } else {
// // //         // Fallback for data inconsistency: prevents re-taking the quiz.
// // //         toast.error("Your quiz is complete, but the attempt record could not be found. Please contact support.");
// // //       }
// // //     } else {
// // //       // User has not completed the quiz, navigate to start their one attempt.
// // //       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
// // //         state: { courseId: courseId } 
// // //       });
// // //     }
// // //   };

// // //   const handleGenerateCertificate = async () => {
// // //     if (!courseData || !courseId || isGeneratingCertificate) return;
    
// // //     if (courseData.progressPercentage < 100) {
// // //       toast.error("You must complete 100% of the course to generate a certificate.");
// // //       return;
// // //     }
    
// // //     setIsGeneratingCertificate(true);
// // //     try {
// // //       await generateCertificate(courseId);
// // //       toast.success("Certificate generated successfully!");
// // //       navigate(`/learner/certificate`);
// // //     } catch (error) {
// // //       console.error("Error generating certificate:", error);
// // //       toast.error("Failed to generate certificate.");
// // //     } finally {
// // //       setIsGeneratingCertificate(false);
// // //     }
// // //   };

// // //   if (isLoading) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // //         <div className="text-white text-xl flex items-center">
// // //           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // //             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // //             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // //           </svg>
// // //           Loading Course Details...
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (!courseData) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// // //         <div className="text-white text-xl">Course not found.</div>
// // //       </div>
// // //     );
// // //   }

// // //   const isCourseCompleted = courseData.progressPercentage === 100;

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
// // //       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
// // //         <button
// // //           onClick={handleGoBack}
// // //           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
// // //         >
// // //           <ArrowLeft className="w-4 h-4 mr-2" />
// // //           Back to Courses
// // //         </button>

// // //         {/* Course Header */}
// // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //             <div className="md:col-span-1">
// // //               {courseData.thumbnailUrl ? (
// // //                 <img 
// // //                   src={courseData.thumbnailUrl} 
// // //                   alt={courseData.title} 
// // //                   className="w-full h-48 object-cover rounded-xl shadow-lg"
// // //                 />
// // //               ) : (
// // //                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
// // //                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
// // //                 </div>
// // //               )}
// // //             </div>
            
// // //             <div className="md:col-span-2">
// // //               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              
// // //               <div className="flex flex-wrap gap-2 mb-4">
// // //                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
// // //                   {courseData.category.title}
// // //                 </span>
// // //                 {courseData.technologies.map(tech => (
// // //                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
// // //                     {tech.name}
// // //                   </span>
// // //                 ))}
// // //               </div>
              
// // //               <p className="text-gray-300 mb-4">{courseData.description}</p>
              
// // //               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
// // //                 <div className="flex items-center">
// // //                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // //                   Estimated time: {courseData.estimatedTime} hours
// // //                 </div>
// // //                 <div className="flex items-center">
// // //                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // //                   Lessons: {courseData.totalLessons}
// // //                 </div>
// // //                 <div className="flex items-center">
// // //                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
// // //                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Progress Bar */}
// // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // //           <div className="mb-2 flex justify-between items-center">
// // //             <h2 className="text-white font-semibold">Your Progress</h2>
// // //             <span className="text-white">{courseData.progressPercentage}%</span>
// // //           </div>
// // //           <div className="w-full bg-[#34137C] rounded-full h-4">
// // //             <div 
// // //               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
// // //               style={{ width: `${courseData.progressPercentage}%` }}
// // //             ></div>
// // //           </div>
// // //           {isCourseCompleted && (
// // //             <div className="mt-4 flex justify-end">
// // //               <button
// // //                 onClick={handleGenerateCertificate}
// // //                 disabled={isGeneratingCertificate}
// // //                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
// // //               >
// // //                 {isGeneratingCertificate ? (
// // //                   <>
// // //                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // //                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // //                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // //                     </svg>
// // //                     Generating...
// // //                   </>
// // //                 ) : (
// // //                   <>
// // //                     <Award className="w-4 h-4 mr-2" />
// // //                     Generate Certificate
// // //                   </>
// // //                 )}
// // //               </button>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Course Content */}
// // //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// // //           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
// // //           <div className="space-y-4">
// // //             {courseData.lessons.map((lesson) => (
// // //               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
// // //                 <div 
// // //                   className="p-4 flex justify-between items-center cursor-pointer"
// // //                   onClick={() => toggleLessonExpand(lesson.id)}
// // //                 >
// // //                   <div className="flex items-center space-x-3 flex-1">
// // //                     {expandedLessons[lesson.id] ? (
// // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
// // //                     ) : (
// // //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
// // //                     )}
                    
// // //                     <div className="flex-1">
// // //                       <div className="flex items-center">
// // //                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
// // //                         {lesson.isCompleted && (
// // //                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
// // //                         )}
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   {!lesson.isCompleted && (
// // //                     <button
// // //                       onClick={(e) => {
// // //                         e.stopPropagation();
// // //                         handleMarkLessonComplete(lesson.id);
// // //                       }}
// // //                       disabled={isMarkingComplete[lesson.id]}
// // //                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
// // //                     >
// // //                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
// // //                     </button>
// // //                   )}
// // //                 </div>

// // //                 {expandedLessons[lesson.id] && (
// // //                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
// // //                     {/* Documents Section */}
// // //                     {lesson.documents && lesson.documents.length > 0 && (
// // //                       <div className="mb-4">
// // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
// // //                         <div className="space-y-2">
// // //                           {lesson.documents.map((doc) => (
// // //                             <div 
// // //                               key={doc.id} 
// // //                               className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center"
// // //                             >
// // //                               <div className="flex items-center">
// // //                                 <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
// // //                                 <span className="text-white text-sm">{doc.name}</span>
// // //                               </div>
// // //                               <button 
// // //                                 onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
// // //                                 className="text-[#D68BF9] hover:text-white"
// // //                               >
// // //                                 <Download className="w-4 h-4" />
// // //                               </button>
// // //                             </div>
// // //                           ))}
// // //                         </div>
// // //                       </div>
// // //                     )}

// // //                     {/* Quiz Section */}
// // //                     {lesson.hasQuiz && (
// // //                       <div>
// // //                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
// // //                         <div className="bg-[#34137C]/50 p-3 rounded-md">
// // //                           <div className="flex justify-between items-center">
// // //                             <div className="flex items-center">
// // //                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
// // //                               <span className="text-white text-sm">Lesson Quiz</span>
// // //                               {lesson.isQuizCompleted && (
// // //                                 <span className="ml-2 text-green-500 text-xs flex items-center">
// // //                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
// // //                                 </span>
// // //                               )}
// // //                             </div>
// // //                             <button
// // //                               onClick={() => handleQuizAction(lesson)}
// // //                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
// // //                             >
// // //                               {lesson.isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
// // //                             </button>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     )}

// // //                     {/* No Content Message */}
// // //                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
// // //                       <div className="text-gray-400 text-sm italic">
// // //                         No content available for this lesson.
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default LearnerCourseOverview;

// // import React, { useEffect, useState } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, Award } from 'lucide-react';
// // import toast from 'react-hot-toast';

// // import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// // import { generateCertificate } from '../../../api/services/Course/certificateService';
// // import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// // const LearnerCourseOverview: React.FC = () => {
// //   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
// //   const navigate = useNavigate();
// //   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

// //   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
// //   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
// //   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

// //   useEffect(() => {
// //     if (!courseId) {
// //       toast.error("Course ID is missing.");
// //       navigate("/learner/course-categories");
// //       return;
// //     }

// //     const fetchCourseDetails = async () => {
// //       try {
// //         setIsLoading(true);
// //         const course = await getLearnerCourseDetails(courseId);
        
// //         const initialExpandedState: Record<number, boolean> = {};
// //         course.lessons.forEach(lesson => {
// //           initialExpandedState[lesson.id] = false; // Initially collapsed
// //         });
        
// //         setCourseData(course);
// //         setExpandedLessons(initialExpandedState);
// //       } catch (error) {
// //         console.error("Error fetching course details:", error);
// //         toast.error("Failed to load course details.");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchCourseDetails();
// //   }, [courseId, navigate]);

// //   const handleGoBack = () => {
// //     if (courseData?.category?.id) {
// //       navigate(`/learner/courses/${courseData.category.id}`);
// //     } else {
// //       navigate("/learner/course-categories");
// //     }
// //   };

// //   const toggleLessonExpand = (lessonId: number) => {
// //     setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
// //   };

// //   const handleMarkLessonComplete = async (lessonId: number) => {
// //     if (isMarkingComplete[lessonId]) return;
    
// //     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
// //     try {
// //       await markLessonCompleted(lessonId);
      
// //       setCourseData(prev => {
// //         if (!prev) return null;
        
// //         const updatedLessons = prev.lessons.map(lesson => 
// //           lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
// //         );
        
// //         const totalLessons = updatedLessons.length;
// //         const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
// //         const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
// //         return {
// //           ...prev,
// //           lessons: updatedLessons,
// //           completedLessons,
// //           progressPercentage
// //         };
// //       });
      
// //       toast.success("Lesson marked as completed!");
// //     } catch (error) {
// //       console.error("Error marking lesson as completed:", error);
// //       toast.error("Failed to mark lesson as completed.");
// //     } finally {
// //       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
// //     }
// //   };

// //   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
// //     const a = document.createElement('a');
// //     a.href = fileUrl;
// //     a.download = fileName || 'document';
// //     document.body.appendChild(a);
// //     a.click();
// //     document.body.removeChild(a);
// //   };

// //   const handleQuizAction = (lesson: LearnerLessonDto) => {
// //     if (!lesson.quizId) {
// //       toast.error("Quiz could not be found for this lesson.");
// //       return;
// //     }

// //     if (lesson.isQuizCompleted) {
// //       if (lesson.lastAttemptId) {
// //         // Correct path: User completed the quiz, and we have the attempt ID. Navigate to results.
// //         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
// //           state: { courseId: courseId } 
// //         });
// //       } else {
// //         // Fallback for data inconsistency: The backend says the quiz is done but didn't provide an ID.
// //         // We prevent the user from re-taking the quiz by showing an error.
// //         toast.error("Your quiz is complete, but the specific attempt record could not be found. Please contact support.");
// //       }
// //     } else {
// //       // Correct path: User has not completed the quiz yet. Navigate them to take it for the first time.
// //       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
// //         state: { courseId: courseId } 
// //       });
// //     }
// //   };

// //   const handleGenerateCertificate = async () => {
// //     if (!courseData || !courseId || isGeneratingCertificate) return;
    
// //     if (courseData.progressPercentage < 100) {
// //       toast.error("You must complete 100% of the course to generate a certificate.");
// //       return;
// //     }
    
// //     setIsGeneratingCertificate(true);
// //     try {
// //       await generateCertificate(courseId);
// //       toast.success("Certificate generated successfully!");
// //       navigate(`/learner/certificate`);
// //     } catch (error) {
// //       console.error("Error generating certificate:", error);
// //       toast.error("Failed to generate certificate.");
// //     } finally {
// //       setIsGeneratingCertificate(false);
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// //         <div className="text-white text-xl flex items-center">
// //           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //           </svg>
// //           Loading Course Details...
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!courseData) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
// //         <div className="text-white text-xl">Course not found.</div>
// //       </div>
// //     );
// //   }

// //   const isCourseCompleted = courseData.progressPercentage === 100;

// //   return (
// //     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
// //       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
// //         <button
// //           onClick={handleGoBack}
// //           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
// //         >
// //           <ArrowLeft className="w-4 h-4 mr-2" />
// //           Back to Courses
// //         </button>

// //         {/* Course Header */}
// //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //             <div className="md:col-span-1">
// //               {courseData.thumbnailUrl ? (
// //                 <img 
// //                   src={courseData.thumbnailUrl} 
// //                   alt={courseData.title} 
// //                   className="w-full h-48 object-cover rounded-xl shadow-lg"
// //                 />
// //               ) : (
// //                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
// //                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
// //                 </div>
// //               )}
// //             </div>
            
// //             <div className="md:col-span-2">
// //               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              
// //               <div className="flex flex-wrap gap-2 mb-4">
// //                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
// //                   {courseData.category.title}
// //                 </span>
// //                 {courseData.technologies.map(tech => (
// //                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
// //                     {tech.name}
// //                   </span>
// //                 ))}
// //               </div>
              
// //               <p className="text-gray-300 mb-4">{courseData.description}</p>
              
// //               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
// //                 <div className="flex items-center">
// //                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
// //                   Estimated time: {courseData.estimatedTime} hours
// //                 </div>
// //                 <div className="flex items-center">
// //                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
// //                   Lessons: {courseData.totalLessons}
// //                 </div>
// //                 <div className="flex items-center">
// //                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
// //                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Progress Bar */}
// //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// //           <div className="mb-2 flex justify-between items-center">
// //             <h2 className="text-white font-semibold">Your Progress</h2>
// //             <span className="text-white">{courseData.progressPercentage}%</span>
// //           </div>
          
// //           <div className="w-full bg-[#34137C] rounded-full h-4">
// //             <div 
// //               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
// //               style={{ width: `${courseData.progressPercentage}%` }}
// //             ></div>
// //           </div>
          
// //           {isCourseCompleted && (
// //             <div className="mt-4 flex justify-end">
// //               <button
// //                 onClick={handleGenerateCertificate}
// //                 disabled={isGeneratingCertificate}
// //                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
// //               >
// //                 {isGeneratingCertificate ? (
// //                   <>
// //                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                     </svg>
// //                     Generating...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Award className="w-4 h-4 mr-2" />
// //                     Generate Certificate
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         {/* Course Content */}
// //         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
// //           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
          
// //           <div className="space-y-4">
// //             {courseData.lessons.map((lesson) => (
// //               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
// //                 <div 
// //                   className="p-4 flex justify-between items-center cursor-pointer"
// //                   onClick={() => toggleLessonExpand(lesson.id)}
// //                 >
// //                   <div className="flex items-center space-x-3 flex-1">
// //                     {expandedLessons[lesson.id] ? (
// //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
// //                     ) : (
// //                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
// //                     )}
                    
// //                     <div className="flex-1">
// //                       <div className="flex items-center">
// //                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
// //                         {lesson.isCompleted && (
// //                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {!lesson.isCompleted && (
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         handleMarkLessonComplete(lesson.id);
// //                       }}
// //                       disabled={isMarkingComplete[lesson.id]}
// //                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
// //                     >
// //                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
// //                     </button>
// //                   )}
// //                 </div>

// //                 {expandedLessons[lesson.id] && (
// //                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
// //                     {lesson.documents && lesson.documents.length > 0 && (
// //                       <div className="mb-4">
// //                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
// //                         <div className="space-y-2">
// //                           {lesson.documents.map((doc) => (
// //                             <div 
// //                               key={doc.id} 
// //                               className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center"
// //                             >
// //                               <div className="flex items-center">
// //                                 {doc.documentType === 'PDF' ? (
// //                                   <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
// //                                 ) : (
// //                                   <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />
// //                                 )}
// //                                 <span className="text-white text-sm">{doc.name}</span>
// //                               </div>
// //                               <button 
// //                                 onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
// //                                 className="text-[#D68BF9] hover:text-white"
// //                               >
// //                                 <Download className="w-4 h-4" />
// //                               </button>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}

// //                     {lesson.hasQuiz && (
// //                       <div>
// //                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
// //                         <div className="bg-[#34137C]/50 p-3 rounded-md">
// //                           <div className="flex justify-between items-center">
// //                             <div className="flex items-center">
// //                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
// //                               <span className="text-white text-sm">Lesson Quiz</span>
// //                               {lesson.isQuizCompleted && (
// //                                 <span className="ml-2 text-green-500 text-xs flex items-center">
// //                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
// //                                 </span>
// //                               )}
// //                             </div>
// //                             <button
// //                               onClick={() => handleQuizAction(lesson)}
// //                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
// //                             >
// //                               {lesson.isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
// //                             </button>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}

// //                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
// //                       <div className="text-gray-400 text-sm italic">
// //                         No content available for this lesson.
// //                       </div>
// //                     )}
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LearnerCourseOverview;
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, Award } from 'lucide-react';
// import toast from 'react-hot-toast';

// import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// import { generateCertificate } from '../../../api/services/Course/certificateService';
// import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// const LearnerCourseOverview: React.FC = () => {
//   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

//   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
//   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
//   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

//   useEffect(() => {
//     if (!courseId) {
//       toast.error("Course ID is missing.");
//       navigate("/learner/course-categories");
//       return;
//     }

//     const fetchCourseDetails = async () => {
//       console.log("Fetching or re-fetching course details...");
//       setIsLoading(true);
//       try {
//         setIsLoading(true);
//         const course = await getLearnerCourseDetails(courseId);
        
//         const initialExpandedState: Record<number, boolean> = {};
//         course.lessons.forEach(lesson => {
//           initialExpandedState[lesson.id] = false; // Initially collapsed
//         });
        
//         setCourseData(course);
//         setExpandedLessons(initialExpandedState);
//       } catch (error) {
//         console.error("Error fetching course details:", error);
//         toast.error("Failed to load course details.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCourseDetails();
//   }, [courseId, navigate, location.state]);

//   const handleGoBack = () => {
//     if (courseData?.category?.id) {
//       navigate(`/learner/courses/${courseData.category.id}`);
//     } else {
//       navigate("/learner/course-categories");
//     }
//   };

//   const toggleLessonExpand = (lessonId: number) => {
//     setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
//   };

//   const handleMarkLessonComplete = async (lessonId: number) => {
//     if (isMarkingComplete[lessonId]) return;
    
//     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
//     try {
//       await markLessonCompleted(lessonId);
      
//       setCourseData(prev => {
//         if (!prev) return null;
        
//         const updatedLessons = prev.lessons.map(lesson => 
//           lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
//         );
        
//         const totalLessons = updatedLessons.length;
//         const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
//         const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
//         return {
//           ...prev,
//           lessons: updatedLessons,
//           completedLessons,
//           progressPercentage
//         };
//       });
      
//       toast.success("Lesson marked as completed!");
//     } catch (error) {
//       console.error("Error marking lesson as completed:", error);
//       toast.error("Failed to mark lesson as completed.");
//     } finally {
//       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
//     }
//   };

//   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
//     const a = document.createElement('a');
//     a.href = fileUrl;
//     a.download = fileName || 'document';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const handleQuizAction = (lesson: LearnerLessonDto) => {
//     if (!lesson.quizId) {
//       toast.error("Quiz could not be found for this lesson.");
//       return;
//     }

//     if (lesson.isQuizCompleted) {
//       if (lesson.lastAttemptId) {
//         // Correct path: User completed the quiz, and we have the attempt ID. Navigate to results.
//         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
//           state: { courseId: courseId } 
//         });
//       } else {
//         // Fallback for data inconsistency: The backend says the quiz is done but didn't provide an ID.
//         // We prevent the user from re-taking the quiz by showing an error.
//         toast.error("Your quiz is complete, but the specific attempt record could not be found. Please contact support.");
//       }
//     } else {
//       // Correct path: User has not completed the quiz yet. Navigate them to take it for the first time.
//       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
//         state: { courseId: courseId } 
//       });
//     }
//   };

//   const handleGenerateCertificate = async () => {
//     if (!courseData || !courseId || isGeneratingCertificate) return;
    
//     if (courseData.progressPercentage < 100) {
//       toast.error("You must complete 100% of the course to generate a certificate.");
//       return;
//     }
    
//     setIsGeneratingCertificate(true);
//     try {
//       await generateCertificate(courseId);
//       toast.success("Certificate generated successfully!");
//       navigate(`/learner/certificate`);
//     } catch (error) {
//       console.error("Error generating certificate:", error);
//       toast.error("Failed to generate certificate.");
//     } finally {
//       setIsGeneratingCertificate(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl flex items-center">
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Loading Course Details...
//         </div>
//       </div>
//     );
//   }

//   if (!courseData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl">Course not found.</div>
//       </div>
//     );
//   }

//   const isCourseCompleted = courseData.progressPercentage === 100;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
//         <button
//           onClick={handleGoBack}
//           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Courses
//         </button>

//         {/* Course Header */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-1">
//               {courseData.thumbnailUrl ? (
//                 <img 
//                   src={courseData.thumbnailUrl} 
//                   alt={courseData.title} 
//                   className="w-full h-48 object-cover rounded-xl shadow-lg"
//                 />
//               ) : (
//                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
//                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
//                 </div>
//               )}
//             </div>
            
//             <div className="md:col-span-2">
//               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              
//               <div className="flex flex-wrap gap-2 mb-4">
//                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
//                   {courseData.category.title}
//                 </span>
//                 {courseData.technologies.map(tech => (
//                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
//                     {tech.name}
//                   </span>
//                 ))}
//               </div>
              
//               <p className="text-gray-300 mb-4">{courseData.description}</p>
              
//               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
//                 <div className="flex items-center">
//                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Estimated time: {courseData.estimatedTime} hours
//                 </div>
//                 <div className="flex items-center">
//                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Lessons: {courseData.totalLessons}
//                 </div>
//                 <div className="flex items-center">
//                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="mb-2 flex justify-between items-center">
//             <h2 className="text-white font-semibold">Your Progress</h2>
//             <span className="text-white">{courseData.progressPercentage}%</span>
//           </div>
          
//           <div className="w-full bg-[#34137C] rounded-full h-4">
//             <div 
//               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
//               style={{ width: `${courseData.progressPercentage}%` }}
//             ></div>
//           </div>
          
//           {isCourseCompleted && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={handleGenerateCertificate}
//                 disabled={isGeneratingCertificate}
//                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
//               >
//                 {isGeneratingCertificate ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Award className="w-4 h-4 mr-2" />
//                     Generate Certificate
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Course Content */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
          
//           <div className="space-y-4">
//             {courseData.lessons.map((lesson) => (
//               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
//                 <div 
//                   className="p-4 flex justify-between items-center cursor-pointer"
//                   onClick={() => toggleLessonExpand(lesson.id)}
//                 >
//                   <div className="flex items-center space-x-3 flex-1">
//                     {expandedLessons[lesson.id] ? (
//                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" />
//                     ) : (
//                       <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />
//                     )}
                    
//                     <div className="flex-1">
//                       <div className="flex items-center">
//                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
//                         {lesson.isCompleted && (
//                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {!lesson.isCompleted && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMarkLessonComplete(lesson.id);
//                       }}
//                       disabled={isMarkingComplete[lesson.id]}
//                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
//                     >
//                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
//                     </button>
//                   )}
//                 </div>

//                 {expandedLessons[lesson.id] && (
//                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
//                     {lesson.documents && lesson.documents.length > 0 && (
//                       <div className="mb-4">
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
//                         <div className="space-y-2">
//                           {lesson.documents.map((doc) => (
//                             <div 
//                               key={doc.id} 
//                               className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center"
//                             >
//                               <div className="flex items-center">
//                                 {doc.documentType === 'PDF' ? (
//                                   <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
//                                 ) : (
//                                   <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />
//                                 )}
//                                 <span className="text-white text-sm">{doc.name}</span>
//                               </div>
//                               <button 
//                                 onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
//                                 className="text-[#D68BF9] hover:text-white"
//                               >
//                                 <Download className="w-4 h-4" />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {lesson.hasQuiz && (
//                       <div>
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
//                         <div className="bg-[#34137C]/50 p-3 rounded-md">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
//                               <span className="text-white text-sm">Lesson Quiz</span>
//                               {lesson.isQuizCompleted && (
//                                 <span className="ml-2 text-green-500 text-xs flex items-center">
//                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
//                                 </span>
//                               )}
//                             </div>
//                             <button
//                               onClick={() => handleQuizAction(lesson)}
//                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
//                             >
//                               {lesson.isQuizCompleted ? 'View Result' : 'Start Quiz'}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
//                       <div className="text-gray-400 text-sm italic">
//                         No content available for this lesson.
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LearnerCourseOverview;

// //src/features/Learner/CourseContent/LearnerCourseOverview.tsx
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, Award } from 'lucide-react';
// import toast from 'react-hot-toast';

// import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// import { generateCertificate } from '../../../api/services/Course/certificateService';
// import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// const LearnerCourseOverview: React.FC = () => {
//   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

//   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
//   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
//   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

//   useEffect(() => {
//     if (!courseId) {
//       toast.error("Course ID is missing.");
//       navigate("/learner/course-categories");
//       return;
//     }

//     const fetchInitialCourseDetails = async () => {
//       setIsLoading(true);
//       try {
//         const course = await getLearnerCourseDetails(courseId);
//         setCourseData(course);
//       } catch (error) {
//         console.error("Error fetching initial course details:", error);
//         toast.error("Failed to load course details.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInitialCourseDetails();
//   }, [courseId, navigate]);

//   // CRITICAL: New useEffect hook to handle the state update from the QuizResults page
//   useEffect(() => {
//     // Check if we have the signal from the navigation state
//     if (location.state?.quizCompleted && courseData) {
//       const { quizId, attemptId } = location.state;

//       // Create a new version of the course data with the quiz status updated
//       const newCourseData = { ...courseData };
//       const lessonIndex = newCourseData.lessons.findIndex(l => l.quizId === quizId);

//       if (lessonIndex !== -1) {
//         console.log(`Manually updating state for lesson with quizId: ${quizId}`);
//         // Mark the quiz as complete
//         newCourseData.lessons[lessonIndex].isQuizCompleted = true;
//         newCourseData.lessons[lessonIndex].lastAttemptId = attemptId;

//         // Also automatically mark the lesson itself as complete
//         if (!newCourseData.lessons[lessonIndex].isCompleted) {
//           newCourseData.lessons[lessonIndex].isCompleted = true;
//           // We can call the backend API in the background to sync the change
//           markLessonCompleted(newCourseData.lessons[lessonIndex].id).catch(err => {
//               console.error("Failed to sync auto-completion with backend:", err);
//           });
//         }
        
//         // Recalculate progress
//         const completedLessons = newCourseData.lessons.filter(l => l.isCompleted).length;
//         newCourseData.completedLessons = completedLessons;
//         newCourseData.progressPercentage = Math.round((completedLessons / newCourseData.totalLessons) * 100);

//         // Update the state with the modified data
//         setCourseData(newCourseData);
//         toast.success("Lesson progress updated!");
//       }

//       // Clear the navigation state to prevent this from running again
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location.state, courseData, navigate, location.pathname]);

//   const handleGoBack = () => {
//     if (courseData?.category?.id) {
//       navigate(`/learner/courses/${courseData.category.id}`);
//     } else {
//       navigate("/learner/course-categories");
//     }
//   };

//   const toggleLessonExpand = (lessonId: number) => {
//     setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
//   };
  
//   const handleManualMarkComplete = async (lessonId: number) => {
//     if (isMarkingComplete[lessonId]) return;
    
//     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
//     try {
//       await markLessonCompleted(lessonId);
//       // After manual completion, we must refetch to update the course progress.
//       const updatedCourseData = await getLearnerCourseDetails(courseId!, true);
//       setCourseData(updatedCourseData);
//       toast.success("Lesson marked as completed!");
//     } catch (error) {
//       console.error("Error marking lesson as completed:", error);
//       toast.error("Failed to mark lesson as completed.");
//     } finally {
//       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
//     }
//   };

//   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
//     const a = document.createElement('a');
//     a.href = fileUrl;
//     a.download = fileName || 'document';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const handleQuizAction = (lesson: LearnerLessonDto) => {
//     if (!lesson.quizId) {
//       toast.error("Quiz could not be found for this lesson.");
//       return;
//     }

//     if (lesson.isQuizCompleted) {
//       if (lesson.lastAttemptId) {
//         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
//           // Add refresh state for the unlikely event a user navigates from results back to the same course.
//           state: { courseId: courseId, refresh: true } 
//         });
//       } else {
//         toast.error("Your quiz is complete, but the specific attempt record could not be found. Please contact support.");
//       }
//     } else {
//       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
//         state: { courseId: courseId } 
//       });
//     }
//   };

//   const handleGenerateCertificate = async () => {
//     if (!courseData || !courseId || isGeneratingCertificate) return;
    
//     if (courseData.progressPercentage < 100) {
//       toast.error("You must complete 100% of the course to generate a certificate.");
//       return;
//     }
    
//     setIsGeneratingCertificate(true);
//     try {
//       await generateCertificate(courseId);
//       toast.success("Certificate generated successfully!");
//       navigate(`/learner/certificate`);
//     } catch (error) {
//       console.error("Error generating certificate:", error);
//       toast.error("Failed to generate certificate.");
//     } finally {
//       setIsGeneratingCertificate(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl flex items-center">
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Loading Course Details...
//         </div>
//       </div>
//     );
//   }

//   if (!courseData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl">Course not found.</div>
//       </div>
//     );
//   }

//   const isCourseCompleted = courseData.progressPercentage === 100;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
//         <button
//           onClick={handleGoBack}
//           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Courses
//         </button>

//         {/* Course Header */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-1">
//               {courseData.thumbnailUrl ? (
//                 <img 
//                   src={courseData.thumbnailUrl} 
//                   alt={courseData.title} 
//                   className="w-full h-48 object-cover rounded-xl shadow-lg"
//                 />
//               ) : (
//                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
//                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
//                 </div>
//               )}
//             </div>
            
//             <div className="md:col-span-2">
//               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
//               <div className="flex flex-wrap gap-2 mb-4">
//                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
//                   {courseData.category.title}
//                 </span>
//                 {courseData.technologies.map(tech => (
//                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
//                     {tech.name}
//                   </span>
//                 ))}
//               </div>
//               <p className="text-gray-300 mb-4">{courseData.description}</p>
//               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
//                 <div className="flex items-center">
//                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Estimated time: {courseData.estimatedTime} hours
//                 </div>
//                 <div className="flex items-center">
//                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Lessons: {courseData.totalLessons}
//                 </div>
//                 <div className="flex items-center">
//                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="mb-2 flex justify-between items-center">
//             <h2 className="text-white font-semibold">Your Progress</h2>
//             <span className="text-white">{courseData.progressPercentage}%</span>
//           </div>
//           <div className="w-full bg-[#34137C] rounded-full h-4">
//             <div 
//               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
//               style={{ width: `${courseData.progressPercentage}%` }}
//             ></div>
//           </div>
//           {isCourseCompleted && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={handleGenerateCertificate}
//                 disabled={isGeneratingCertificate}
//                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center"
//               >
//                 {isGeneratingCertificate ? ( <>...</> ) : ( <><Award className="w-4 h-4 mr-2" />Generate Certificate</>)}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Course Content */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
//           <div className="space-y-4">
//             {courseData.lessons.map((lesson) => (
//               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
//                 <div 
//                   className="p-4 flex justify-between items-center cursor-pointer"
//                   onClick={() => toggleLessonExpand(lesson.id)}
//                 >
//                   <div className="flex items-center space-x-3 flex-1">
//                     {expandedLessons[lesson.id] ? <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" /> : <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />}
//                     <div className="flex-1">
//                       <div className="flex items-center">
//                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
//                         {lesson.isCompleted && (
//                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* The manual "Mark Complete" button is now only shown for lessons WITHOUT a quiz. */}
//                   {!lesson.hasQuiz && !lesson.isCompleted && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleManualMarkComplete(lesson.id);
//                       }}
//                       disabled={isMarkingComplete[lesson.id]}
//                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
//                     >
//                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
//                     </button>
//                   )}
//                 </div>

//                 {expandedLessons[lesson.id] && (
//                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
//                     {lesson.documents && lesson.documents.length > 0 && (
//                       <div className="mb-4">
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
//                         <div className="space-y-2">
//                           {lesson.documents.map((doc) => (
//                             <div key={doc.id} className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center">
//                               <div className="flex items-center">
//                                 {doc.documentType === 'PDF' ? <FileText className="w-4 h-4 text-[#D68BF9] mr-2" /> : <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />}
//                                 <span className="text-white text-sm">{doc.name}</span>
//                               </div>
//                               <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} className="text-[#D68BF9] hover:text-white">
//                                 <Download className="w-4 h-4" />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {lesson.hasQuiz && (
//                       <div>
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
//                         <div className="bg-[#34137C]/50 p-3 rounded-md">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
//                               <span className="text-white text-sm">Lesson Quiz</span>
//                               {lesson.isQuizCompleted && (
//                                 <span className="ml-2 text-green-500 text-xs flex items-center">
//                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
//                                 </span>
//                               )}
//                             </div>
//                             <button
//                               onClick={() => handleQuizAction(lesson)}
//                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
//                             >
//                               {lesson.isQuizCompleted ? 'View Result' : 'Start Quiz'}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
//                       <div className="text-gray-400 text-sm italic">
//                         No content available for this lesson.
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LearnerCourseOverview;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, Award } from 'lucide-react';
// import toast from 'react-hot-toast';

// import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
// import { generateCertificate } from '../../../api/services/Course/certificateService';
// import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

// const LearnerCourseOverview: React.FC = () => {
//   const { courseId: courseIdParam } = useParams<{ courseId: string }>();
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : null;

//   const [courseData, setCourseData] = useState<LearnerCourseDto | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMarkingComplete, setIsMarkingComplete] = useState<{[key: number]: boolean}>({});
//   const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
//   const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

//   // Effect 1: Handles the INITIAL data load for the component.
//   useEffect(() => {
//     if (!courseId) {
//       toast.error("Course ID is missing.");
//       navigate("/learner/course-categories");
//       return;
//     }

//     const fetchInitialCourseDetails = async () => {
//       // Only show the main loader if we have no data at all.
//       if (!courseData) {
//         setIsLoading(true);
//       }
//       try {
//         // Corrected: This call only takes one argument.
//         const course = await getLearnerCourseDetails(courseId);
//         setCourseData(course);
//       } catch (error) {
//         console.error("Error fetching initial course details:", error);
//         toast.error("Failed to load course details.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInitialCourseDetails();
//     // This effect should only run once when the courseId changes.
//   }, [courseId, navigate]);

//   // Effect 2: Handles the MANUAL state update when returning from the quiz.
//   useEffect(() => {
//     // Check if we have the signal and that we have course data to update.
//     if (location.state?.quizCompleted && courseData) {
//       const { quizId, attemptId } = location.state;

//       // Manually create a deep copy to modify safely.
//       const newCourseData = JSON.parse(JSON.stringify(courseData)) as LearnerCourseDto;
//       const lessonToUpdate = newCourseData.lessons.find(l => l.quizId === quizId);

//       // Proceed only if we found the lesson and it's not already marked as complete in our state.
//       if (lessonToUpdate && !lessonToUpdate.isQuizCompleted) {
//         console.log(`Manually updating UI for lesson with quizId: ${quizId}`);
        
//         // 1. Update the quiz status and attempt ID on the lesson object.
//         lessonToUpdate.isQuizCompleted = true;
//         lessonToUpdate.lastAttemptId = attemptId;

//         // 2. Automatically mark the lesson itself as complete if it wasn't already.
//         if (!lessonToUpdate.isCompleted) {
//           lessonToUpdate.isCompleted = true;
          
//           // Sync this specific lesson completion with the backend in the background.
//           markLessonCompleted(lessonToUpdate.id).catch(err => {
//               console.error("Failed to sync auto-completion with backend:", err);
//           });
//         }
        
//         // 3. Recalculate progress based on the newly updated lessons array.
//         const completedLessons = newCourseData.lessons.filter(l => l.isCompleted).length;
//         newCourseData.completedLessons = completedLessons;
//         if (newCourseData.totalLessons > 0) {
//             newCourseData.progressPercentage = Math.round((completedLessons / newCourseData.totalLessons) * 100);
//         }

//         // 4. Update the component state with the modified data, causing a re-render.
//         setCourseData(newCourseData);
//         toast.success("Lesson progress updated!");
//       }

//       // 5. Clear the navigation state to prevent this effect from running again on refresh.
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location.state, courseData, navigate, location.pathname]);


//   const handleGoBack = () => {
//     if (courseData?.category?.id) {
//       navigate(`/learner/courses/${courseData.category.id}`);
//     } else {
//       navigate("/learner/course-categories");
//     }
//   };

//   const toggleLessonExpand = (lessonId: number) => {
//     setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
//   };
  
//   const handleManualMarkComplete = async (lessonId: number) => {
//     if (isMarkingComplete[lessonId]) return;
    
//     setIsMarkingComplete(prev => ({ ...prev, [lessonId]: true }));
    
//     try {
//       await markLessonCompleted(lessonId);
//       // After manual completion, we must refetch to update the course progress.
//       // Corrected: This call only takes one argument.
//       const updatedCourseData = await getLearnerCourseDetails(courseId!);
//       setCourseData(updatedCourseData);
//       toast.success("Lesson marked as completed!");
//     } catch (error) {
//       console.error("Error marking lesson as completed:", error);
//       toast.error("Failed to mark lesson as completed.");
//     } finally {
//       setIsMarkingComplete(prev => ({ ...prev, [lessonId]: false }));
//     }
//   };

//   const handleDownloadDocument = (fileUrl: string, fileName: string) => {
//     const a = document.createElement('a');
//     a.href = fileUrl;
//     a.download = fileName || 'document';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const handleQuizAction = (lesson: LearnerLessonDto) => {
//     if (!lesson.quizId) {
//       toast.error("Quiz could not be found for this lesson.");
//       return;
//     }

//     if (lesson.isQuizCompleted) {
//       if (lesson.lastAttemptId) {
//         navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { 
//           state: { courseId: courseId } 
//         });
//       } else {
//         toast.error("Your quiz is complete, but the specific attempt record could not be found. Please contact support.");
//       }
//     } else {
//       navigate(`/learner/take-quiz/${lesson.quizId}`, { 
//         state: { courseId: courseId } 
//       });
//     }
//   };

//   const handleGenerateCertificate = async () => {
//     if (!courseData || !courseId || isGeneratingCertificate) return;
    
//     if (courseData.progressPercentage < 100) {
//       toast.error("You must complete 100% of the course to generate a certificate.");
//       return;
//     }
    
//     setIsGeneratingCertificate(true);
//     try {
//       await generateCertificate(courseId);
//       toast.success("Certificate generated successfully!");
//       navigate(`/learner/certificate`);
//     } catch (error) {
//       console.error("Error generating certificate:", error);
//       toast.error("Failed to generate certificate.");
//     } finally {
//       setIsGeneratingCertificate(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl flex items-center">
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Loading Course Details...
//         </div>
//       </div>
//     );
//   }

//   if (!courseData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
//         <div className="text-white text-xl">Course not found.</div>
//       </div>
//     );
//   }

//   const isCourseCompleted = courseData.progressPercentage === 100;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
//         <button
//           onClick={handleGoBack}
//           className="flex items-center text-[#D68BF9] hover:text-white transition-colors text-sm mb-6"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Courses
//         </button>

//         {/* Course Header */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-1">
//               {courseData.thumbnailUrl ? (
//                 <img 
//                   src={courseData.thumbnailUrl} 
//                   alt={courseData.title} 
//                   className="w-full h-48 object-cover rounded-xl shadow-lg"
//                 />
//               ) : (
//                 <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center">
//                   <BookOpen className="w-16 h-16 text-[#D68BF9]" />
//                 </div>
//               )}
//             </div>
            
//             <div className="md:col-span-2">
//               <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
//               <div className="flex flex-wrap gap-2 mb-4">
//                 <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">
//                   {courseData.category.title}
//                 </span>
//                 {courseData.technologies.map(tech => (
//                   <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">
//                     {tech.name}
//                   </span>
//                 ))}
//               </div>
//               <p className="text-gray-300 mb-4">{courseData.description}</p>
//               <div className="flex flex-wrap gap-4 text-sm text-gray-300">
//                 <div className="flex items-center">
//                   <Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Estimated time: {courseData.estimatedTime} hours
//                 </div>
//                 <div className="flex items-center">
//                   <BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Lessons: {courseData.totalLessons}
//                 </div>
//                 <div className="flex items-center">
//                   <CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />
//                   Completed: {courseData.completedLessons}/{courseData.totalLessons}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <div className="mb-2 flex justify-between items-center">
//             <h2 className="text-white font-semibold">Your Progress</h2>
//             <span className="text-white">{courseData.progressPercentage}%</span>
//           </div>
//           <div className="w-full bg-[#34137C] rounded-full h-4">
//             <div 
//               className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`}
//               style={{ width: `${courseData.progressPercentage}%` }}
//             ></div>
//           </div>
//           {isCourseCompleted && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={handleGenerateCertificate}
//                 disabled={isGeneratingCertificate}
//                 className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center"
//               >
//                 {isGeneratingCertificate ? ( 
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Generating...
//                   </>
//                  ) : ( 
//                   <><Award className="w-4 h-4 mr-2" />Generate Certificate</>
//                  )}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Course Content */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
//           <div className="space-y-4">
//             {courseData.lessons.map((lesson) => (
//               <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
//                 <div 
//                   className="p-4 flex justify-between items-center cursor-pointer"
//                   onClick={() => toggleLessonExpand(lesson.id)}
//                 >
//                   <div className="flex items-center space-x-3 flex-1">
//                     {expandedLessons[lesson.id] ? <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" /> : <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />}
//                     <div className="flex-1">
//                       <div className="flex items-center">
//                         <h3 className="text-white font-medium">{lesson.lessonName}</h3>
//                         {lesson.isCompleted && (
//                           <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {!lesson.hasQuiz && !lesson.isCompleted && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleManualMarkComplete(lesson.id);
//                       }}
//                       disabled={isMarkingComplete[lesson.id]}
//                       className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full disabled:opacity-50"
//                     >
//                       {isMarkingComplete[lesson.id] ? "Marking..." : "Mark Complete"}
//                     </button>
//                   )}
//                 </div>

//                 {expandedLessons[lesson.id] && (
//                   <div className="p-4 pt-0 border-t border-[#BF4BF6]/20">
//                     {lesson.documents && lesson.documents.length > 0 && (
//                       <div className="mb-4">
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Documents</h4>
//                         <div className="space-y-2">
//                           {lesson.documents.map((doc) => (
//                             <div key={doc.id} className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center">
//                               <div className="flex items-center">
//                                 {doc.documentType === 'PDF' ? <FileText className="w-4 h-4 text-[#D68BF9] mr-2" /> : <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />}
//                                 <span className="text-white text-sm">{doc.name}</span>
//                               </div>
//                               <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} className="text-[#D68BF9] hover:text-white">
//                                 <Download className="w-4 h-4" />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {lesson.hasQuiz && (
//                       <div>
//                         <h4 className="text-[#D68BF9] text-sm mb-2">Quiz</h4>
//                         <div className="bg-[#34137C]/50 p-3 rounded-md">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <List className="w-4 h-4 text-[#D68BF9] mr-2" />
//                               <span className="text-white text-sm">Lesson Quiz</span>
//                               {lesson.isQuizCompleted && (
//                                 <span className="ml-2 text-green-500 text-xs flex items-center">
//                                   <CheckCircle className="w-3 h-3 mr-1" /> Completed
//                                 </span>
//                               )}
//                             </div>
//                             <button
//                               onClick={() => handleQuizAction(lesson)}
//                               className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full"
//                             >
//                               {lesson.isQuizCompleted ? 'View Result' : 'Start Quiz'}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {!lesson.hasQuiz && (!lesson.documents || lesson.documents.length === 0) && (
//                       <div className="text-gray-400 text-sm italic">
//                         No content available for this lesson.
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LearnerCourseOverview;
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, List, Clock, FileText, Download, PlayCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

import { LearnerCourseDto, LearnerLessonDto } from '../../../types/course.types';
import { generateCertificate } from '../../../api/services/Course/certificateService';
import { getLearnerCourseDetails, markLessonCompleted } from '../../../api/services/Course/learnerCourseService';

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

  // Centralized function to refetch data from the backend.
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      // The API call uses the cache by default, which is fine for manual refreshes.
      const data = await getLearnerCourseDetails(courseId);
      setCourseData(data);
    } catch (error) {
      if ((error as any).name !== 'CanceledError') {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details.");
      }
    }
  }, [courseId]);


  // Effect 1: Handles the INITIAL data load for the component.
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      navigate("/learner/course-categories");
      return;
    }
    const fetchInitialData = async () => {
      setIsLoading(true);
      await fetchCourseData();
      setIsLoading(false);
    };
    fetchInitialData();
  }, [courseId, navigate, fetchCourseData]);


  // Effect 2: Handles the MANUAL state update when returning from a quiz.
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
  
  const handleManualMarkComplete = async (lesson: LearnerLessonDto) => {
    if (isMarkingComplete[lesson.id] || lesson.isCompleted) return;

    if (lesson.hasQuiz && !lesson.isQuizCompleted) {
      toast.error("Please complete the quiz for this lesson first.");
      return;
    }
    
    setIsMarkingComplete(prev => ({ ...prev, [lesson.id]: true }));
    try {
      await markLessonCompleted(lesson.id);
      toast.success("Lesson marked as completed!");
      await fetchCourseData(); // Refetch to update progress bar and state.
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast.error("Failed to mark lesson as completed.");
    } finally {
      setIsMarkingComplete(prev => ({ ...prev, [lesson.id]: false }));
    }
  };

  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a'); a.href = fileUrl; a.download = fileName || 'document';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleQuizAction = (lesson: LearnerLessonDto) => {
    if (!lesson.quizId) { return; }
    if (lesson.isQuizCompleted && lesson.lastAttemptId) {
      navigate(`/learner/quiz-results/${lesson.lastAttemptId}`, { state: { courseId: courseId } });
    } else {
      navigate(`/learner/take-quiz/${lesson.quizId}`, { state: { courseId: courseId } });
    }
  };

  const handleGenerateCertificate = async () => {
    if (!courseData || !courseId || isGeneratingCertificate || courseData.progressPercentage < 100) {
      return;
    }
    setIsGeneratingCertificate(true);
    try {
      await generateCertificate(courseId);
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
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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

        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {courseData.thumbnailUrl ? <img src={courseData.thumbnailUrl} alt={courseData.title} className="w-full h-48 object-cover rounded-xl shadow-lg"/> : <div className="w-full h-48 bg-[#34137C] rounded-xl flex items-center justify-center"><BookOpen className="w-16 h-16 text-[#D68BF9]" /></div>}
            </div>
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold text-white mb-3">{courseData.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full text-sm">{courseData.category.title}</span>
                {courseData.technologies.map(tech => (<span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-sm">{tech.name}</span>))}
              </div>
              <p className="text-gray-300 mb-4">{courseData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#D68BF9]" />Estimated time: {courseData.estimatedTime} hours</div>
                <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-[#D68BF9]" />Lessons: {courseData.totalLessons}</div>
                <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-[#D68BF9]" />Completed: {courseData.completedLessons}/{courseData.totalLessons}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <div className="mb-2 flex justify-between items-center"><h2 className="text-white font-semibold">Your Progress</h2><span className="text-white">{courseData.progressPercentage}%</span></div>
          <div className="w-full bg-[#34137C] rounded-full h-4"><div className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]`} style={{ width: `${courseData.progressPercentage}%` }}></div></div>
          {isCourseCompleted && (<div className="mt-4 flex justify-end"><button onClick={handleGenerateCertificate} disabled={isGeneratingCertificate} className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg flex items-center">{isGeneratingCertificate ? "Generating..." : <><Award className="w-4 h-4 mr-2" />Generate Certificate</>}</button></div>)}
        </div>

        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Course Content</h2>
          <div className="space-y-4">
            {courseData.lessons.map((lesson) => (
              <div key={lesson.id} className="bg-[#34137C]/30 rounded-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleLessonExpand(lesson.id)}>
                  <div className="flex items-center space-x-3 flex-1">
                    {expandedLessons[lesson.id] ? <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform rotate-90" /> : <ArrowLeft className="text-[#D68BF9] w-5 h-5 transform -rotate-90" />}
                    <div className="flex-1"><div className="flex items-center"><h3 className="text-white font-medium">{lesson.lessonName}</h3>{lesson.isCompleted && (<CheckCircle className="w-4 h-4 ml-2 text-green-500" />)}</div></div>
                  </div>
                </div>
                {expandedLessons[lesson.id] && (
                  <div className="p-4 pt-0 border-t border-[#BF4BF6]/20 space-y-4">
                    {lesson.documents && lesson.documents.length > 0 && (
                      <div>
                        <h4 className="text-[#D68BF9] text-sm font-semibold mb-2 mt-2">Materials</h4>
                        <div className="space-y-2">
                          {lesson.documents.map((doc) => (
                            <div key={doc.id} className="bg-[#34137C]/50 p-2 rounded-md flex justify-between items-center">
                              <div className="flex items-center">
                                {doc.documentType === 'PDF' ? <FileText className="w-4 h-4 text-[#D68BF9] mr-2" /> : <PlayCircle className="w-4 h-4 text-[#D68BF9] mr-2" />}
                                <span className="text-white text-sm">{doc.name}</span>
                              </div>
                              <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)} className="text-[#D68BF9] hover:text-white"><Download className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {lesson.hasQuiz && (
                      <div>
                        <h4 className="text-[#D68BF9] text-sm font-semibold mb-2">Quiz Assessment</h4>
                        <div className="bg-[#34137C]/50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <List className="w-4 h-4 text-[#D68BF9] mr-2" /><span className="text-white text-sm">Lesson Quiz</span>
                              {lesson.isQuizCompleted && (<span className="ml-2 text-green-500 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>)}
                            </div>
                            <button onClick={() => handleQuizAction(lesson)} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-3 rounded-full">{lesson.isQuizCompleted ? 'View Result' : 'Start Quiz'}</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {(lesson.documents && lesson.documents.length > 0) ? (
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => handleManualMarkComplete(lesson)} disabled={lesson.isCompleted || isMarkingComplete[lesson.id]} className={`px-4 py-2 text-xs font-medium rounded-full flex items-center transition-all ${lesson.isCompleted ? 'bg-green-500/20 text-green-300 cursor-default' : 'bg-[#BF4BF6] hover:bg-[#D68BF9] text-white disabled:opacity-50'}`}>
                                {lesson.isCompleted ? <><CheckCircle className="w-4 h-4 mr-2" />Completed</> : (isMarkingComplete[lesson.id] ? "Marking..." : "Mark as Completed")}
                            </button>
                        </div>
                    ) : null}
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