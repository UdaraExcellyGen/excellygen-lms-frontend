// components/CourseOverviewHeader.tsx
import React from 'react';
import { Edit, Save, XCircle } from 'lucide-react';
import { CourseDto, UpdateCourseCoordinatorDtoFE, CategoryDto, TechnologyDto } from '../../../../../types/course.types';
import FormSelect from '../../../CreateNewCourse/BasicCourseDetails/components/FormSelect';
import TechnologyDropdown from '../../../CreateNewCourse/BasicCourseDetails/components/TechnologyDropdown';

interface CourseOverviewHeaderProps {
    courseData: CourseDto; // Original CourseDto for static display
    isEditMode: boolean;
    editCourseDetails: (UpdateCourseCoordinatorDtoFE & { thumbnail: File | null }) | null; // Editable data state
    handleToggleEditMode: () => void; // Combined edit/cancel toggle
    handleSaveCourse: () => void;
    handleEditCourseInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleEditCourseTechnologyChange: (techId: string) => void;
    availableCategories: CategoryDto[];
    availableTechnologies: TechnologyDto[];
    isSaving: boolean;
    totalCoursePoints: number;
    technologiesDropdownRef: React.RefObject<HTMLDivElement>; // Pass ref for dropdown
    isTechnologiesDropdownOpen: boolean;
    setIsTechnologiesDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CourseOverviewHeader: React.FC<CourseOverviewHeaderProps> = ({
    courseData,
    isEditMode,
    editCourseDetails,
    handleToggleEditMode,
    handleSaveCourse,
    handleEditCourseInputChange,
    handleEditCourseTechnologyChange,
    availableCategories,
    availableTechnologies,
    isSaving,
    totalCoursePoints,
    technologiesDropdownRef,
    isTechnologiesDropdownOpen,
    setIsTechnologiesDropdownOpen
}) => {
    // Determine which data to display (original or editable)
    const displayData = isEditMode ? editCourseDetails : courseData;

    return (
        <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-[#BF4BF6]/20 transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    {isEditMode ? (
                        <input
                            type="text"
                            name="title"
                            value={displayData?.title || ''}
                            onChange={handleEditCourseInputChange}
                            placeholder="Course Title"
                            className="w-full text-3xl font-bold font-unbounded bg-transparent border-b border-[#BF4BF6]/50 text-white pb-2 focus:outline-none focus:border-[#BF4BF6] mb-4"
                            disabled={isSaving}
                        />
                    ) : (
                        <h2 className="text-3xl font-bold font-unbounded text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D68BF9] mb-4">
                            {displayData?.title || 'Course Title'}
                        </h2>
                    )}

                    {/* Description */}
                    {isEditMode ? (
                        <textarea
                            name="description"
                            value={displayData?.description || ''}
                            onChange={handleEditCourseInputChange}
                            placeholder="Course description will be displayed here."
                            className="w-full text-base text-[#D68BF9] bg-transparent border border-[#BF4BF6]/30 rounded-md p-3 focus:outline-none focus:border-[#BF4BF6] resize-y leading-relaxed mb-4"
                            rows={4}
                            disabled={isSaving}
                        />
                    ) : (
                        <p className="text-base text-[#D68BF9] leading-relaxed mb-4">
                            {displayData?.description || 'Course description will be displayed here.'}
                        </p>
                    )}

                    {/* Thumbnail and other details in edit mode */}
                    {isEditMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Estimated Time */}
                            <div>
                                <label htmlFor="estimatedTime" className="block text-sm text-gray-300 mb-1">Estimated Time (Hours)</label>
                                <input
                                    type="number"
                                    id="estimatedTime"
                                    name="estimatedTime"
                                    value={editCourseDetails?.estimatedTime !== undefined ? String(editCourseDetails.estimatedTime) : ''}
                                    onChange={handleEditCourseInputChange}
                                    placeholder="e.g., 40"
                                    className="w-full p-2 bg-[#2D1B59] text-white rounded-md border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <FormSelect
                                    label="Category"
                                    name="categoryId"
                                    value={editCourseDetails?.categoryId || ''}
                                    onChange={handleEditCourseInputChange}
                                    options={availableCategories.map(cat => ({ id: cat.id, title: cat.title }))}
                                    placeholder="Select Category"
                                    error={false} // Add error handling if needed
                                    errorMessage=""
                                />
                            </div>
                            
                            {/* Technologies */}
                            <div className="md:col-span-2">
                                <TechnologyDropdown
                                    label="Technologies"
                                    selectedTechnologyIds={editCourseDetails?.technologyIds || []}
                                    availableTechnologies={availableTechnologies}
                                    onTechnologyChange={handleEditCourseTechnologyChange}
                                    isOpen={isTechnologiesDropdownOpen}
                                    setIsOpen={setIsTechnologiesDropdownOpen}
                                    dropdownRef={technologiesDropdownRef}
                                />
                            </div>

                            {/* Thumbnail Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-300 mb-1">Thumbnail Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="thumbnail"
                                    onChange={handleEditCourseInputChange}
                                    className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#BF4BF6] file:text-[#1B0A3F] hover:file:bg-[#D68BF9] transition-colors cursor-pointer"
                                    disabled={isSaving}
                                />
                                {editCourseDetails?.thumbnail && typeof editCourseDetails.thumbnail !== 'string' && (
                                    <p className="text-xs text-[#D68BF9] mt-2">New file selected: {editCourseDetails.thumbnail.name}</p>
                                )}
                                {courseData?.thumbnailUrl && !editCourseDetails?.thumbnail && (
                                    <div className="mt-2 text-xs text-gray-400">Current thumbnail: <a href={courseData.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="underline">{courseData.thumbnailUrl.split('/').pop()}</a></div>
                                )}
                                {!courseData?.thumbnailUrl && !editCourseDetails?.thumbnail && (
                                     <p className="text-xs text-gray-400 mt-2">No thumbnail uploaded yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons (Edit/Save/Cancel) */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-shrink-0">
                    {isEditMode ? (
                        <>
                            <button
                                onClick={handleSaveCourse}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-full transition-colors text-base flex items-center justify-center gap-2"
                                disabled={isSaving}
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleToggleEditMode} // Now acts as "Cancel"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full transition-colors text-base flex items-center justify-center gap-2"
                                disabled={isSaving}
                            >
                                <XCircle size={18} />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleToggleEditMode} // Now acts as "Edit"
                            className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-5 rounded-full transition-colors text-base flex items-center justify-center gap-2"
                            disabled={isSaving}
                        >
                            <Edit size={18} />
                            Edit Course
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom section with Course Points and current image */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 {/* Changed styling here for image container */}
                 <div className="relative w-full md:w-1/2 rounded-lg overflow-hidden border border-[#BF4BF6]/20 shadow-inner group transition-all duration-300 aspect-video md:aspect-auto md:h-64">
                    {courseData?.thumbnailUrl ? (
                        <img
                            src={courseData.thumbnailUrl}
                            alt="Course Thumbnail"
                            className="w-full h-full object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300" // Added object-cover
                        />
                    ) : (
                        <div className="w-full h-full bg-[#2D1B59] flex items-center justify-center text-gray-400 text-sm">
                            No Thumbnail Image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <span className="text-white text-xl font-bold font-unbounded">
                            Course Points: {totalCoursePoints}
                        </span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-[#2D1B59] p-6 rounded-xl shadow-lg border border-[#BF4BF6]/20">
                    <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                        <p><strong className="text-white">Category:</strong> {courseData.category.title}</p>
                        <p><strong className="text-white">Estimated Time:</strong> {courseData.estimatedTime} Hours</p>
                        <div className="sm:col-span-2">
                            <p className="text-white font-bold mb-2">Technologies:</p>
                            <div className="flex flex-wrap gap-2">
                                {courseData.technologies.length > 0 ? (
                                    courseData.technologies.map(tech => (
                                        <span key={tech.id} className="bg-[#34137C] text-white px-3 py-1 rounded-full text-xs">
                                            {tech.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">No technologies assigned.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseOverviewHeader;