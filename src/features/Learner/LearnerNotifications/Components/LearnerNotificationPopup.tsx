// import React from 'react';
// import { X, Code, Users, Check } from 'lucide-react';
// import { ProjectDetailsPopupProps } from '../types/learnerNotification';

// const LearnerPopup: React.FC<ProjectDetailsPopupProps> = ({ project, isAccepted, onClose, onAccept }) => {
//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
      
//       <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
      
     
//       <div className="flex items-center justify-center min-h-screen p-4">
//         <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative z-10">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-xl font-bold text-[#1B0A3F]">Project Details</h3>
//             <button 
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-800"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
          
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-medium text-gray-500">Project Name</h4>
//               <p className="text-[#1B0A3F] font-medium">{project.name}</p>
//             </div>
            
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1">
//                 <Code className="h-4 w-4" />
//                 Technologies
//               </h4>
//               <div className="flex flex-wrap gap-2 mt-1">
//                 {project.technologies.map((tech, index) => (
//                   <span 
//                     key={index} 
//                     className="px-2 py-1 bg-[#F6E6FF] text-[#52007C] text-xs rounded-md"
//                   >
//                     {tech}
//                   </span>
//                 ))}
//               </div>
//             </div>
            
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1">
//                 <Users className="h-4 w-4" />
//                 Assigned Team Members
//               </h4>
//               <ul className="mt-1 space-y-1">
//                 {project.assignedEmployees.map((employee, index) => (
//                   <li key={index} className="text-[#1B0A3F]">{employee}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
          
//           <div className="mt-6 flex justify-end">
//             {!isAccepted && (
//               <button
//                 onClick={onAccept}
//                 className="px-4 py-2 bg-[#52007C] hover:bg-[#BF4BF6] text-white rounded-md transition-colors"
//               >
//                 Accept Project
//               </button>
//             )}
//             {isAccepted && (
//               <div className="flex items-center text-green-600">
//                 <Check className="h-4 w-4 mr-2" />
//                 <span>Project Accepted</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LearnerPopup;