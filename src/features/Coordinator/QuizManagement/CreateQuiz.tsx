// // src/features/Coordinator/QuizManagement/CreateQuiz.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { ArrowLeft, Plus, Save, Trash2, Info } from 'lucide-react';

// import toast from 'react-hot-toast';

// import {
//   QuizCreationState,
//   CreateQuizDto,
//   CreateQuizBankDto,
//   CreateQuizBankQuestionDto,
//   CreateMCQOptionDto
// } from '../../../types/quiz.types';

// import {
//   createQuiz,
//   createQuizBank,
//   addQuestionToBank,
//   getQuizzesByLessonId
// } from '../../../api/services/Course/quizService';

// const CreateQuiz: React.FC = () => {
//   const navigate = useNavigate();
//   const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const courseIdParam = queryParams.get('courseId');
  
//   const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;
//   const courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;

//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isSaving, setIsSaving] = useState<boolean>(false);
//   const [step, setStep] = useState<'details' | 'questions'>('details');
//   const [hasExistingQuiz, setHasExistingQuiz] = useState<boolean>(false);
//   const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);

//   const [quizState, setQuizState] = useState<QuizCreationState>({
//     quizTitle: '',
//     timeLimitMinutes: 15,
//     quizSize: 10,
//     quizBankSize: 10, // Default same as quizSize
//     questions: [],
//     currentQuestionIndex: 0,
//     lessonId: lessonId
//   });

