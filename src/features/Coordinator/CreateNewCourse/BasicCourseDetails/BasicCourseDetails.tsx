// features/-Mainfolder/BasicCourseDetails/BasicCourseDetails.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCourseContext } from '../../contexts/CourseContext';
import { CourseDetails } from './types/types'; // Import CourseDetails interface
import { courseCategories, availableTechnologies } from './data/courseData'; // Import data

import FormTextInput from './components/FormTextInput';
import FormSelect from './components/FormSelect';
import FormTextArea from './components/FormTextArea';
import ThumbnailUpload from './components/ThumbnailUpload';
import TechnologyDropdown from './components/TechnologyDropdown';
import ProgressSteps from './components/ProgressSteps';


const BasicCourseDetails: React.FC = () => {
    const navigate = useNavigate();
    const { courseData, updateBasicCourseDetails } = useCourseContext();

    const [courseDetails, setCourseDetails] = useState<CourseDetails>(courseData.basicDetails);
    const [errors, setErrors] = useState({
        title: false,
        category: false,
        description: false,
        estimatedTime: false,
        technologies: false,
        thumbnail: false
    });

    const [estimatedTimeError, setEstimatedTimeError] = useState<string>('');
    const [thumbnailError, setThumbnailError] = useState<string>('');
    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);
    const [isTechnologiesDropdownOpen, setIsTechnologiesDropdownOpen] = useState<boolean>(false);
    const technologiesDropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
                setIsTechnologiesDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [technologiesDropdownRef]);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            handleFileProcessing(file);
        }
    };

    const handleThumbnailDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDraggingThumbnail(false);
        const file = event.dataTransfer?.files?.[0];

        if (file) {
            handleFileProcessing(file);
        }
    };

    const handleFileProcessing = (file: File) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedImageTypes.includes(file.type)) {
            const maxSizeMB = 2;
            const maxSizeByte = maxSizeMB * 1024 * 1024;

            if (file.size > maxSizeByte) {
                setThumbnailError(`Image size should be less than ${maxSizeMB}MB.`);
                setErrors(prevErrors => ({ ...prevErrors, thumbnail: true }));
                return;
            }

            setCourseDetails(prev => ({
                ...prev,
                thumbnail: file
            }));
            setThumbnailError('');
            setErrors(prevErrors => ({ ...prevErrors, thumbnail: false }));
        } else {
            setThumbnailError("Please upload a valid JPG or PNG image file.");
            setErrors(prevErrors => ({ ...prevErrors, thumbnail: true }));
        }
    };

    const handleCheckboxTechnologyChange = (tech: string) => {
        setCourseDetails(prev => {
            let updatedTechnologies = [...prev.technologies];
            if (updatedTechnologies.includes(tech)) {
                updatedTechnologies = updatedTechnologies.filter(t => t !== tech);
            } else {
                updatedTechnologies = [...updatedTechnologies, tech];
            }
            return { ...prev, technologies: updatedTechnologies };
        });
        setErrors(prevErrors => ({ ...prevErrors, technologies: false }));
    };

    const handleNext = () => {
        if (estimatedTimeError) {
            return;
        }

        let isValid = true;
        const newErrors = { ...errors };

        if (!courseDetails.title.trim()) {
            newErrors.title = true;
            isValid = false;
        }
        if (!courseDetails.category) {
            newErrors.category = true;
            isValid = false;
        }
        if (courseDetails.technologies.length === 0) {
            newErrors.technologies = true;
            isValid = false;
        }
        if (errors.thumbnail) {
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            return;
        }

        updateBasicCourseDetails(courseDetails);
        console.log("Course Details to be passed to next step:", courseDetails);
        navigate('/coordinator/UploadMaterials');
    };

    const handleEstimatedTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCourseDetails(prev => ({ ...prev, estimatedTime: value }));
        setErrors(prevErrors => ({ ...prevErrors, estimatedTime: false }));

        if (value && isNaN(Number(value))) {
            setEstimatedTimeError("Please enter a valid number for estimated time (hours).");
            setErrors(prevErrors => ({ ...prevErrors, estimatedTime: true }));
        } else if (value && Number(value) < 0) {
            setEstimatedTimeError("Estimated time cannot be negative.");
            setErrors(prevErrors => ({ ...prevErrors, estimatedTime: true }));
        } else {
            setEstimatedTimeError("");
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDraggingThumbnail(true);
    };

    const handleDragLeave = () => {
        setIsDraggingThumbnail(false);
    };

    return (
        <div className="bg-[#52007C] p-6 relative min-h-screen">
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#52007C] -z-10"></div>
            <div className="bg-white rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/coordinator/dashboard')}
                            className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center">
                            <ArrowLeft size={20} className="text-[#1B0A3F]" />
                        </button>
                        <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">Create New Courses</h1>
                    </div>
                    <button className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors h-10">
                        Save as Draft
                    </button>
                </div>
            </div>

            {/* Progress Steps */}
            <ProgressSteps />

            {/* Course Details Form */}
            <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-2xl p-6 h-auto">
                <h2 className="text-lg font-['Unbounded'] text-[#ffffff] mb-6">Course Details</h2>

                <div className="grid grid-cols-3 gap-6">
                    {/* Thumbnail Upload */}
                    <ThumbnailUpload
                        thumbnail={courseDetails.thumbnail}
                        error={errors.thumbnail}
                        errorMessage={thumbnailError}
                        isDragging={isDraggingThumbnail}
                        setIsDragging={setIsDraggingThumbnail}
                        onFileInputChange={handleFileInputChange}
                        onDrop={handleThumbnailDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    />

                    {/* Form Fields */}
                    <div className="col-span-2 space-y-4">
                        <FormTextInput
                            label="Course Title"
                            placeholder="Enter Course Title"
                            value={courseDetails.title}
                            onChange={(e) => {
                                setCourseDetails(prev => ({ ...prev, title: e.target.value }));
                                setErrors(prevErrors => ({ ...prevErrors, title: false }));
                            }}
                            error={errors.title}
                            errorMessage="Course Title is required."
                        />

                        <FormSelect
                            label="Course Category"
                            value={courseDetails.category}
                            onChange={(e) => {
                                setCourseDetails(prev => ({ ...prev, category: e.target.value }));
                                setErrors(prevErrors => ({ ...prevErrors, category: false }));
                            }}
                            error={errors.category}
                            errorMessage="Course Category is required."
                            options={courseCategories}
                        />

                        <FormTextArea
                            label="Course Description"
                            placeholder="Enter course description"
                            value={courseDetails.description}
                            onChange={(e) => {
                                setCourseDetails(prev => ({ ...prev, description: e.target.value }));
                                setErrors(prevErrors => ({ ...prevErrors, description: false }));
                            }}
                        />

                        <FormTextInput
                            label="Estimated Time (Hours)"
                            placeholder="Hours"
                            value={courseDetails.estimatedTime}
                            onChange={handleEstimatedTimeChange}
                            error={errors.estimatedTime}
                            errorMessage={estimatedTimeError || "Estimated Time is invalid."}
                            type="text"
                        />

                        <TechnologyDropdown
                            selectedTechnologies={courseDetails.technologies}
                            availableTechnologies={availableTechnologies}
                            error={errors.technologies}
                            onTechnologyChange={handleCheckboxTechnologyChange}
                            isOpen={isTechnologiesDropdownOpen}
                            setIsOpen={setIsTechnologiesDropdownOpen}
                            dropdownRef={technologiesDropdownRef}
                        />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BasicCourseDetails;