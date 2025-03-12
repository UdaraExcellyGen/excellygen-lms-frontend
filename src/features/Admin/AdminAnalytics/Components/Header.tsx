import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.history.back()} 
          className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
        >
          <ArrowLeft size={24} className="text-[#BF4BF6]" />
        </button>
        <div>
          <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">Analytics</h1>
          <p className="text-gray-500 font-['Nunito_Sans']">Analytics of Enrollments and Courses</p>
        </div>
      </div>
    </div>
  );
};

export default Header;