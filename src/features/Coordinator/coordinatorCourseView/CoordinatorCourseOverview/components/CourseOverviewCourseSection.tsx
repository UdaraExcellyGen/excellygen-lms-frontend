// components/CourseOverviewCourseSection.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CourseOverviewCourseSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    description?: string;
}

const CourseOverviewCourseSection: React.FC<CourseOverviewCourseSectionProps> = ({ title, icon, children, expanded, onToggle, description }) => {
    return (
        <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-white hover:bg-[#BF4BF6]/5 transition-colors"
            >
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center relative font-from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center relative font-nunito">
                        {icon}
                    </div>
                    <div className="text-left">
                        <h3 className="font-unbounded font-bold text-sm sm:text-base">{title}</h3>
                        {description && <p className="text-xs sm:text-sm text-[#D68BF9] font-nunito">{description}</p>}
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3 border-t border-[#BF4BF6]/20">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CourseOverviewCourseSection;