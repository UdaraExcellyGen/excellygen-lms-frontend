// src/features/Admin/AdminDashboard/components/QuickActionsGrid.tsx
// ENTERPRISE OPTIMIZED: Performance optimizations only, same functionality
import React, { useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { QuickActionsGridProps } from '../types/types';

// ENTERPRISE: Memoized action button component for performance
const ActionButton: React.FC<{
  action: {
    text: string;
    icon: React.ComponentType<any>;
    color: string;
    onClick: () => void;
  };
}> = React.memo(({ action }) => {
  const Icon = action.icon;
  
  const handleClick = useCallback(() => {
    action.onClick();
  }, [action]);

  return (
    <button 
      onClick={handleClick}
      className="group bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:bg-white/95 w-full text-left"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="bg-[#F6E6FF] rounded-lg p-2.5 transition-colors duration-300 group-hover:bg-[#F0D6FF]">
            {Icon && <Icon className="w-5 h-5 text-[#BF4BF6]" />}
          </div>
          <h3 className="text-[#1B0A3F] font-medium font-['Nunito_Sans']">{action.text}</h3>
        </div>
        <div className="bg-[#F6E6FF] rounded-full p-1.5 transition-all duration-300 ease-out transform translate-x-0 group-hover:translate-x-1.5 group-hover:bg-[#F0D6FF] flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-[#BF4BF6]" />
        </div>
      </div>
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

const QuickActionsGrid: React.FC<QuickActionsGridProps> = React.memo(({ actions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {actions.map((action, index) => (
        <ActionButton key={index} action={action} />
      ))}
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';

export default QuickActionsGrid;