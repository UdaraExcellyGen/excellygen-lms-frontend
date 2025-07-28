// import React from 'react';

// interface ProgressBarProps {
//     stage: number; 
// }

// const ProgressBar: React.FC<ProgressBarProps> = ({ stage }) => {
//     const getStageClasses = (stageNumber: number) => {
//         if (stageNumber < stage) {
//             return "w-8 h-8 rounded-full bg-[#F6E6FF] flex items-center justify-center text-[#1B0A3F]";
//         } else if (stageNumber === stage) {
//             return "w-8 h-8 rounded-full bg-[#BF4BF6] flex items-center justify-center text-white font-['Nunito_Sans']";
//         } else {
//             return "w-8 h-8 rounded-full bg-[#F6E6FF] flex items-center justify-center text-[#1B0A3F] font-['Nunito_Sans']";
//         }
//     };

//     const getTextClasses = (stageNumber: number) => {
//         return "text-white font-['Nunito_Sans']";
//     };

//     const getLineClasses = (stageNumber: number) => {
//         if (stageNumber < stage) {
//             return "h-0.5 flex-1 mx-4 bg-[#F6E6FF]";
//         } else {
//             return "h-0.5 flex-1 mx-4 bg-[#F6E6FF]"; 
//         }
//     };


//     return (
//         <div className="flex justify-between items-center mb-6 px-4">
//             <div className="flex items-center gap-2">
//                 <div className={getStageClasses(1)}>
//                     {stage > 1 ? '✓' : '1'}
//                 </div>
//                 <span className={getTextClasses(1)}>Course Details</span>
//             </div>
//             <div className={getLineClasses(1)} />
//             <div className="flex items-center gap-2">
//                 <div className={getStageClasses(2)}>
//                     {stage > 2 ? '✓' : '2'}
//                 </div>
//                 <span className={getTextClasses(2)}>Upload Materials</span>
//             </div>
//             <div className={getLineClasses(2)} />
//             <div className="flex items-center gap-2">
//                 <div className={getStageClasses(3)}>
//                     3
//                 </div>
//                 <span className={getTextClasses(3)}>Publish Course</span>
//             </div>
//         </div>
//     );
// };

// export default ProgressBar;