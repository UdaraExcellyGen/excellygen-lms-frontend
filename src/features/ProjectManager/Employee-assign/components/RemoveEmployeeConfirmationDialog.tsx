// Path: src/features/ProjectManager/Employee-assign/components/RemoveEmployeeConfirmationDialog.tsx

import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface RemoveEmployeeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string | undefined;
  projectName: string | undefined;
  // ✅ NEW: Added props for specific assignment details
  role?: string;
  workloadPercentage?: number;
}

const RemoveEmployeeConfirmationDialog: React.FC<RemoveEmployeeConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    employeeName,
    projectName,
    role,
    workloadPercentage
}) => {
    const { t } = useTranslation();
    
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999]">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] dark:border-[#7A00B8] min-w-[500px] max-w-[90vw]">
                <h3 className="text-lg font-semibold text-[#52007C] dark:text-white mb-4">
                    {/* ✅ UPDATED: Show specific assignment removal title */}
                    {role ? t('projectManager.dialogs.confirmAssignmentRemoval') : t('projectManager.dialogs.confirmEmployeeRemoval')}
                </h3>
                
                {/* ✅ UPDATED: Show specific assignment details if available */}
                {role && workloadPercentage ? (
                    <div className="mb-4">
                        <p className="text-[#7A00B8] dark:text-white mb-3">
                            {t('projectManager.dialogs.areYouSureRemoveAssignment')}
                        </p>
                        
                        {/* Assignment details card */}
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">{t('projectManager.dialogs.employee')}:</span>
                                    <span className="text-sm font-bold text-[#52007C]">{employeeName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">{t('projectManager.dialogs.projectName')}:</span>
                                    <span className="text-sm font-bold text-[#52007C]">{projectName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">{t('projectManager.dialogs.role')}:</span>
                                    <span className="text-sm font-bold text-red-600">{role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">{t('projectManager.dialogs.workloadPercentage')}:</span>
                                    <span className="text-sm font-bold text-red-600">{workloadPercentage}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-3 italic">
                            {t('projectManager.dialogs.noteOnlyThisRoleWillBeRemoved')}
                        </p>
                    </div>
                ) : (
                    // ✅ FALLBACK: Original message for backward compatibility
                    <p className="text-[#7A00B8] dark:text-white mb-4">
                        {t('projectManager.dialogs.areYouSureRemove')} <strong>{employeeName}</strong> {t('projectManager.dialogs.fromTheProject')} <strong>{projectName}</strong>?
                    </p>
                )}
                
                <div className="flex justify-end mt-4 gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        {t('projectManager.dialogs.cancel')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                            role 
                                ? 'bg-red-600 hover:bg-red-700' // Red for specific assignment removal
                                : 'bg-[#52007C] hover:bg-[#7A00B8]' // Purple for general removal
                        }`}
                    >
                        {/* ✅ UPDATED: Different button text based on removal type */}
                        {role ? t('projectManager.dialogs.removeAssignment') : t('projectManager.dialogs.confirmRemove')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RemoveEmployeeConfirmationDialog;