import React from 'react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    threadTitle: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, threadTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 w-full max-w-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
                <h3 className="text-xl font-unbounded text-[#1B0A3F] mb-2">Delete Thread</h3>
                <p className="text-[#52007C] font-nunito mb-6">
                    Are you sure you want to delete "{threadTitle}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-[#52007C] rounded-lg hover:bg-gray-200 transition-colors font-nunito"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-nunito"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationDialog;