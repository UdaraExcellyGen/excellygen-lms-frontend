import React from 'react';
import { ChevronRight } from 'lucide-react';
import { QuickActionsGridProps } from '../types/types';

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <div 
            key={index}
            onClick={action.onClick}
            className="bg-white rounded-2xl p-5 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:bg-[#FCFAFF]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-[#F6E6FF] rounded-lg p-2.5 transition-colors duration-300 group-hover:bg-[#F0D6FF]">
                  {Icon && <Icon className="w-5 h-5 text-[#BF4BF6]" />}
                </div>
                <h3 className="text-[#1B0A3F] font-medium font-['Nunito_Sans']">{action.text}</h3>
              </div>
              <div className="bg-[#F6E6FF] rounded-full p-1.5 transition-all duration-300 ease-out transform translate-x-0 group-hover:translate-x-1.5 group-hover:bg-[#F0D6FF]">
                <ChevronRight className="w-4 h-4 text-[#BF4BF6]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickActionsGrid;