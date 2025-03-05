
import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${currentStep === 1 ? 'bg-[#BF4BF6] text-[#F6E6FF]' : 'bg-[#F6E6FF] text-[#1B0A3F]'} flex items-center justify-center font-['Nunito_Sans']`}>
          1
        </div>
        <span className="text-white font-['Nunito_Sans']">Course Details</span>
      </div>
      <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${currentStep === 2 ? 'bg-[#BF4BF6] text-[#F6E6FF]' : 'bg-[#F6E6FF] text-[#1B0A3F]'} flex items-center justify-center font-['Nunito_Sans']`}>
          2
        </div>
        <span className="text-white font-['Nunito_Sans']">Upload Materials</span>
      </div>
      <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${currentStep === 3 ? 'bg-[#BF4BF6] text-[#F6E6FF]' : 'bg-[#F6E6FF] text-[#1B0A3F]'} flex items-center justify-center font-['Nunito_Sans']`}>
          3
        </div>
        <span className="text-white font-['Nunito_Sans']">Publish Course</span>
      </div>
    </div>
  );
};