// features/createNewCourse/components/QuizOverviewModal.tsx
import React from 'react';
import QuizOverviewPage from './QuizOverview'; // Adjust path if needed
import { QuizBank } from '../../../contexts/CourseContext';

interface QuizOverviewModalProps {
    quizBank: QuizBank;
    onClose: () => void;
    onSave: (updatedQuizBank: QuizBank) => void;
    isFullScreen: boolean;
    subtopicId: string;
}

const QuizOverviewModal: React.FC<QuizOverviewModalProps> = ({ quizBank, onClose, onSave, isFullScreen, subtopicId }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <QuizOverviewPage
                quizBank={quizBank}
                onCloseQuizOverview={onClose}
                onSaveOverviewQuizDetails={onSave}
                isFullScreen={isFullScreen}
                subtopicId={subtopicId}
            />
        </div>
    );
};

export default QuizOverviewModal;