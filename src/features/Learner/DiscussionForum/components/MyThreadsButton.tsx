import React from 'react';
import { Eye } from 'lucide-react';

interface MyThreadsButtonProps {
    onClick: () => void;
    active: boolean;
}

const MyThreadsButton: React.FC<MyThreadsButtonProps> = ({ onClick, active }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-xl font-nunito flex items-center gap-2 transition-all duration-300 ${
            active
                ? 'bg-[#BF4BF6] text-white hover:bg-[#D68BF9]'
                : 'bg-white/90 text-[#52007C] hover:bg-white'
        }`}
    >
        <Eye className="h-5 w-5" />
        My Threads
    </button>
);

export default MyThreadsButton;