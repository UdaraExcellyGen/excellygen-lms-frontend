// import React from 'react';
// import { Ban, ChevronUp, Save, ChevronDown } from 'lucide-react';

// interface NavigationButtonsProps {
//     currentTab: 'details' | 'questions';
//     onCancel: () => void;
//     onBackToDetails: () => void;
//     onContinueToQuestions: () => void;
//     onSaveQuiz: () => void;
//     setCurrentTab: (tab: 'details' | 'questions') => void;
// }

// const NavigationButtons: React.FC<NavigationButtonsProps> = ({
//     currentTab,
//     onCancel,
//     onBackToDetails,
//     onContinueToQuestions,
//     onSaveQuiz,
//     setCurrentTab
// }) => {
//     if (currentTab === 'details') {
//         return (
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
//         );
//     } else {
//         return (
//             <div className="flex justify-between mt-4 pt-4 border-t border-[#BF4BF6]/30">
//                 <button
//                     onClick={onBackToDetails}
//                     className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-full hover:bg-[#BF4BF6]/10 transition-colors text-sm font-medium font-nunito flex items-center"
//                 >
//                     <ChevronUp className="w-4 h-4 mr-2" />
//                     Back to Details
//                 </button>

//                 <button
//                     onClick={onSaveQuiz}
//                     className="flex items-center gap-2 px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] rounded-full transition-colors text-sm font-bold font-nunito"
//                 >
//                     <Save className="w-4 h-4" />
//                     Save Quiz
//                 </button>
//             </div>
//         );
//     }
// };

// export default NavigationButtons;