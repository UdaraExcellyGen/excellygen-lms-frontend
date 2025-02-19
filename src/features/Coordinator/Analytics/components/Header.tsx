import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { HeaderProps } from '../types/analytics';

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBackClick }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
    <div className="flex items-center gap-4">
      <button 
        onClick={onBackClick}
        className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
      >
        <ArrowLeft size={24} className="text-[#BF4BF6]" />
      </button>
      <div>
        <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">{title}</h1>
        <p className="text-gray-500 font-['Nunito_Sans']">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default Header;