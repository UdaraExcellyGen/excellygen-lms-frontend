import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseHeader: React.FC = () => {
    const navigate = useNavigate();

    const handleSaveDraft = () => {
        alert("Course saved as draft!");
    };

    return (
        <div className="bg-white rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/coordinator/course-details')}
                        className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center">
                        <ArrowLeft size={20} className="text-[#1B0A3F]" />
                    </button>
                    <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">Create New Courses</h1>
                </div>
                <button onClick={handleSaveDraft} className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors h-10">
                    Save as Draft
                </button>
            </div>
        </div>
    );
};

export default CourseHeader;