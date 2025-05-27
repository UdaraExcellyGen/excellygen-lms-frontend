// src/pages/DiscussionForum/components/DeleteItemDialog.tsx
import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface DeleteItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>; // Parent handles API call and its loading/errors
    itemName: string; // e.g., "thread", "comment", "reply"
    itemContentPreview?: string;
    customMessage?: string;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemName, 
    itemContentPreview,
    customMessage
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmClick = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(); 
            // Parent will call onClose on successful confirmation
        } catch (error) {
            // Error should be toasted by the parent's onConfirm handler
            console.error(`DeleteItemDialog: onConfirm failed for ${itemName}`, error);
        } finally {
            setIsDeleting(false); 
            // Parent decides if modal closes on error or not. Generally it should close.
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-xl border border-red-400/50 p-6 shadow-xl">
                <div className="flex items-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <h3 className="text-xl font-unbounded text-red-700">Delete {itemName}</h3>
                </div>
                <p className="text-[#52007C] font-nunito text-sm mb-1">
                    {customMessage || `Are you sure you want to permanently delete this ${itemName}?`}
                </p>
                {itemContentPreview && (
                    <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded border max-h-20 overflow-y-auto mb-4">
                        "{itemContentPreview.substring(0, 100)}{itemContentPreview.length > 100 ? '...' : ''}"
                    </p>
                )}
                <p className="text-xs text-red-600 font-semibold mb-6">This action cannot be undone.</p>
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-nunito"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmClick}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-nunito disabled:opacity-70"
                    >
                        {isDeleting ? <RefreshCw className="animate-spin h-5 w-5 inline" /> : `Yes, Delete ${itemName}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteItemDialog;