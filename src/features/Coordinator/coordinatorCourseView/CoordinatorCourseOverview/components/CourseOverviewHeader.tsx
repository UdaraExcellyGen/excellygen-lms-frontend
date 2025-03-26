// components/CourseOverviewHeader.tsx
import React from 'react';
import { Edit, Save, Ban, Menu } from 'lucide-react';
import { CourseData } from '../types';

interface CourseOverviewHeaderProps {
    isEditMode: boolean;
    editCourseData: CourseData;
    isMobileMenuOpen: boolean;
    handleEditCourse: () => void;
    handleSaveCourse: () => void;
    handleCancelEditCourse: () => void;
    handleAssign: () => void;
    handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    toggleMobileMenu: () => void;
}

const CourseOverviewHeader: React.FC<CourseOverviewHeaderProps> = ({
    isEditMode,
    editCourseData,
    isMobileMenuOpen,
    handleEditCourse,
    handleSaveCourse,
    handleCancelEditCourse,
    handleAssign,
    handleEditInputChange,
    toggleMobileMenu
}) => {
    return (
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full md:w-auto">
                {isEditMode ? (
                    <input
                        type="text"
                        name="title"
                        value={editCourseData.title || ''}
                        onChange={handleEditInputChange}
                        placeholder="Course Title"
                        className="block w-full p-2 mb-4 text-white bg-transparent border border-[#BF4BF6]/50 rounded-md focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-unbounded text-xl sm:text-2xl md:text-3xl font-semibold"
                    />
                ) : (
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold font-unbounded mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
                        {editCourseData?.title || 'Course Title'}
                    </h2>
                )}
                {isEditMode ? (
                    <textarea
                        name="description"
                        value={editCourseData.description || ''}
                        onChange={handleEditInputChange}
                        placeholder="Course description will be displayed here."
                        className="block w-full p-2 text-[#D68BF9] bg-transparent border border-[#BF4BF6]/50 rounded-md focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-nunito"
                        rows={3}
                    />
                ) : (
                    <p className="text-[#D68BF9] text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-nunito">
                        {editCourseData?.description || 'Course description will be displayed here.'}
                    </p>
                )}
            </div>

            <button
                onClick={toggleMobileMenu}
                className="md:hidden bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors font-nunito flex items-center"
            >
                <Menu className="w-5 h-5 mr-2" />
                Menu
            </button>

            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden w-full mt-4 space-y-3`}>
                {isEditMode ? (
                    <>
                        <button
                            onClick={handleSaveCourse}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors font-nunito w-full flex items-center justify-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Course
                        </button>
                        <button
                            onClick={handleCancelEditCourse}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors font-nunito w-full flex items-center justify-center"
                        >
                            <Ban className="w-4 h-4 mr-2" />
                            Cancel Edit
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleEditCourse}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors font-nunito w-full flex items-center justify-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Course
                        </button>
                        <button
                            onClick={handleAssign}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors font-nunito w-full flex items-center justify-center"
                        >
                            Assign Learners
                        </button>
                    </>
                )}
            </div>

            <div className="hidden md:flex gap-4">
                {isEditMode ? (
                    <>
                        <button
                            onClick={handleSaveCourse}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors font-nunito"
                        >
                            <Save className="w-4 h-4 mr-2 inline-block align-middle" />
                            Save Course
                        </button>
                        <button
                            onClick={handleCancelEditCourse}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors font-nunito"
                        >
                            <Ban className="w-4 h-4 mr-2 inline-block align-middle" />
                            Cancel Edit
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleEditCourse}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors font-nunito"
                        >
                            <Edit className="w-4 h-4 mr-2 inline-block align-middle" />
                            Edit Course
                        </button>
                        <button
                            onClick={handleAssign}
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors font-nunito"
                        >
                            Assign learners
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CourseOverviewHeader;