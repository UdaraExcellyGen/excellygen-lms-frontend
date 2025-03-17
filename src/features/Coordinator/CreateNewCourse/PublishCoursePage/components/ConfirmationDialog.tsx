// features/createNewCourse/components/ConfirmationDialog.tsx
import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-[#1B0A3F] rounded-xl p-10 w-[500px] h-[250px] max-w-md border border-[#BF4BF6]/20 shadow-lg">
                <div className="flex flex-col h-full justify-between items-center">
                    <div className="text-center">
                        <h3 className="text-2xl font-semibold text-white mb-4 font-unbounded">
                            Confirm Delete
                        </h3>
                        <p className="text-[#D68BF9] text-lg font-nunito">
                            {message}
                        </p>
                    </div>
                    <div className="flex justify-center gap-8">
                        <button
                            onClick={onConfirm}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-3 px-6 rounded-full transition-colors font-nunito text-lg"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={onCancel}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors font-nunito text-lg"
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