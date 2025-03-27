// features/Mainfolder/AssignLearners/components/ConfirmationPopup.tsx
import React from 'react';

interface ConfirmationPopupProps {
    isVisible: boolean;
    courseName: string;
    selectedLearnerNames: string[];
    onClose: () => void;
    onAssign: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ isVisible, courseName, selectedLearnerNames, onClose, onAssign }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-xl border border-timberwolf-100">
                <h2 className="text-lg font-semibold text-gunmetal mb-4 font-primary">Assign Learners for {courseName}</h2>
                <ul>
                    {selectedLearnerNames.map((name, index) => (
                        <li key={index} className="mb-2">{name}</li>
                    ))}
                </ul>
                <div className="flex justify-end mt-4 space-x-2"> {/* Added space-x-2 for spacing */}
                    <button
                        onClick={onClose}
                        className="bg-timberwolf-200 hover:bg-timberwolf-300 focus:ring-2 focus:ring-timberwolf-200 focus:ring-opacity-50 text-gunmetal font-bold rounded-xl px-4 py-2 transition-colors duration-200 font-primary"
                    >
                        Back {/* Back button added */}
                    </button>
                    <button
                        onClick={onAssign}
                        className="bg-french-violet hover:bg-phlox focus:ring-2 focus:ring-french-violet focus:ring-opacity-50 text-white font-bold rounded-xl px-4 py-2 transition-colors duration-200 font-primary"
                    >
                        Assign Learners
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;