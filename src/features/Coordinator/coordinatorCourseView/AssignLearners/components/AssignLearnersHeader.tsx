// features/Mainfolder/AssignLearners/components/AssignLearnersHeader.tsx
import React from 'react';

interface AssignLearnersHeaderProps {
    courseName: string;
}

const AssignLearnersHeader: React.FC<AssignLearnersHeaderProps> = ({ courseName }) => {
    return (
        <div className="bg-indigo py-8 px-6">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 font-primary">
                Assign Learners
            </h1>
            <p className="text-white text-lg">
                Suggest the best learners for <span className="font-semibold">{courseName}</span>.
            </p>
        </div>
    );
};

export default AssignLearnersHeader;