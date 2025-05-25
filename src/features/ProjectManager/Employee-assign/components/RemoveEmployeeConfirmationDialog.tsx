// Path: src/features/ProjectManager/Employee-assign/components/RemoveEmployeeConfirmationDialog.tsx

import React from 'react';
import { createPortal } from 'react-dom';

interface RemoveEmployeeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string | undefined;
  projectName: string | undefined;
}

const RemoveEmployeeConfirmationDialog: React.FC<RemoveEmployeeConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    employeeName,
    projectName
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999]">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] dark:border-[#7A00B8] min-w-[500px]">
                <h3 className="text-lg font-semibold text-[#52007C] dark:text-white mb-4">Confirm Employee Removal?</h3>
                <p className="text-[#7A00B8] dark:text-white mb-4">
                    Are you sure you want to remove <strong>{employeeName}</strong> from the project <strong>{projectName}</strong>?
                </p>
                <div className="flex justify-end mt-4 gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-[#52007C] text-white rounded-lg font-medium hover:bg-[#7A00B8] transition-colors">
                        Confirm Remove
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RemoveEmployeeConfirmationDialog;