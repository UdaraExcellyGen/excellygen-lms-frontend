// // components/CourseOverviewCourseSection.tsx
// import React from 'react';
// import { ChevronDown } from 'lucide-react';
// import { FileText } from 'lucide-react'; // Using FileText as a default icon here

// interface CourseOverviewCourseSectionProps {
//     title: string;
//     description?: string;
//     expanded: boolean;
//     onToggle: () => void;
//     icon?: React.ReactNode; // Make icon optional if some sections don't need it or use a default
//     children: React.ReactNode;
// }

// const CourseOverviewCourseSection: React.FC<CourseOverviewCourseSectionProps> = ({ title, description, expanded, onToggle, icon, children }) => {
//     return (
//         <div className="bg-[#1B0A3F]/40 backdrop-blur-sm rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden group hover:border-[#BF4BF6]/40 transition-all duration-300">
//             <button
//                 onClick={onToggle}
//                 className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-[#BF4BF6]/10 transition-colors"
//             >
//                 <div className="flex items-center gap-4">
//                     <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center flex-shrink-0">
//                         {icon || <FileText className="w-5 h-5 text-white" />} {/* Default icon */}
//                     </div>
//                     <div className="text-left">
//                         <h3 className="font-unbounded font-bold text-lg">{title}</h3>
//                         {description && <p className="text-sm text-[#D68BF9]">{description}</p>}
//                     </div>
//                 </div>
//                 <ChevronDown
//                     className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
//                 />
//             </button>

//             {expanded && (
//                 <div className="px-6 py-5 space-y-4 border-t border-[#BF4BF6]/20">
//                     {children}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CourseOverviewCourseSection;