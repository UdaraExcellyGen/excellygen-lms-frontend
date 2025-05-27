// features/createNewCourse/components/PublishButton.tsx
import React from 'react';

interface PublishButtonProps {
    onPublish: () => void;
    onBack: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({ onBack,onPublish }) => {
    return (
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between sticky bottom-0 bg-[#52007C] z-50 border-t border-[#BF4BF6]/20">
            <button
                onClick={onBack}
                className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#34137C] rounded-lg transition-colors">
                Back
            </button>
            <button
                onClick={onPublish}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold"
            >
                Publish Course
            </button>
        </div>
    );
};

export default PublishButton;