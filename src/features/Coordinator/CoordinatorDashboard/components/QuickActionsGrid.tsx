import React from 'react';
import { QuickActionsGridProps } from '../types/types';

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-1 py-3 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((button, index) => (
        <button 
          key={index}
          onClick={button.onClick}
          className={`py-3 px-4 text-white rounded-xl font-['Nunito_Sans'] ${button.color} ${button.hoverColor} 
                   transform transition-all duration-300 hover:shadow-lg active:scale-95 text-sm sm:text-base`}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
};

export default QuickActionsGrid;