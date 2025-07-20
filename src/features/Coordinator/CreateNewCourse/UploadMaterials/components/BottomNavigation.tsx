// features/Coordinator/CreateNewCourse/UploadMaterials/components/BottomNavigation.tsx
import React from 'react';

interface BottomNavigationProps {
    onBack: () => void;
    onNext: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onBack, onNext }) => {
    return (
        <footer className="sticky bottom-0 bg-[#52007C] py-4">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between sticky bottom-6 bg-[#52007C]/80 backdrop-blur-sm z-10 rounded-t-lg"> {/* Adjusted styles slightly */}
            <button
                onClick={onBack}
                className="px-6 py-2 text-white font-bold font-['Nunito_Sans'] bg-[#BF4BF6] hover:bg-[#D68BF9] rounded-lg transition-colors">
                Back
            </button>
            <button
                onClick={onNext}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors font-bold">
                Next: Publish Course 
            </button>
        </div>
        </footer>
    );
};

export default BottomNavigation;