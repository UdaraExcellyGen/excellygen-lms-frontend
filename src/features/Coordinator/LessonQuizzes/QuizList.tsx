// // src/features/Coordinator/LessonQuizzes/QuizList.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowLeft, Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
// import toast from 'react-hot-toast';

// import { QuizDto } from '../../../types/quiz.types';
// import { getQuizzesByLessonId, deleteQuiz } from '../../../api/services/Course/quizService';

// const QuizList: React.FC = () => {
//   const navigate = useNavigate();
//   const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
//   const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;

//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
//   const [isDeleting, setIsDeleting] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchQuizzes = async () => {
//       if (!lessonId) {
//         toast.error('No lesson specified');
//         navigate(-1);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const fetchedQuizzes = await getQuizzesByLessonId(lessonId);
//         setQuizzes(fetchedQuizzes);
//       } catch (error) {
//         console.error('Error fetching quizzes:', error);
//         toast.error('Failed to load quizzes. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuizzes();
//   }, [lessonId, navigate]);

//   const handleCreateQuiz = () => {
//     navigate(`/coordinator/create-quiz/${lessonId}`);
//   };

//   const handleEditQuiz = (quizId: number) => {
//     navigate(`/coordinator/edit-quiz/${quizId}`);
//   };

//   const handleViewResults = (quizId: number) => {
//     navigate(`/coordinator/quiz-results/${quizId}`);
//   };

//   const handleDeleteQuiz = async (quizId: number, quizTitle: string) => {
//     if (!window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
//       return;
//     }

//     setIsDeleting(true);
//     try {
//       await deleteQuiz(quizId);
//       setQuizzes(prev => prev.filter(quiz => quiz.quizId !== quizId));
//       toast.success('Quiz deleted successfully');
//     } catch (error) {
//       console.error('Error deleting quiz:', error);
//       toast.error('Failed to delete quiz. Please try again.');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
//         <p className="text-white text-xl">Loading quizzes...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#52007C] p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={handleGoBack} 
//               className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
//             >
//               <ArrowLeft size={20} className="text-[#1B0A3F]" />
//             </button>
//             <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
//               Lesson Quizzes
//             </h1>
//           </div>
//           <button 
//             onClick={handleCreateQuiz}
//             disabled={isDeleting || quizzes.length > 0} // Limit to one quiz per lesson
//             className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
//               isDeleting || quizzes.length > 0 
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                 : 'bg-[#BF4BF6] text-white hover:bg-[#D68BF9]'
//             }`}
//           >
//             <Plus size={16} />
//             Create Quiz
//           </button>
//         </div>

//         {/* Quiz List */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
//           <h2 className="text-white text-xl mb-4">Available Quizzes</h2>
          
//           {quizzes.length === 0 ? (
//             <div className="bg-[#34137C]/50 rounded-lg p-8 text-center">
//               <p className="text-gray-300 mb-4">No quizzes available for this lesson.</p>
//               <button 
//                 onClick={handleCreateQuiz}
//                 className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2 mx-auto"
//               >
//                 <Plus size={16} />
//                 Create Your First Quiz
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {quizzes.map(quiz => (
//                 <div key={quiz.quizId} className="bg-[#34137C]/60 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
//                   <div>
//                     <h3 className="text-white font-semibold">{quiz.quizTitle}</h3>
//                     <div className="flex gap-4 text-sm text-gray-300 mt-1">
//                       <p>{quiz.quizSize} questions</p>
//                       <p>{quiz.timeLimitMinutes} minutes</p>
//                     </div>
//                   </div>
                  
//                   <div className="flex gap-2">
//                     <button 
//                       onClick={() => handleViewResults(quiz.quizId)}
//                       className="p-2 bg-[#34137C] text-[#D68BF9] rounded-lg hover:bg-[#34137C]/80 transition-colors"
//                       title="View Results"
//                     >
//                       <BarChart3 size={16} />
//                     </button>
//                     <button 
//                       onClick={() => handleEditQuiz(quiz.quizId)}
//                       className="p-2 bg-[#34137C] text-[#D68BF9] rounded-lg hover:bg-[#34137C]/80 transition-colors"
//                       title="Edit Quiz"
//                     >
//                       <Edit size={16} />
//                     </button>
//                     <button 
//                       onClick={() => handleDeleteQuiz(quiz.quizId, quiz.quizTitle)}
//                       disabled={isDeleting}
//                       className="p-2 bg-[#34137C] text-red-400 rounded-lg hover:bg-[#34137C]/80 transition-colors"
//                       title="Delete Quiz"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizList;