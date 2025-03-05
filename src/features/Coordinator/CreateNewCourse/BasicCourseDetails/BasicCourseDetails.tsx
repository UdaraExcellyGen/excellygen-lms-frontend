import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseDetails } from '../BasicCourseDetails/types/CourseDetails';
import { courseCategories, availableTechnologies } from '../BasicCourseDetails/data/courseData';
import  PageHeader  from './components/PageHeader';
import { ProgressSteps } from './components/ProgressSteps';
import { ThumbnailUploader } from './components/ThumbnailUploader';
import { CourseTextInput } from './components/CourseTextInput';
import { CourseSelect } from './components/CourseSelect';
import { CourseTextArea } from './components/CourseTextArea';
import { TechnologyDropdown } from './components/TechnologyDropdown';
import { useState } from 'react';

interface Errors {
  title: boolean;
  category: boolean;
  description: boolean;
  estimatedTime: boolean;
  technologies: boolean;
  thumbnail: boolean;
}

const BasicCourseDetails: React.FC = () => {
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState<CourseDetails>({
    title: '',
    category: '',
    description: '',
    estimatedTime: '',
    thumbnail: null,
    technologies: []
  });

  const [errors, setErrors] = useState<Errors>({
    title: false,
    category: false,
    description: false,
    estimatedTime: false,
    technologies: false,
    thumbnail: false
  });

  const [estimatedTimeError, setEstimatedTimeError] = useState<string>('');
  const [thumbnailError, setThumbnailError] = useState<string>('');


  const handleThumbnailChange = (file: File | null) => {
    setCourseDetails((prev: CourseDetails) => ({
      ...prev,
      thumbnail: file
    }));
  };


  const handleCheckboxTechnologyChange = (tech: string) => {
    setCourseDetails((prev: CourseDetails) => {
      let updatedTechnologies = [...prev.technologies];
      if (updatedTechnologies.includes(tech)) {
        updatedTechnologies = updatedTechnologies.filter(t => t !== tech);
      } else {
        updatedTechnologies = [...updatedTechnologies, tech];
      }
      return { ...prev, technologies: updatedTechnologies };
    });
    setErrors((prevErrors: Errors) => ({ ...prevErrors, technologies: false }));
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

    console.log("Course Details to be passed to next step:", courseDetails);
    navigate('/coordinator/upload-materials');
  };

  const handleEstimatedTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseDetails((prev: CourseDetails) => ({ ...prev, estimatedTime: value }));
    setErrors((prevErrors: Errors) => ({ ...prevErrors, estimatedTime: false }));

    if (value && isNaN(Number(value))) {
      setEstimatedTimeError("Please enter a valid number for estimated time (hours).");
      setErrors((prevErrors: Errors) => ({ ...prevErrors, estimatedTime: true }));
    } else if (value && Number(value) < 0) {
      setEstimatedTimeError("Estimated time cannot be negative.");
      setErrors((prevErrors: Errors) => ({ ...prevErrors, estimatedTime: true }));
    } else {
      setEstimatedTimeError("");
    }
  };

  // Function to handle "Save as Draft"
  const handleSaveDraft = () => {
    const draftCourse = { ...courseDetails, status: 'draft' };
    localStorage.setItem('draftCourse', JSON.stringify(draftCourse)); 
    navigate('/coordinator/Recommend'); 
  };


  return (
    <div className="bg-[#52007C] p-6 relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#52007C] -z-10"></div>

      <PageHeader
        onSaveDraft={handleSaveDraft} 
      />

      <ProgressSteps currentStep={1} />

      <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-2xl p-6 h-auto">
        <h2 className="text-lg font-['Unbounded'] text-[#ffffff] mb-6">Course Details</h2>

        <div className="grid grid-cols-4 gap-x-6">
          <div>
            <ThumbnailUploader
              thumbnail={courseDetails.thumbnail}
              onThumbnailChange={handleThumbnailChange}
              setThumbnailError={setThumbnailError}
              setErrors={setErrors}
            />
             {errors.thumbnail && thumbnailError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{thumbnailError}</p>}
          </div>

          <div className="col-span-3 space-y-4">
            <CourseTextInput
              label="Course Title"
              placeholder="Enter Course Title"
              value={courseDetails.title}
              onChange={(e) => {
                setCourseDetails((prev: CourseDetails) => ({ ...prev, title: e.target.value }));
                setErrors((prevErrors: Errors) => ({ ...prevErrors, title: false }));
              }}
              error={errors.title}
              errorMessage="Course Title is required."
            />

            <CourseSelect
              label="Course Category"
              value={courseDetails.category}
              onChange={(e) => {
                setCourseDetails((prev: CourseDetails) => ({ ...prev, category: e.target.value }));
                setErrors((prevErrors: Errors) => ({ ...prevErrors, category: false }));
              }}
              error={errors.category}
              errorMessage="Course Category is required."
              options={courseCategories}
            />

            <CourseTextArea
              label="Course Description"
              placeholder="Enter course description"
              rows={4}
              value={courseDetails.description}
              onChange={(e) => {
                setCourseDetails((prev: CourseDetails) => ({ ...prev, description: e.target.value }));
                setErrors((prevErrors: Errors) => ({ ...prevErrors, description: false }));
              }}
              error={errors.description}
              errorMessage=""
            />

            <CourseTextInput
              label="Estimated Time (Hours)"
              placeholder="Hours"
              value={courseDetails.estimatedTime}
              onChange={handleEstimatedTimeChange}
              error={errors.estimatedTime || !!estimatedTimeError}
              errorMessage={estimatedTimeError || "Estimated Time is invalid."}
            />

            <TechnologyDropdown
              label="Technologies"
              selectedTechnologies={courseDetails.technologies}
              availableTechnologies={availableTechnologies}
              onTechnologyChange={handleCheckboxTechnologyChange}
              errors={errors}
            />
          </div>
        </div>


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