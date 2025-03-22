// features/createNewCourse/components/PublishButton.tsx
import React from 'react';

interface PublishButtonProps {
    onPublish: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({ onPublish }) => {
    return (
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-end bg-[#52007C] z-50 border-t border-[#BF4BF6]/20">
            <button
                onClick={onPublish}
                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-3 px-8 rounded-full transition-colors font-nunito text-lg"
            >
                Publish Course
            </button>
        </div>
    );
};

export default PublishButton;