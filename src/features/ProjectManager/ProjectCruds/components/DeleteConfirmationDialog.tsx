// ProjectCruds/components/DeleteConfirmationDialog.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    title,
    message,
    onCancel,
    onConfirm
}) => {
    const { t } = useTranslation();
    
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-modalEnter">
                <h2 className="text-xl text-russian-violet font-['Unbounded'] mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    {title}
                </h2>
                <p className="text-indigo mb-6">
                    {message}
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-indigo hover:text-[#BF4BF6] transition-all-300"
                    >
                        {t('projectManager.dialogs.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-soft"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmationDialog;