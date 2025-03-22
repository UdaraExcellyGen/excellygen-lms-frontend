// components/Footer.tsx
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
        const navigate = useNavigate(); // Initialize navigate function
    
        const handleNavigate = (path: string) => {
            navigate(path); // Use navigate function to go to the desired path
        };
    return (
        <div className="container mx-auto px-6 flex justify-start">
            <button
                className="bg-[#BF4BF6] hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 flex items-center"
                onClick={() => handleNavigate('/coordinator/dashboard')} // Call navigate when the button is clicked
            >
                <FiArrowLeft className="mr-2" /> Back
            </button>
        </div>
    );
};

export default Footer;