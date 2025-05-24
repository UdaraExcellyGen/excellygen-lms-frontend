// Path: src/features/ProjectManager/Employee-assign/components/BottomBarWithAvatars.tsx

import React from 'react';
import { Project, Employee } from '../types/types';

interface BottomBarWithAvatarsProps {
  selectedEmployees: string[];
  selectedProject: Project | null;
  employees: Employee[];
  handleAssignEmployees: () => void;
  clearSelections: () => void;
}

const BottomBarWithAvatars: React.FC<BottomBarWithAvatarsProps> = ({
  selectedEmployees,
  selectedProject,
  employees,
  handleAssignEmployees,
  clearSelections
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#52007C] text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {selectedEmployees.slice(0, 3).map(empId => {
              const employee = employees.find(emp => emp.id === empId);
              return (
                <div key={empId} className="w-8 h-8 rounded-full bg-[#D68BF9] flex items-center justify-center
                                           border-2 border-[#52007C] text-xs font-bold">
                  {employee?.name.charAt(0) || "?"}
                </div>
              );
            })}
            {selectedEmployees.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-[#7A00B8] flex items-center justify-center
                             border-2 border-[#52007C] text-xs font-bold">
                +{selectedEmployees.length - 3}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs opacity-70">Selected Employees</div>
            <div className="text-sm font-semibold">{selectedEmployees.length} employees selected</div>
          </div>

          {selectedProject && (
            <>
              <div className="w-px h-8 bg-[#D68BF9] opacity-30"></div>
               <div>
                <div className="text-xs opacity-70">Project</div>
                <div className="text-sm font-semibold truncate max-w-[200px]">{selectedProject.name}</div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearSelections}
            className="px-4 py-2 text-white bg-[#7A00B8] hover:bg-[#52007C] rounded-lg
                     transition-colors duration-200"
          >
            Clear
          </button>
          <button
            onClick={handleAssignEmployees}
            disabled={!selectedProject || selectedEmployees.length === 0}
            className="px-4 py-2 bg-white text-[#52007C] hover:bg-[#F9F0FF] rounded-lg
                     transition-colors duration-200 font-semibold
                     disabled:opacity-50 disabled:hover:bg-white"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomBarWithAvatars;