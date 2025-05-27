// Path: src/features/ProjectManager/Employee-assign/components/DuplicateAssignmentDialog.tsx

import React from 'react';
import { createPortal } from 'react-dom';
import { Project, Employee } from '../types/types';

interface DuplicateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateEmployees: Employee[];
  selectedProject: Project | null;
}

const DuplicateAssignmentDialog: React.FC<DuplicateAssignmentDialogProps> = ({ 
    isOpen, 
    onClose, 
    duplicateEmployees, 
    selectedProject 
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999]">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] dark:border-[#7A00B8] min-w-[500px]">
                <h3 className="text-lg font-semibold text-[#52007C] dark:text-white mb-4">Duplicate Assignment Warning</h3>
                <p className="text-[#7A00B8] dark:text-white mb-4">
                    The following employees are already assigned to the project <span className="font-semibold">{selectedProject?.name}</span>.
                    Please review your selection.
                </p>
                <ul>
                    {duplicateEmployees.map(emp => (
                        <li key={emp.id} className="text-sm text-[#7A00B8] dark:text-white">- {emp.name} (ID: {emp.id})</li>
                    ))}
                </ul>
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DuplicateAssignmentDialog;