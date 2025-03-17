// components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    activeStep: number;
    steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ activeStep, steps }) => {
    return (
        <div className="flex justify-between items-center mb-6 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[#1B0A3F] ${activeStep > index ? 'bg-[#F6E6FF]' : (activeStep === index ? 'bg-[#BF4BF6] text-white' : 'bg-[#F6E6FF]')}`}>
                            {activeStep > index ? '✓' : (activeStep === index ? index + 1 : index + 1)}
                        </div>
                        <span className="text-white font-['Nunito_Sans']">{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className="h-0.5 flex-1 mx-4 bg-[#F6E6FF]" />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ProgressBar;