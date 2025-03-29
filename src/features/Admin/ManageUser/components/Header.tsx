import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface HeaderProps {
  onNavigateBack: () => void;
  onAddUser: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateBack, onAddUser }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateBack}
            className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-[#BF4BF6]" />
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
            <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
              User Management
            </h1>
            <button
              onClick={onAddUser}
              className="px-6 py-3 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;