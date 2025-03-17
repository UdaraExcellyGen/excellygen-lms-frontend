// components/PopupMessage.tsx
import React from 'react';

interface PopupMessageProps {
    showPopup: boolean;
    popupMessage: string;
    onClosePopup: () => void;
}

const PopupMessage: React.FC<PopupMessageProps> = ({ showPopup, popupMessage, onClosePopup }) => {
    if (!showPopup) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-['Nunito_Sans']">
            <div className="bg-white p-6 rounded-lg shadow-xl text-black">
                <h2 className="text-lg font-semibold mb-4">Error</h2>
                <p className="mb-4">{popupMessage}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClosePopup}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupMessage;