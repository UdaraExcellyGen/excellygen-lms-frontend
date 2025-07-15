// import React from 'react';
// import { QuizBank } from '../../QuizCreator/QuizCreator';
// import { useNavigate } from 'react-router-dom';

// interface QuizOverviewPageProps {
//     quizBank: QuizBank;
//     onCloseQuizOverview: () => void;
//     onSaveOverviewQuizDetails: (quizBank: QuizBank) => void;
//     subtopicId: string;
// }

// const QuizOverviewPage: React.FC<QuizOverviewPageProps> = ({ quizBank, onCloseQuizOverview, onSaveOverviewQuizDetails, subtopicId }) => {
//     const navigate = useNavigate();

//     const mockQuizData: QuizBank = {
//         quizDetails: {
//             title: 'Sample Quiz Overview - Mock Data',
//             duration: '30 minutes',
//             bankSize: 5, // Example Quiz Bank Size
//             quizSize: 3,  // Example Quiz Size (smaller than bank size)
//         },
//         questions: [
//             {
//                 id: 'mq1',
//                 questionText: 'Sample Question 1: What is the scientific name of a domestic dog?',
//                 options: ['Felis catus', 'Canis lupus familiaris', 'Panthera leo', 'Bos taurus'],
//                 correctAnswerIndex: 1, // Index of 'Canis lupus familiaris'
//             },
//             {
//                 id: 'mq2',
//                 questionText: 'Sample Question 2: Which planet in our solar system is known as the "Red Planet"?',
//                 options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
//                 correctAnswerIndex: 1, // Index of 'Mars'
//             },
//             {
//                 id: 'mq3',
//                 questionText: 'Sample Question 3: What is the chemical symbol for water?',
//                 options: ['CO2', 'NaCl', 'H2O', 'O2'],
//                 correctAnswerIndex: 2, // Index of 'H2O'
//             },
//             {
//                 id: 'mq4',
//                 questionText: 'Sample Question 4: Mock Question 4',
//                 options: ['Option A', 'Option B', 'Option C', 'Option D'],
//                 correctAnswerIndex: 2, // Index of 'Option C'
//             },
//             {
//                 id: 'mq5',
//                 questionText: 'Sample Question 5: Mock Question 5',
//                 options: ['Option W', 'Option X', 'Option Y', 'Option Z'],
//                 correctAnswerIndex: 3, // Index of 'Option Z'
//             }
//         ],
//         name: 'Sample Quiz Title',
//         bankSize: 5,
//         quizSize: 3,
//         duration: 30,
//     };

//     const currentQuizBank = quizBank || mockQuizData;
//     const quizDetails = currentQuizBank.quizDetails;
//     const questions = currentQuizBank.questions;

//     // Calculate Quiz Bank Size and Quiz Size from QuizDetails
//     const quizBankSize = quizDetails?.bankSize || 0;
//     const quizSize = quizDetails?.quizSize || 0;

//     if (!quizDetails || !questions) {
//         return (
//             <div className="min-h-screen bg-[#52007C] p-6 flex items-center justify-center">
//                 <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
//                     <h2 className="text-xl font-bold mb-4 text-[#1B0A3F]">Quiz Data Not Found</h2>
//                     <p className="text-gray-700">
//                         The quiz data is missing or incomplete.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     const handleBack = () => {
//         onCloseQuizOverview();
//     };

//     const handleNext = () => {
//         onSaveOverviewQuizDetails(currentQuizBank);
//     };

//     return (
//         <div className="fixed inset-0 bg-[#1B0A3F]/40 backdrop-blur-md flex justify-center items-center p-6 z-5">
//             <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col justify-between h-full w-full max-h-[90vh] overflow-y-auto">
//                 <div>
//                     <h1 className="text-2xl font-['Unbounded'] text-[#1B0A3F] mb-2">{quizDetails.title} Overview</h1>
//                     <p className="text-gray-700 font-nunito mb-6">This is an overview of all questions in the quiz bank.</p> {/* Updated description */}

//                     <h2 className="text-xl font-bold mb-6 text-[#1B0A3F]">Quiz Details:</h2>
//                     <div className="mb-6">
//                         <p className="font-semibold text-gray-800 font-nunito">Title: <span className="font-normal">{quizDetails.title}</span></p>
//                         {quizDetails.duration && (
//                             <p className="font-semibold text-gray-800 font-nunito">Duration: <span className="font-normal">{quizDetails.duration} minutes</span></p>
//                         )}
//                         <p className="font-semibold text-gray-800 font-nunito">Quiz Bank Size: <span className="font-normal">{quizBankSize} questions</span>
//                             <span className="text-gray-500 ml-1">(Total questions in the bank)</span></p>
//                         <p className="font-semibold text-gray-800 font-nunito">Quiz Size: <span className="font-normal">{quizSize} questions</span>
//                             <span className="text-gray-500 ml-1">(Number of questions in each quiz attempt)</span></p>
//                     </div>

//                     <h2 className="text-xl font-bold mb-6 text-[#1B0A3F]">All Quiz Questions in Bank (Total: {quizBankSize}):</h2> {/* Updated section header */}
//                     <ol className="list-decimal pl-5">
//                         {questions.map((question, index) => ( // Display ALL questions now, removed .slice()
//                             <li key={question.id} className="mb-8">
//                                 <p className="text-lg text-gray-800 font-nunito mb-2">{question.questionText}</p>
//                                 {question.options && question.options.length > 0 && (
//                                     <ul className="list-disc pl-5 mb-2">
//                                         {question.options.map((option, optionIndex) => (
//                                             <li key={optionIndex} className="text-gray-700 font-nunito">
//                                                 {option}
//                                                 {question.correctAnswerIndex !== null && question.correctAnswerIndex === optionIndex && (
//                                                     <span className="text-green-500 font-semibold ml-2">(Correct Answer)</span>
//                                                 )}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                                 {!question.options && !question.correctAnswerIndex && ( // Changed condition to check for correctAnswerIndex
//                                     <p className="text-gray-500 mt-2">No options or correct answer provided.</p>
//                                 )}
//                             </li>
//                         ))}
//                     </ol>
//                 </div>

//                 <div className="flex justify-between mt-8">
//                     <button
//                         onClick={handleBack}
//                         className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#F6E6FF] hover:text-[#1B0A3F] rounded-lg transition-colors"
//                     >
//                         Back
//                     </button>
//                     <button
//                         onClick={handleNext}
//                         className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold"
//                     >
//                         Save & Close
//                     </button>
//                 </div>
//             </div>
//         </div>


//     );

// };

// export default QuizOverviewPage;