// components/ConfirmationDialog.tsx
import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#1B0A3F] rounded-xl p-4 sm:p-10 w-full max-w-sm sm:max-w-md border border-[#BF4BF6]/20 shadow-lg">
                <div className="flex flex-col h-full justify-between items-center">
                    <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 font-unbounded">Confirm Delete</h3>
                        <p className="text-[#D68BF9] text-sm sm:text-lg font-nunito">Are you sure you want to remove this file?</p>
                    </div>
                    <div className="flex justify-center gap-4 sm:gap-8 mt-6">
                        <button
                            onClick={onConfirm}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-colors font-nunito text-sm sm:text-lg"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={onCancel}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-colors font-nunito text-sm sm:text-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;