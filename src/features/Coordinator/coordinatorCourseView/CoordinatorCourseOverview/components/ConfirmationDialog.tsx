// components/ConfirmationDialog.tsx
import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message: string; // Added message prop for dynamic content
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-nunito">
            <div className="bg-[#1B0A3F] rounded-xl p-8 sm:p-10 w-full max-w-lg border border-[#BF4BF6]/30 shadow-2xl transform scale-95 opacity-0 animate-fade-in-scale-up">
                <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-unbounded">Confirm Action</h3>
                    <p className="text-[#D68BF9] text-base sm:text-lg">{message}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors text-base sm:text-lg"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors text-base sm:text-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;