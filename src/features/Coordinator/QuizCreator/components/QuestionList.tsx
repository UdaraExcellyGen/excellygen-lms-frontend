// import React from 'react';
// import { Plus } from 'lucide-react';
// import { Question } from '../types/types';
// import QuestionForm from './QuestionForm';

// interface QuestionListProps {
//     questions: Question[];
//     expandedQuestions: Record<number, boolean>;
//     activeQuestionIndex: number;
//     isQuestionValid: (question: Question) => boolean;
//     onAddQuestion: () => void;
//     onToggleQuestionExpansion: (index: number) => void;
//     onQuestionTextChange: (index: number, value: string) => void;
//     onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
//     onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
//     onAddOption: (questionIndex: number) => void;
//     onRemoveOption: (questionIndex: number, optionIndex: number) => void;
//     onRemoveQuestion: (questionIndex: number) => void;
// }

// const QuestionList: React.FC<QuestionListProps> = ({
//     questions,
//     expandedQuestions,
//     activeQuestionIndex,
//     isQuestionValid,
//     onAddQuestion,
//     onToggleQuestionExpansion,
//     onQuestionTextChange,
//     onOptionChange,
//     onCorrectAnswerChange,
//     onAddOption,
//     onRemoveOption,
//     onRemoveQuestion
// }) => {
//     return (
//         <div className="px-4 sm:px-6 py-6">
//             {/* Question Navigation */}
//             <div className="flex justify-between items-center mb-5">
//                 <h2 className="text-[#D68BF9] font-semibold text-lg font-unbounded">Quiz Questions</h2>

//                 <button
//                     onClick={onAddQuestion}
//                     className="flex items-center gap-2 px-4 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] rounded-full transition-colors text-sm font-bold font-nunito"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Add Question
//                 </button>
//             </div>

//             <div className="space-y-3 mb-6 max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
//                 {/* Questions List */}
//                 {questions.length === 0 ? (
//                     <div className="bg-[#34137C]/50 rounded-lg p-8 border border-[#BF4BF6]/30 text-center">
//                         <p className="text-[#D68BF9] mb-4 font-nunito">No questions added yet</p>
//                         <button
//                             onClick={onAddQuestion}
//                             className="px-4 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] rounded-full transition-colors text-sm font-bold font-nunito"
//                         >
//                             Add Your First Question
//                         </button>
//                     </div>
//                 ) : (
//                     questions.map((question, questionIndex) => (
//                         <QuestionForm
//                             key={questionIndex}
//                             question={question}
//                             questionIndex={questionIndex}
//                             expanded={expandedQuestions[questionIndex]}
//                             isQuestionValid={isQuestionValid}
//                             onToggleExpansion={onToggleQuestionExpansion}
//                             onQuestionTextChange={onQuestionTextChange}
//                             onOptionChange={onOptionChange}
//                             onCorrectAnswerChange={onCorrectAnswerChange}
//                             onAddOption={onAddOption}
//                             onRemoveOption={onRemoveOption}
//                             onRemoveQuestion={onRemoveQuestion}
//                             questionsLength={questions.length}
//                         />
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QuestionList;