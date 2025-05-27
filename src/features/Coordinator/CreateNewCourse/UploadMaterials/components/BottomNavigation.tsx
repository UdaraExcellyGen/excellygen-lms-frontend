// features/Coordinator/CreateNewCourse/UploadMaterials/components/BottomNavigation.tsx
import React from 'react';

interface BottomNavigationProps {
    onBack: () => void;
    onNext: () => void;
    // onSaveMaterials prop might be removed if not used
    // materialsSaved prop might be removed
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onBack, onNext }) => { // Removed unused props
    return (
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between sticky bottom-6 bg-[#52007C]/80 backdrop-blur-sm z-10 border-t border-[#BF4BF6]/20 rounded-t-lg"> {/* Adjusted styles slightly */}
            <button
                onClick={onBack}
                className="px-6 py-2 text-[#D68BF9] font-['Nunito_Sans'] hover:bg-[#34137C] rounded-lg transition-colors">
                Back
            </button>
            <button
                onClick={onNext}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold">
                Next: Publish Course {/* Changed Label */}
            </button>
        </div>
    );
};

export default BottomNavigation;