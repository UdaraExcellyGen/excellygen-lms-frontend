// src/features/Coordinator/CreateNewCourse/BasicCourseDetails/components/ProgressSteps.tsx
import React from 'react';

interface ProgressStepsProps {
  currentStep?: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, label: 'Course Details' },
    { id: 2, label: 'Upload Materials' },
    { id: 3, label: 'Publish Course' }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="flex justify-between">
        {steps.map(step => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.id === currentStep 
                  ? 'bg-[#BF4BF6] text-white' 
                  : step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#34137C] text-[#D68BF9]'
              }`}
            >
              {step.id < currentStep ? '✓' : step.id}
            </div>
            <span 
              className={`mt-2 text-sm ${
                step.id === currentStep 
                  ? 'text-white font-semibold' 
                  : 'text-[#D68BF9]'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-3">
        <div className="absolute h-1 bg-[#34137C] rounded w-full"></div>
        <div 
          className="absolute h-1 bg-[#BF4BF6] rounded transition-all" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressSteps;