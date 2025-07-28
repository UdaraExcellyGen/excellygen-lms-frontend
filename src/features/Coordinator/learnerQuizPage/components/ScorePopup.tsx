import React from 'react';
import { Question } from '../types/quiz';

interface ScorePopupProps {
    score: number;
    numQuestions: number;
    onClose: () => void;
    quizData: Question[];
    answeredQuestions: { [key: number]: string | null };
    answeredQuestionsStatus: { [key: number]: 'answered' | 'correct' | 'incorrect' | 'unanswered' };
}

const ScorePopup: React.FC<ScorePopupProps> = ({ score, numQuestions, onClose }) => {
    return (
        <div className="fixed inset-0 bg-russian-violet bg-opacity-75 flex justify-center items-center overflow-y-auto">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-800">Quiz Finished!</h2>
                <p className="text-lg text-gray-700 mb-6 text-center">
                    Your score: <span className="font-bold text-phlox text-xl">{score} / {numQuestions}</span>
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-phlox hover:bg-heliotrope text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200"
                        type="button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScorePopup;