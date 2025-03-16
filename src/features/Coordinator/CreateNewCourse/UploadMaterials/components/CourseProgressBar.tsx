
import React from 'react';

const CourseProgressBar: React.FC = () => {
    return (
        <div className="flex justify-between items-center mb-6 px-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F6E6FF] flex items-center justify-center text-[#1B0A3F]">
                    ✓
                </div>
                <span className="text-white font-['Nunito_Sans']">Course Details</span>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#BF4BF6] flex items-center justify-center text-white font-['Nunito_Sans']">
                    2
                </div>
                <span className="text-white font-['Nunito_Sans']">Upload Materials</span>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F6E6FF] flex items-center justify-center text-[#1B0A3F] font-['Nunito_Sans']">
                    3
                </div>
                <span className="text-white font-['Nunito_Sans']">Publish Course</span>
            </div>
        </div>
    );
};

export default CourseProgressBar;