//   // Form validation
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const checkExistingQuiz = async () => {
//       if (!lessonId) {
//         toast.error('No lesson specified');
//         navigate(-1);
//         return;
//       }
      
//       if (!courseId) {
//         toast.error('No course specified');
//         navigate(-1);
//         return;
//       }

//       try {
//         const existingQuizzes = await getQuizzesByLessonId(lessonId);
//         if (existingQuizzes.length > 0) {
//           // If we want to prevent multiple quizzes per lesson
//           setHasExistingQuiz(true);
//           toast.error('This lesson already has a quiz. Only one quiz per lesson is allowed.');
//           navigate(-1);
//         }
//       } catch (error) {
//         console.error('Error checking existing quizzes:', error);
//         toast.error('Failed to check existing quizzes. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkExistingQuiz();
//   }, [lessonId, courseId, navigate]);

//   const validateQuizDetails = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!quizState.quizTitle.trim()) {
//       newErrors.quizTitle = 'Quiz title is required';
//     }

//     if (quizState.timeLimitMinutes < 1 || quizState.timeLimitMinutes > 180) {
//       newErrors.timeLimitMinutes = 'Time limit must be between 1 and 180 minutes';
//     }

//     if (quizState.quizSize < 1 || quizState.quizSize > 100) {
//       newErrors.quizSize = 'Quiz size must be between 1 and 100 questions';
//     }

//     if (quizState.quizBankSize < quizState.quizSize) {
//       newErrors.quizBankSize = 'Question bank size must be at least equal to quiz size';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Helper function to validate a single question
//   const validateQuestion = (question: CreateQuizBankQuestionDto): string | null => {
//     if (!question.questionContent.trim()) {
//       return 'Question content cannot be empty';
//     }
    
//     // Check if at least one option is marked as correct
//     if (!question.options.some(o => o.isCorrect)) {
//       return 'You must select a correct answer';
//     }
    
//     // Check if all option texts are filled
//     const emptyOptionIndex = question.options.findIndex(o => !o.optionText.trim());
//     if (emptyOptionIndex !== -1) {
//       return `Option ${emptyOptionIndex + 1} cannot be empty`;
//     }
    
//     return null; // No errors
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
    
//     // Handle quizBankSize specially
//     if (name === 'quizBankSize') {
//       const newSize = parseInt(value, 10) || 0;
//       const currentQuestions = [...quizState.questions];
      
//       setQuizState(prev => ({
//         ...prev,
//         [name]: newSize,
//         // If reducing bank size, trim questions to match
//         questions: newSize < currentQuestions.length 
//           ? currentQuestions.slice(0, newSize) 
//           : currentQuestions,
//         currentQuestionIndex: Math.min(prev.currentQuestionIndex, newSize - 1)
//       }));
//     } else {
//       setQuizState(prev => ({
//         ...prev,
//         [name]: name === 'quizTitle' ? value : parseInt(value, 10) || 0
//       }));
//     }

//     // Clear error when field is edited
//     if (errors[name]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const handleAddQuestion = () => {
//     // Check if we've reached the question bank limit
//     if (quizState.questions.length >= quizState.quizBankSize) {
//       toast.error(`You can only create ${quizState.quizBankSize} questions for this quiz bank.`);
//       return;
//     }

//     const newQuestion: CreateQuizBankQuestionDto = {
//       questionContent: '',
//       options: [
//         { optionText: '', isCorrect: false },
//         { optionText: '', isCorrect: false },
//         { optionText: '', isCorrect: false },
//         { optionText: '', isCorrect: false }
//       ],
//       questionBankOrder: quizState.questions.length + 1
//     };

//     setQuizState(prev => ({
//       ...prev,
//       questions: [...prev.questions, newQuestion],
//       currentQuestionIndex: prev.questions.length
//     }));
//   };

//   const handleQuestionContentChange = (content: string) => {
//     setQuizState(prev => {
//       const updatedQuestions = [...prev.questions];
//       updatedQuestions[prev.currentQuestionIndex] = {
//         ...updatedQuestions[prev.currentQuestionIndex],
//         questionContent: content
//       };
//       return { ...prev, questions: updatedQuestions };
//     });
//   };

//   const handleOptionChange = (optionIndex: number, content: string) => {
//     setQuizState(prev => {
//       const updatedQuestions = [...prev.questions];
//       const updatedOptions = [...updatedQuestions[prev.currentQuestionIndex].options];
//       updatedOptions[optionIndex] = {
//         ...updatedOptions[optionIndex],
//         optionText: content
//       };
//       updatedQuestions[prev.currentQuestionIndex] = {
//         ...updatedQuestions[prev.currentQuestionIndex],
//         options: updatedOptions
//       };
//       return { ...prev, questions: updatedQuestions };
//     });
//   };

//   const handleCorrectAnswerChange = (optionIndex: number) => {
//     setQuizState(prev => {
//       const updatedQuestions = [...prev.questions];
//       const updatedOptions = updatedQuestions[prev.currentQuestionIndex].options.map((option, index) => ({
//         ...option,
//         isCorrect: index === optionIndex
//       }));
//       updatedQuestions[prev.currentQuestionIndex] = {
//         ...updatedQuestions[prev.currentQuestionIndex],
//         options: updatedOptions
//       };
//       return { ...prev, questions: updatedQuestions };
//     });
//   };

//   const handleRemoveQuestion = () => {
//     if (quizState.questions.length <= 1) {
//       toast.error('Quiz must have at least one question');
//       return;
//     }

//     setQuizState(prev => {
//       const updatedQuestions = prev.questions.filter((_, i) => i !== prev.currentQuestionIndex);
//       // Recalculate question bank order for remaining questions
//       const reorderedQuestions = updatedQuestions.map((q, index) => ({
//         ...q,
//         questionBankOrder: index + 1
//       }));
//       return {
//         ...prev,
//         questions: reorderedQuestions,
//         currentQuestionIndex: Math.min(prev.currentQuestionIndex, reorderedQuestions.length - 1)
//       };
//     });
//   };

//   const handleNavigateToQuestion = (index: number) => {
//     setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
//   };

//   const handleContinueToQuestions = () => {
//     if (validateQuizDetails()) {
//       setStep('questions');
      
//       // If no questions yet, add a default one
//       if (quizState.questions.length === 0) {
//         handleAddQuestion();
//       }
//     }
//   };

//   const handleBackToDetails = () => {
//     setStep('details');
//   };

//   const handleCancel = () => {
//     if (courseId) {
//       navigate(`/coordinator/upload-materials/${courseId}`);
//     } else {
//       navigate(-1);
//     }
//   };

//   const handleSaveQuiz = async () => {
//     if (!validateQuizDetails()) {
//       toast.error('Please fix the errors in quiz details');
//       setStep('details');
//       return;
//     }

//     // Ensure quizSize is not greater than quizBankSize
//     if (quizState.quizSize > quizState.quizBankSize) {
//       toast.error(`Quiz size (${quizState.quizSize}) cannot be greater than quiz bank size (${quizState.quizBankSize})`);
//       return;
//     }

//     // Validate each question individually
//     for (let i = 0; i < quizState.questions.length; i++) {
//       const errorMessage = validateQuestion(quizState.questions[i]);
//       if (errorMessage) {
//         toast.error(`Question ${i + 1}: ${errorMessage}`);
//         setQuizState(prev => ({ ...prev, currentQuestionIndex: i }));
//         return;
//       }
//     }

//     // Check if the number of questions matches the bank size
//     if (quizState.questions.length !== quizState.quizBankSize) {
//       toast.error(`You need exactly ${quizState.quizBankSize} questions, but have ${quizState.questions.length}`);
//       return;
//     }

//     // Prepare sanitized questions first so we can validate them
//     const sanitizedQuestions = quizState.questions.map((q, index) => ({
//       questionContent: q.questionContent.trim(),
//       questionType: "MCQ", 
//       questionBankOrder: index + 1, 
//       options: q.options.map(o => ({
//         optionText: o.optionText.trim(),
//         isCorrect: o.isCorrect
//       }))
//     }));

//     // Verify each question has exactly one correct answer
//     const invalidQuestions = sanitizedQuestions.filter(q => 
//       !q.options.some(o => o.isCorrect)
//     );
    
//     if (invalidQuestions.length > 0) {
//       toast.error(`${invalidQuestions.length} question(s) don't have a correct answer selected`);
//       return;
//     }

//     // Check for empty option text
//     const questionsWithEmptyOptions = sanitizedQuestions.filter(q =>
//       q.options.some(o => !o.optionText.trim())
//     );
    
//     if (questionsWithEmptyOptions.length > 0) {
//       toast.error(`${questionsWithEmptyOptions.length} question(s) have empty option text`);
//       return;
//     }

//     setIsSaving(true);
//     const saveToastId = toast.loading('Creating quiz...');

//     try {
//       // 1. Create quiz
//       const quizDto: CreateQuizDto = {
//         quizTitle: quizState.quizTitle,
//         timeLimitMinutes: quizState.timeLimitMinutes,
//         quizSize: quizState.quizSize,
//         lessonId: lessonId
//       };

//       console.log("Creating quiz with data:", JSON.stringify(quizDto, null, 2));
      
//       const createdQuiz = await createQuiz(quizDto);
//       console.log("Quiz created successfully:", createdQuiz);
//       setCreatedQuizId(createdQuiz.quizId);

//       // Create quiz bank DTO according to expected backend format
//       const quizBankDto: CreateQuizBankDto = {
//         quizBankSize: quizState.quizBankSize,
//         questions: sanitizedQuestions,
//         // Add any other required fields here based on your backend API
//       };

//       // Log the exact payload
//       console.log("Quiz bank creation payload:", JSON.stringify(quizBankDto, null, 2));

//       await createQuizBank(lessonId, quizBankDto);
//       console.log("Quiz bank created successfully");

//       toast.dismiss(saveToastId);
//       toast.success('Quiz created successfully!');
//       navigate(`/coordinator/upload-materials/${courseId}`);

//     } catch (error: any) {
//       console.error('Error saving quiz:', error);
      
//       // Log detailed error information for debugging
//       if (error.response) {
//         console.error("Error status:", error.response.status);
//         console.error("Error data:", error.response.data);
//         console.error("Validation errors:", error.response?.data?.errors); // ASP.NET validation errors
//         console.error("Error headers:", error.response.headers);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error message:", error.message);
//       }
      
//       toast.dismiss(saveToastId);
      
//       // Create a readable error message from validation errors
//       let errorMessage = "Failed to create quiz. ";
//       if (error.response?.data?.errors) {
//         const errorDetails = Object.entries(error.response.data.errors)
//           .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
//           .join('; ');
//         errorMessage += errorDetails;
//       } else {
//         errorMessage = error.response?.data?.message || 'Failed to create quiz. Please try again.';
//       }
      
//       // If we got a quizId but the bank creation failed
//       if (createdQuizId) {
//         toast.error(`Quiz was created but adding questions failed: ${errorMessage}`);
//       } else {
//         toast.error(errorMessage);
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
//       <p className="text-white text-xl">Loading...</p>
//     </div>;
//   }

//   if (hasExistingQuiz) {
//     return null; // We'll navigate away in the useEffect
//   }

//   const canAddMoreQuestions = quizState.questions.length < quizState.quizBankSize;
//   const hasRequiredQuestions = quizState.questions.length === quizState.quizBankSize;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={handleCancel} 
//               className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
//             >
//               <ArrowLeft size={20} className="text-[#1B0A3F]" />
//             </button>
//             <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
//               Create Quiz for Lesson
//             </h1>
//           </div>
//           <div className="flex gap-2">
//             <button 
//               onClick={handleCancel} 
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               disabled={isSaving}
//             >
//               Cancel
//             </button>
//             <button 
//               onClick={handleSaveQuiz} 
//               className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2"
//               disabled={isSaving || !hasRequiredQuestions}
//             >
//               <Save size={16} />
//               {isSaving ? 'Saving...' : 'Save Quiz'}
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex mb-4">
//           <button 
//             className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'details' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
//             onClick={() => setStep('details')}
//           >
//             Quiz Details
//           </button>
//           <button 
//             className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'questions' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
//             onClick={() => step === 'questions' ? null : handleContinueToQuestions()}
//           >
//             Questions ({quizState.questions.length}/{quizState.quizBankSize})
//           </button>
//         </div>

//         {/* Question count warning */}
//         {step === 'questions' && !hasRequiredQuestions && (
//           <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
//             <div className="flex items-start">
//               <Info className="text-yellow-500 mr-2 flex-shrink-0" size={20} />
//               <p className="text-yellow-800 text-sm">
//                 You must create exactly {quizState.quizBankSize} questions for this quiz bank. 
//                 {quizState.questions.length < quizState.quizBankSize 
//                   ? ` Add ${quizState.quizBankSize - quizState.questions.length} more question(s).` 
//                   : ` Remove ${quizState.questions.length - quizState.quizBankSize} question(s).`}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
//           {step === 'details' ? (
//             // Quiz Details Form
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-white mb-2">Quiz Title</label>
//                 <input
//                   type="text"
//                   name="quizTitle"
//                   value={quizState.quizTitle}
//                   onChange={handleInputChange}
//                   className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizTitle ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
//                   placeholder="Enter quiz title"
//                 />
//                 {errors.quizTitle && <p className="text-red-500 mt-1">{errors.quizTitle}</p>}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-white mb-2">Time Limit (minutes)</label>
//                   <input
//                     type="number"
//                     name="timeLimitMinutes"
//                     value={quizState.timeLimitMinutes}
//                     onChange={handleInputChange}
//                     className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
//                     min="1"
//                     max="180"
//                   />
//                   {errors.timeLimitMinutes && <p className="text-red-500 mt-1">{errors.timeLimitMinutes}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-white mb-2">Quiz Size (questions shown)</label>
//                   <input
//                     type="number"
//                     name="quizSize"
//                     value={quizState.quizSize}
//                     onChange={handleInputChange}
//                     className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
//                     min="1"
//                     max="100"
//                   />
//                   {errors.quizSize && <p className="text-red-500 mt-1">{errors.quizSize}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-white mb-2">Question Bank Size</label>
//                   <input
//                     type="number"
//                     name="quizBankSize"
//                     value={quizState.quizBankSize}
//                     onChange={handleInputChange}
//                     className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizBankSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
//                     min={quizState.quizSize}
//                   />
//                   {errors.quizBankSize && <p className="text-red-500 mt-1">{errors.quizBankSize}</p>}
//                 </div>
//               </div>

//               <div className="bg-[#34137C]/50 rounded-lg p-4 border border-[#BF4BF6]/30 text-white">
//                 <h3 className="text-[#D68BF9] font-semibold mb-2">About Quiz Banks</h3>
//                 <p className="text-sm">
//                   The quiz bank lets you create a larger set of questions, from which a random subset will be chosen
//                   each time a learner takes the quiz. This helps prevent memorization and encourages deeper understanding
//                   of the material.
//                 </p>
//                 <p className="text-sm mt-2">
//                   <strong>Note:</strong> You must create exactly the number of questions specified in the "Question Bank Size" field.
//                 </p>
//               </div>

//               <div className="flex justify-end mt-4">
//                 <button
//                   onClick={handleContinueToQuestions}
//                   className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-lg transition-colors"
//                 >
//                   Continue to Questions
//                 </button>
//               </div>
//             </div>
//           ) : (
//             // Questions Form
//             <div>
//               {/* Question Navigation */}
//               <div className="flex mb-4 flex-wrap gap-2 items-center">
//                 {quizState.questions.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleNavigateToQuestion(index)}
//                     className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                       quizState.currentQuestionIndex === index
//                         ? 'bg-[#BF4BF6] text-white'
//                         : 'bg-[#34137C] text-[#D68BF9]'
//                     }`}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}
//                 {canAddMoreQuestions && (
//                   <button
//                     onClick={handleAddQuestion}
//                     className="w-10 h-10 rounded-full bg-[#34137C] text-[#D68BF9] flex items-center justify-center"
//                     title="Add new question"
//                   >
//                     <Plus size={16} />
//                   </button>
//                 )}
//                 {!canAddMoreQuestions && (
//                   <span className="text-xs text-gray-300 ml-2">Maximum questions reached</span>
//                 )}
//               </div>

//               {/* Current Question */}
//               {quizState.questions.length > 0 && (
//                 <div className="bg-[#34137C]/60 rounded-lg p-6 mb-4">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-white font-semibold">Question {quizState.currentQuestionIndex + 1}</h3>
//                     <button
//                       onClick={handleRemoveQuestion}
//                       className="text-red-400 hover:text-red-500"
//                       disabled={quizState.questions.length <= 1}
//                       title="Remove this question"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-white mb-2">Question Content</label>
//                     <textarea
//                       value={quizState.questions[quizState.currentQuestionIndex]?.questionContent || ''}
//                       onChange={(e) => handleQuestionContentChange(e.target.value)}
//                       className="w-full p-3 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30"
//                       rows={3}
//                       placeholder="Enter your question here"
//                     />
//                   </div>

//                   <div className="space-y-3">
//                     <label className="block text-white mb-2">Answer Options (select the correct one)</label>
//                     {quizState.questions[quizState.currentQuestionIndex]?.options.map((option, optionIndex) => (
//                       <div key={optionIndex} className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => handleCorrectAnswerChange(optionIndex)}
//                           className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center border ${
//                             option.isCorrect
//                               ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white'
//                               : 'border-[#BF4BF6]/50 bg-transparent'
//                           }`}
//                         >
//                           {option.isCorrect && '✓'}
//                         </button>
//                         <input
//                           type="text"
//                           value={option.optionText}
//                           onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
//                           className="flex-1 p-2 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30"
//                           placeholder={`Option ${optionIndex + 1}`}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-between mt-4">
//                 <button
//                   onClick={handleBackToDetails}
//                   className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors"
//                 >
//                   Back to Details
//                 </button>
//                 <button
//                   onClick={handleSaveQuiz}
//                   className={`px-5 py-2 ${hasRequiredQuestions ? 'bg-[#BF4BF6] hover:bg-[#D68BF9]' : 'bg-gray-500 cursor-not-allowed'} text-white rounded-lg transition-colors flex items-center gap-2`}
//                   disabled={isSaving || !hasRequiredQuestions}
//                 >
//                   <Save size={16} />
//                   {isSaving ? 'Saving...' : 'Save Quiz'}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateQuiz;
// src/features/Coordinator/QuizManagement/CreateQuiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Info } from 'lucide-react';

import toast from 'react-hot-toast';

import {
  QuizCreationState,
  CreateQuizDto,
  CreateQuizBankDto,
  CreateQuizBankQuestionDto,
} from '../../../types/quiz.types';

import {
  createQuiz,
  createQuizBank,
  getQuizzesByLessonId
} from '../../../api/services/Course/quizService';

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Get params and the source page for navigation
  const courseIdParam = queryParams.get('courseId');
  const sourcePage = queryParams.get('source'); // This is the key for navigation

  const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [step, setStep] = useState<'details' | 'questions'>('details');
  const [hasExistingQuiz, setHasExistingQuiz] = useState<boolean>(false);
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);

  const [quizState, setQuizState] = useState<QuizCreationState>({
    quizTitle: '',
    timeLimitMinutes: 15,
    quizSize: 10,
    quizBankSize: 10,
    questions: [],
    currentQuestionIndex: 0,
    lessonId: lessonId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Correct and centralized navigation logic
  const handleBackNavigation = useCallback(() => {
    if (!courseId) {
      navigate(-1); // Safe fallback
      return;
    }

    if (sourcePage === 'course-view') {
      // If coming from course view, go back there
      navigate(`/coordinator/course-view/${courseId}`);
    } else if (sourcePage === 'publish-course') {
      // If coming from publish page, go back there
      navigate(`/coordinator/publish-course/${courseId}`);
    }
    else {
      // Default to the upload materials page
      navigate(`/coordinator/upload-materials/${courseId}`);
    }
  }, [navigate, courseId, sourcePage]); // Dependencies ensure the function is always fresh

  useEffect(() => {
    const checkExistingQuiz = async () => {
      if (!lessonId || !courseId) {
        toast.error('Required IDs are missing from the URL.');
        navigate(-1);
        return;
      }

      try {
        const existingQuizzes = await getQuizzesByLessonId(lessonId);
        if (existingQuizzes.length > 0) {
          setHasExistingQuiz(true);
          toast.error('This lesson already has a quiz. Only one quiz per lesson is allowed.');
          handleBackNavigation(); // Use the corrected back navigation
        }
      } catch (error) {
        console.error('Error checking existing quizzes:', error);
        toast.error('Failed to check existing quizzes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingQuiz();
  }, [lessonId, courseId, handleBackNavigation]);


  const validateQuizDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!quizState.quizTitle.trim()) newErrors.quizTitle = 'Quiz title is required';
    if (quizState.timeLimitMinutes < 1 || quizState.timeLimitMinutes > 180) newErrors.timeLimitMinutes = 'Time limit must be between 1 and 180 minutes';
    if (quizState.quizSize < 1 || quizState.quizSize > 100) newErrors.quizSize = 'Quiz size must be between 1 and 100 questions';
    if (quizState.quizBankSize < quizState.quizSize) newErrors.quizBankSize = 'Question bank size must be at least equal to quiz size';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateQuestion = (question: CreateQuizBankQuestionDto): string | null => {
    if (!question.questionContent.trim()) return 'Question content cannot be empty';
    if (!question.options.some(o => o.isCorrect)) return 'You must select a correct answer';
    const emptyOptionIndex = question.options.findIndex(o => !o.optionText.trim());
    if (emptyOptionIndex !== -1) return `Option ${emptyOptionIndex + 1} cannot be empty`;
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quizBankSize') {
      const newSize = parseInt(value, 10) || 0;
      setQuizState(prev => ({
        ...prev,
        [name]: newSize,
        questions: newSize < prev.questions.length ? prev.questions.slice(0, newSize) : prev.questions,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex, Math.max(0, newSize - 1))
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        [name]: name === 'quizTitle' ? value : parseInt(value, 10) || 0
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleAddQuestion = () => {
    if (quizState.questions.length >= quizState.quizBankSize) {
      toast.error(`You can only create ${quizState.quizBankSize} questions for this quiz bank.`);
      return;
    }
    const newQuestion: CreateQuizBankQuestionDto = {
      questionContent: '',
      options: [
        { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }
      ],
      questionBankOrder: quizState.questions.length + 1
    };
    setQuizState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      currentQuestionIndex: prev.questions.length
    }));
  };

  const handleQuestionContentChange = (content: string) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      if (updatedQuestions[prev.currentQuestionIndex]) {
        updatedQuestions[prev.currentQuestionIndex].questionContent = content;
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (optionIndex: number, content: string) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      if (updatedQuestions[prev.currentQuestionIndex]) {
        updatedQuestions[prev.currentQuestionIndex].options[optionIndex].optionText = content;
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleCorrectAnswerChange = (optionIndex: number) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      if (updatedQuestions[prev.currentQuestionIndex]) {
        const updatedOptions = updatedQuestions[prev.currentQuestionIndex].options.map((option, index) => ({
          ...option, isCorrect: index === optionIndex
        }));
        updatedQuestions[prev.currentQuestionIndex].options = updatedOptions;
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveQuestion = () => {
    if (quizState.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuizState(prev => {
      const reorderedQuestions = prev.questions
        .filter((_, i) => i !== prev.currentQuestionIndex)
        .map((q, index) => ({ ...q, questionBankOrder: index + 1 }));
      return {
        ...prev,
        questions: reorderedQuestions,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex, reorderedQuestions.length - 1)
      };
    });
  };
  
  const handleNavigateToQuestion = (index: number) => {
    setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
  };

  const handleContinueToQuestions = () => {
    if (validateQuizDetails()) {
      setStep('questions');
      if (quizState.questions.length === 0) {
        handleAddQuestion();
      }
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
  };

  const handleSaveQuiz = async () => {
    if (!validateQuizDetails()) {
      setStep('details');
      toast.error('Please fix the errors in quiz details');
      return;
    }
    if (quizState.questions.length !== quizState.quizBankSize) {
      toast.error(`You need exactly ${quizState.quizBankSize} questions, but have ${quizState.questions.length}`);
      return;
    }
    for (let i = 0; i < quizState.questions.length; i++) {
      const errorMessage = validateQuestion(quizState.questions[i]);
      if (errorMessage) {
        toast.error(`Question ${i + 1}: ${errorMessage}`);
        setQuizState(prev => ({ ...prev, currentQuestionIndex: i }));
        return;
      }
    }

    const sanitizedQuestions = quizState.questions.map((q, index) => ({
      questionContent: q.questionContent.trim(),
      questionType: "MCQ", 
      questionBankOrder: index + 1, 
      options: q.options.map(o => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect }))
    }));

    setIsSaving(true);
    const saveToastId = toast.loading('Creating quiz...');

    try {
      const quizDto: CreateQuizDto = {
        quizTitle: quizState.quizTitle, timeLimitMinutes: quizState.timeLimitMinutes,
        quizSize: quizState.quizSize, lessonId: lessonId
      };
      const createdQuiz = await createQuiz(quizDto);
      setCreatedQuizId(createdQuiz.quizId);

      const quizBankDto: CreateQuizBankDto = {
        quizBankSize: quizState.quizBankSize, questions: sanitizedQuestions,
      };
      await createQuizBank(lessonId, quizBankDto);

      toast.dismiss(saveToastId);
      toast.success('Quiz created successfully!');
      handleBackNavigation(); // Use flexible navigation on success

    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.dismiss(saveToastId);
      const errorMessage = error.response?.data?.message || 'Failed to create quiz. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center"><p className="text-white text-xl">Loading...</p></div>;
  }

  const hasRequiredQuestions = quizState.questions.length === quizState.quizBankSize;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackNavigation} // Correctly wired
              className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-[#1B0A3F]" />
            </button>
            <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">Create Quiz</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleBackNavigation} // Correctly wired
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveQuiz} 
              className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2"
              disabled={isSaving || !hasRequiredQuestions}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>

        <div className="flex mb-4">
          <button 
            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'details' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
            onClick={() => setStep('details')}
          >
            Quiz Details
          </button>
          <button 
            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'questions' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
            onClick={() => step === 'questions' ? null : handleContinueToQuestions()}
          >
            Questions ({quizState.questions.length}/{quizState.quizBankSize})
          </button>
        </div>

        {step === 'questions' && !hasRequiredQuestions && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
            <div className="flex items-start">
              <Info className="text-yellow-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-yellow-800 text-sm">
                You must create exactly {quizState.quizBankSize} questions for this quiz bank. 
                {quizState.questions.length < quizState.quizBankSize 
                  ? ` Add ${quizState.quizBankSize - quizState.questions.length} more question(s).` 
                  : ` Remove ${quizState.questions.length - quizState.quizBankSize} question(s).`}
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
          {step === 'details' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Quiz Title</label>
                <input type="text" name="quizTitle" value={quizState.quizTitle} onChange={handleInputChange} className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizTitle ? 'border-red-500' : 'border-[#BF4BF6]/30'}`} placeholder="Enter quiz title" />
                {errors.quizTitle && <p className="text-red-500 mt-1">{errors.quizTitle}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2">Time Limit (minutes)</label>
                  <input type="number" name="timeLimitMinutes" value={quizState.timeLimitMinutes} onChange={handleInputChange} className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#BF4BF6]/30'}`} min="1" max="180" />
                  {errors.timeLimitMinutes && <p className="text-red-500 mt-1">{errors.timeLimitMinutes}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Quiz Size (questions shown)</label>
                  <input type="number" name="quizSize" value={quizState.quizSize} onChange={handleInputChange} className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`} min="1" max="100" />
                  {errors.quizSize && <p className="text-red-500 mt-1">{errors.quizSize}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Question Bank Size</label>
                  <input type="number" name="quizBankSize" value={quizState.quizBankSize} onChange={handleInputChange} className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizBankSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`} min={quizState.quizSize} />
                  {errors.quizBankSize && <p className="text-red-500 mt-1">{errors.quizBankSize}</p>}
                </div>
              </div>
              <div className="bg-[#34137C]/50 rounded-lg p-4 border border-[#BF4BF6]/30 text-white">
                <h3 className="text-[#D68BF9] font-semibold mb-2">About Quiz Banks</h3>
                <p className="text-sm">The quiz bank lets you create a larger set of questions, from which a random subset will be chosen each time a learner takes the quiz.</p>
                <p className="text-sm mt-2"><strong>Note:</strong> You must create exactly the number of questions specified in the "Question Bank Size" field.</p>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleContinueToQuestions} className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-lg transition-colors">Continue to Questions</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex mb-4 flex-wrap gap-2 items-center">
                {quizState.questions.map((_, index) => (
                  <button key={index} onClick={() => handleNavigateToQuestion(index)} className={`w-10 h-10 rounded-full flex items-center justify-center ${quizState.currentQuestionIndex === index ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}>{index + 1}</button>
                ))}
                {hasRequiredQuestions ? null : (
                  <button onClick={handleAddQuestion} className="w-10 h-10 rounded-full bg-[#34137C] text-[#D68BF9] flex items-center justify-center" title="Add new question"><Plus size={16} /></button>
                )}
              </div>

              {quizState.questions.length > 0 && quizState.questions[quizState.currentQuestionIndex] && (
                <div className="bg-[#34137C]/60 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Question {quizState.currentQuestionIndex + 1}</h3>
                    <button onClick={handleRemoveQuestion} className="text-red-400 hover:text-red-500" disabled={quizState.questions.length <= 1} title="Remove this question"><Trash2 size={16} /></button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2">Question Content</label>
                    <textarea value={quizState.questions[quizState.currentQuestionIndex].questionContent} onChange={(e) => handleQuestionContentChange(e.target.value)} className="w-full p-3 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30" rows={3} placeholder="Enter your question here" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-white mb-2">Answer Options (select the correct one)</label>
                    {quizState.questions[quizState.currentQuestionIndex].options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <button type="button" onClick={() => handleCorrectAnswerChange(optionIndex)} className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center border ${option.isCorrect ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white' : 'border-[#BF4BF6]/50 bg-transparent'}`}>{option.isCorrect && '✓'}</button>
                        <input type="text" value={option.optionText} onChange={(e) => handleOptionChange(optionIndex, e.target.value)} className="flex-1 p-2 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30" placeholder={`Option ${optionIndex + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <button onClick={handleBackToDetails} className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors">Back to Details</button>
                <button onClick={handleSaveQuiz} className={`px-5 py-2 ${hasRequiredQuestions ? 'bg-[#BF4BF6] hover:bg-[#D68BF9]' : 'bg-gray-500 cursor-not-allowed'} text-white rounded-lg transition-colors flex items-center gap-2`} disabled={isSaving || !hasRequiredQuestions}><Save size={16} />{isSaving ? 'Saving...' : 'Save Quiz'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;