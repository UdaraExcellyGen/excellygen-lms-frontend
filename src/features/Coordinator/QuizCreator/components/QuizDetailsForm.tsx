// import React from 'react';
// import { HelpCircle, Ban, ChevronDown } from 'lucide-react';
// import { QuizDetails } from '../types/types';

// interface QuizDetailsFormProps {
//     quizDetails: QuizDetails;
//     errors: Record<string, string>;
//     handleQuizDetailsChange: (field: keyof QuizDetails, value: string) => void;
//     onCancel: () => void;
//     onContinueToQuestions: () => void;
// }

// const QuizDetailsForm: React.FC<QuizDetailsFormProps> = ({
//     quizDetails,
//     errors,
//     handleQuizDetailsChange,
//     onCancel,
//     onContinueToQuestions
// }) => {
//     return (
//         <div className="px-4 sm:px-6 py-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Title */}
//                 <div className="col-span-full">
//                     <label htmlFor="quiz-title" className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
//                         Quiz Title <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                         id="quiz-title"
//                         type="text"
//                         value={quizDetails.title}
//                         onChange={e => handleQuizDetailsChange('title', e.target.value)}
//                         placeholder="Enter a clear title for this quiz"
//                         className={`w-full bg-[#34137C]/60 text-white rounded-md border ${
//                             errors.title ? 'border-red-500' : 'border-[#BF4BF6]/30'
//                         } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors font-nunito`}
//                     />
//                     {errors.title && (
//                         <p className="mt-1 text-red-400 text-sm font-nunito">{errors.title}</p>
//                     )}
//                 </div>

//                 {/* Bank Size */}
//                 <div>
//                     <label htmlFor="bank-size" className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
//                         Question Bank Size <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                         <input
//                             id="bank-size"
//                             type="number"
//                             value={quizDetails.bankSize}
//                             onChange={e => handleQuizDetailsChange('bankSize', e.target.value)}
//                             min="1"
//                             placeholder="20"
//                             className={`w-full bg-[#34137C]/60 text-white rounded-md border ${
//                                 errors.bankSize ? 'border-red-500' : 'border-[#BF4BF6]/30'
//                             } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors font-nunito`}
//                         />
//                     </div>
//                     {errors.bankSize ? (
//                         <p className="mt-1 text-red-400 text-sm font-nunito">{errors.bankSize}</p>
//                     ) : (
//                         <p className="mt-1 text-[#D68BF9]/70 text-xs font-nunito">
//                             Total number of questions in the bank
//                         </p>
//                     )}
//                 </div>

//                 {/* Quiz Size */}
//                 <div>
//                     <label htmlFor="quiz-size" className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
//                         Quiz Size <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                         id="quiz-size"
//                         type="number"
//                         value={quizDetails.quizSize}
//                         onChange={e => handleQuizDetailsChange('quizSize', e.target.value)}
//                         min="1"
//                         placeholder="10"
//                         className={`w-full bg-[#34137C]/60 text-white rounded-md border ${
//                             errors.quizSize ? 'border-red-500' : 'border-[#BF4BF6]/30'
//                         } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors font-nunito`}
//                     />
//                     {errors.quizSize ? (
//                         <p className="mt-1 text-red-400 text-sm font-nunito">{errors.quizSize}</p>
//                     ) : (
//                         <p className="mt-1 text-[#D68BF9]/70 text-xs font-nunito">
//                             Number of questions shown to learners
//                         </p>
//                     )}
//                 </div>

//                 {/* Duration */}
//                 <div>
//                     <label htmlFor="duration" className="block text-[#D68BF9] mb-2 text-sm font-medium font-nunito">
//                         Time Duration (minutes) <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                         id="duration"
//                         type="number"
//                         value={quizDetails.duration}
//                         onChange={e => handleQuizDetailsChange('duration', e.target.value)}
//                         min="1"
//                         placeholder="15"
//                         className={`w-full bg-[#34137C]/60 text-white rounded-md border ${
//                             errors.duration ? 'border-red-500' : 'border-[#BF4BF6]/30'
//                         } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-colors font-nunito`}
//                     />
//                     {errors.duration && (
//                         <p className="mt-1 text-red-400 text-sm font-nunito">{errors.duration}</p>
//                     )}
//                 </div>
//             </div>

//             {/* Info Box */}
//             <div className="bg-[#34137C]/50 rounded-lg p-4 border border-[#BF4BF6]/30">
//                 <div className="flex items-start gap-3">
//                     <HelpCircle className="w-5 h-5 text-[#D68BF9] flex-shrink-0 mt-1" />
//                     <div>
//                         <h3 className="text-[#D68BF9] font-semibold mb-2 text-sm font-unbounded">How Quiz Banks Work</h3>
//                         <p className="text-white/90 text-sm leading-relaxed font-nunito">
//                             The quiz bank lets you create a larger set of questions, from which a random subset will be chosen
//                             each time a learner takes the quiz. This helps prevent memorization and encourages deeper understanding
//                             of the material.
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* Navigation Buttons */}
//             <div className="flex justify-between mt-8 pt-4 border-t border-[#BF4BF6]/30">
//                 <button
//                     onClick={onCancel}
//                     className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-full hover:bg-[#BF4BF6]/10 transition-colors text-sm font-medium font-nunito flex items-center"
//                 >
//                     <Ban className="w-4 h-4 mr-2" />
//                     Cancel
//                 </button>

//                 <button
//                     onClick={onContinueToQuestions}
//                     className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] rounded-full transition-colors text-sm font-bold font-nunito flex items-center"
//                 >
//                     Continue to Questions
//                     <ChevronDown className="w-4 h-4 ml-2" />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default QuizDetailsForm;