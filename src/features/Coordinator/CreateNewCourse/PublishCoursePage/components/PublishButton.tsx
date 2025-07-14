// features/createNewCourse/components/PublishButton.tsx
import React from 'react';

interface PublishButtonProps {
    onPublish: () => void;
    onBack: () => void;
    disabled?: boolean;
}

const PublishButton: React.FC<PublishButtonProps> = ({ onBack,onPublish, disabled = false }) => {
    return (
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between sticky bottom-0 bg-[#52007C] z-50 border-t border-[#BF4BF6]/20">
            <button
                onClick={onBack}
                disabled={disabled}
                className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#34137C] rounded-lg transition-colors">
                Back
            </button>
            <button
                onClick={onPublish}
                disabled={disabled}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold"
            >
                {disabled ? 'Loading...' : 'Publish Course'}
            </button>
        </div>
    );
};

export default PublishButton;