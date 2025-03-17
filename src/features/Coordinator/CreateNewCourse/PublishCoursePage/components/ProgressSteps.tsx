// features/createNewCourse/components/ProgressSteps.tsx
import React from 'react';

interface ProgressStepsProps {
    currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
    const steps = [
        'Course Details',
        'Upload Materials',
        'Publish Course',
    ];

    return (
        <div className="flex justify-between items-center mb-6 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[#1B0A3F] ${currentStep > index + 1 ? 'bg-[#F6E6FF]' : currentStep === index + 1 ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF]'}`}>
                            {currentStep > index + 1 ? '✓' : currentStep === index + 1 ? index + 1 : index + 1 }
                        </div>
                        <span className="text-white font-['Nunito_Sans']">
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ProgressSteps;