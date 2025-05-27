// features/Mainfolder/AssignLearners/AssignLearners.tsx
import React, { useState, useEffect } from 'react';
import { mockLearners } from './data/mockLearners';
import { Learner } from './types/learner';
import AssignLearnersHeader from './components/AssignLearnersHeader';
import SearchBar from './components/SearchBar';
import LearnerList from './components/LearnerList';
import ConfirmationPopup from './components/ConfirmationPopup';

interface AssignLearnersProps {
    courseName: string;
}

const AssignLearners: React.FC<AssignLearnersProps> = ({ courseName }) => {
    const [learners, setLearners] = useState<Learner[]>([]);
    const [selectedLearnerIds, setSelectedLearnerIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredLearners, setFilteredLearners] = useState<Learner[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [selectedLearnerNames, setSelectedLearnerNames] = useState<string[]>([]);

    useEffect(() => {
        setLearners(mockLearners); // Mock data loading
    }, []);

    useEffect(() => {
        const results = learners.filter(learner =>
            learner.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLearners(results);
    }, [searchTerm, learners]);

    const handleLearnerSelection = (learnerId: number) => {
        setSelectedLearnerIds(prev =>
            prev.includes(learnerId) ? prev.filter(id => id !== learnerId) : [...prev, learnerId]
        );
    };

    const handleAssignClick = () => {
        if (selectedLearnerIds.length > 0) {
            const names = selectedLearners();
            setSelectedLearnerNames(names);
            setIsPopupVisible(true);
        } else {
            alert('Please select learners.');
        }
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false);
        setSelectedLearnerNames([]);
        setSelectedLearnerIds([]); // Clear selections after Assign (optional)
    };

    const handleRecoPopup = () => {
        window.history.back();// Clear selections after Assign (optional)
    };

    const handleBackButtonClick = () => {
        window.history.back(); // Go back in browser history
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
    const handleClearSearch = () => setSearchTerm('');


    const selectedLearners = (): string[] => {
        return learners
            .filter(learner => selectedLearnerIds.includes(learner.id))
            .map(learner => learner.name);
    };


    return (
        <div className="min-h-screen bg-pale-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-secondary">
            <div className="max-w-3xl w-full bg-white shadow-xl rounded-3xl overflow-hidden border border-timberwolf-100 tapered-box">
                {/* Header Section */}
                <AssignLearnersHeader courseName={courseName} />

                {/* Content Section */}
                <div className="p-8">
                    {/* Search Bar */}
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        onClearSearch={handleClearSearch}
                    />

                    {/* Learner List */}
                    <LearnerList
                        filteredLearners={filteredLearners}
                        searchTerm={searchTerm}
                        learners={learners}
                        selectedLearnerIds={selectedLearnerIds}
                        handleLearnerSelection={handleLearnerSelection}
                    />


                    {/* Action Button */}
                    <div className="mt-8 flex justify-between"> {/* Changed justify-end to justify-between */}
                         <button
                            onClick={handleBackButtonClick}
                            className="bg-timberwolf-200 hover:bg-timberwolf-300 focus:ring-2 focus:ring-timberwolf-200 focus:ring-opacity-50 text-gunmetal font-bold rounded-xl px-5 py-3 transition-colors duration-200 font-primary"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAssignClick}
                            disabled={selectedLearnerIds.length === 0}
                            className="bg-french-violet hover:bg-phlox focus:ring-2 focus:ring-french-violet focus:ring-opacity-50 text-white font-bold rounded-xl px-5 py-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-primary"
                        >
                            Assign Learners
                        </button>
                    </div>
                </div>
            </div>

            {/* Assign Pop-up */}
            <ConfirmationPopup
                isVisible={isPopupVisible}
                courseName={courseName}
                selectedLearnerNames={selectedLearnerNames}
                onClose={handleClosePopup}
                onAssign={handleRecoPopup}
            />
        </div>
    );
};

export default AssignLearners;