// src/features/Coordinator/LearnerListPage/components/Header.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
    handleNavigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ handleNavigate }) => {
    return (
        <header className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <button onClick={() => handleNavigate('/coordinator/dashboard')} className="flex items-center text-[#D68BF9] hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                </button>
                <h1 className="text-2xl font-bold text-white">Enrolled Learners</h1>
            </div>
        </header>
    );
};

export default Header;