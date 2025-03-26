import React from 'react';

interface QuizTabsProps {
    currentTab: 'details' | 'questions';
    setCurrentTab: (tab: 'details' | 'questions') => void;
    questionsLength: number;
}

const QuizTabs: React.FC<QuizTabsProps> = ({ currentTab, setCurrentTab, questionsLength }) => {
    return (
        <div className="flex rounded-lg overflow-hidden">
            <button
                onClick={() => setCurrentTab('details')}
                className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium ${
                    currentTab === 'details'
                        ? 'bg-[#BF4BF6] text-white'
                        : 'bg-[#34137C] text-[#D68BF9]'
                } transition-colors font-nunito`}
            >
                Quiz Details
            </button>
            <button
                onClick={() => setCurrentTab('questions')}
                className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium ${
                    currentTab === 'questions'
                        ? 'bg-[#BF4BF6] text-white'
                        : 'bg-[#34137C] text-[#D68BF9]'
                } transition-colors font-nunito`}
            >
                Questions ({questionsLength})
            </button>
        </div>
    );
};

export default QuizTabs;