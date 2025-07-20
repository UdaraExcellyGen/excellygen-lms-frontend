// // src/features/Coordinator/LessonQuizzes/QuizResultsCoordinator.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowLeft, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
// import toast from 'react-hot-toast';

// import { QuizAttemptDto } from '../../../types/quiz.types';
// import { getQuizAttempts } from '../../../api/services/Course/quizService';

// const QuizResultsCoordinator: React.FC = () => {
//   const navigate = useNavigate();
//   const { quizId: quizIdParam } = useParams<{ quizId: string }>();
//   const quizId = quizIdParam ? parseInt(quizIdParam, 10) : 0;

//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [attempts, setAttempts] = useState<QuizAttemptDto[]>([]);
//   const [quizTitle, setQuizTitle] = useState<string>('');

//   useEffect(() => {
//     const fetchAttempts = async () => {
//       if (!quizId) {
//         toast.error('No quiz specified');
//         navigate(-1);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const fetchedAttempts = await getQuizAttempts(quizId);
//         setAttempts(fetchedAttempts);
        
//         if (fetchedAttempts.length > 0) {
//           setQuizTitle(fetchedAttempts[0].quizTitle);
//         }
//       } catch (error) {
//         console.error('Error fetching quiz attempts:', error);
//         toast.error('Failed to load quiz results. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAttempts();
//   }, [quizId, navigate]);

//   const handleViewAttemptDetails = (attemptId: number) => {
//     navigate(`/coordinator/quiz-attempt/${attemptId}`);
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
//         <p className="text-white text-xl">Loading quiz results...</p>
//       </div>
//     );
//   }

//   // Calculate statistics
//   const completedAttempts = attempts.filter(a => a.isCompleted);
//   const averageScore = completedAttempts.length > 0
//     ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
//     : 0;
//   const passRate = completedAttempts.length > 0
//     ? Math.round((completedAttempts.filter(a => (a.score || 0) >= 70).length / completedAttempts.length) * 100)
//     : 0;

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
//               Quiz Results: {quizTitle}
//             </h1>
//           </div>
//         </div>
        
//         {/* Statistics */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 mb-6">
//           <h2 className="text-white text-xl mb-4">Quiz Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-[#34137C]/60 rounded-lg p-4">
//               <p className="text-gray-300 text-sm">Attempts</p>
//               <p className="text-white text-2xl">{attempts.length}</p>
//             </div>
            
//             <div className="bg-[#34137C]/60 rounded-lg p-4">
//               <p className="text-gray-300 text-sm">Average Score</p>
//               <p className="text-white text-2xl">{averageScore}%</p>
//             </div>
            
//             <div className="bg-[#34137C]/60 rounded-lg p-4">
//               <p className="text-gray-300 text-sm">Pass Rate</p>
//               <p className="text-white text-2xl">{passRate}%</p>
//             </div>
//           </div>
//         </div>
        
//         {/* Attempt List */}
//         <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
//           <h2 className="text-white text-xl mb-4">Learner Attempts</h2>
          
//           {attempts.length === 0 ? (
//             <div className="bg-[#34137C]/50 rounded-lg p-8 text-center">
//               <p className="text-gray-300">No attempts for this quiz yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-white">
//                 <thead className="text-left border-b border-[#BF4BF6]/30">
//                   <tr>
//                     <th className="p-3">Learner</th>
//                     <th className="p-3">Date</th>
//                     <th className="p-3">Score</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {attempts.map(attempt => (
//                     <tr key={attempt.quizAttemptId} className="border-b border-[#BF4BF6]/10 hover:bg-[#34137C]/30">
//                       <td className="p-3 flex items-center gap-2">
//                         <User size={16} className="text-[#D68BF9]" />
//                         <span>Learner {attempt.quizAttemptId}</span>
//                       </td>
//                       <td className="p-3">
//                         <div className="flex items-center gap-2">
//                           <Calendar size={16} className="text-[#D68BF9]" />
//                           <span>{new Date(attempt.startTime).toLocaleDateString()}</span>
//                         </div>
//                       </td>
//                       <td className="p-3">
//                         {attempt.isCompleted ? (
//                           <span>{attempt.score}%</span>
//                         ) : (
//                           <span className="text-yellow-400">In Progress</span>
//                         )}
//                       </td>
//                       <td className="p-3">
//                         {attempt.isCompleted ? (
//                           attempt.score && attempt.score >= 70 ? (
//                             <div className="flex items-center gap-2 text-green-400">
//                               <CheckCircle size={16} />
//                               <span>Passed</span>
//                             </div>
//                           ) : (
//                             <div className="flex items-center gap-2 text-red-400">
//                               <XCircle size={16} />
//                               <span>Failed</span>
//                             </div>
//                           )
//                         ) : (
//                           <span className="text-yellow-400">Incomplete</span>
//                         )}
//                       </td>
//                       <td className="p-3">
//                         {attempt.isCompleted && (
//                           <button
//                             onClick={() => handleViewAttemptDetails(attempt.quizAttemptId)}
//                             className="px-3 py-1 bg-[#34137C] text-[#D68BF9] rounded-lg hover:bg-[#34137C]/80 transition-colors text-sm"
//                           >
//                             View Details
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizResultsCoordinator;