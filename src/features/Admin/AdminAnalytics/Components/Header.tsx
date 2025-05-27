import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
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