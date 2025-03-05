
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CourseDetailsFormProps {
  courseDetails: {
    title: string;
    category: string;
    description: string;
    estimatedTime: string;
    thumbnail: File | null;
    technologies: string[];
  };
  setCourseDetails: React.Dispatch<React.SetStateAction<{
    title: string;
    category: string;
    description: string;
    estimatedTime: string;
    thumbnail: File | null;
    technologies: string[];
  }>>;
  errors: {
    title: boolean;
    category: boolean;
    description: boolean;
    estimatedTime: boolean;
    technologies: boolean;
    thumbnail: boolean;
  };
  setErrors: React.Dispatch<React.SetStateAction<{
    title: boolean;
    category: boolean;
    description: boolean;
    estimatedTime: boolean;
    technologies: boolean;
    thumbnail: boolean;
  }>>;
  estimatedTimeError: string;
  setEstimatedTimeError: React.Dispatch<React.SetStateAction<string>>;
  isTechnologiesDropdownOpen: boolean;
  setIsTechnologiesDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  technologiesDropdownRef: React.RefObject<HTMLDivElement>;
  availableTechnologies: string[];
  courseCategories: string[];
}

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({
  courseDetails,
  setCourseDetails,
  errors,
  setErrors,
  estimatedTimeError,
  setEstimatedTimeError,
  isTechnologiesDropdownOpen,
  setIsTechnologiesDropdownOpen,
  technologiesDropdownRef,
  availableTechnologies,
  courseCategories
}) => {

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


  return (
    <div className="col-span-2 space-y-4">
        <div>
          <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Course Title</label>
          <input
            type="text"
            placeholder="Enter Course Title"
            className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
            value={courseDetails.title}
            onChange={(e) => {
              setCourseDetails(prev => ({ ...prev, title: e.target.value }));
              setErrors(prevErrors => ({ ...prevErrors, title: false }));
            }}
            style={{ color: 'white' }}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Course Title is required.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Course Category</label>
            <select
              className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
              value={courseDetails.category}
              onChange={(e) => {
                setCourseDetails(prev => ({ ...prev, category: e.target.value }));
                setErrors(prevErrors => ({ ...prevErrors, category: false }));
              }}
               style={{ color: 'white' }}
            >
              <option value="">Select Category</option>
              {courseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Course Category is required.</p>}
          </div>
        </div>

        <div>
          <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans'] ">Course Description</label>
          <textarea
            placeholder="Enter course description"
            rows={4}
            className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
            value={courseDetails.description}
            onChange={(e) => {
              setCourseDetails(prev => ({ ...prev, description: e.target.value }));
              setErrors(prevErrors => ({ ...prevErrors, description: false }));
            }}
             style={{ color: 'white' }}
          />
           {/* Error message for description is removed as it's now optional */}
        </div>

        <div>
          <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Estimated Time (Hours)</label>
          <input
            type="text"
            placeholder="Hours"
            className={`w-full p-2 border ${errors.estimatedTime ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
            value={courseDetails.estimatedTime}
            onChange={handleEstimatedTimeChange}
             style={{ color: 'white' }}
          />
          {estimatedTimeError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{estimatedTimeError}</p>}
          {errors.estimatedTime && !estimatedTimeError && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Estimated Time is invalid.</p>}
        </div>

        <div>
          <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">Technologies</label>
          <div className="relative" ref={technologiesDropdownRef}>
            <button
              type="button"
              className={`w-full p-2 border ${errors.technologies ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white flex justify-between items-center`}
              onClick={() => setIsTechnologiesDropdownOpen(!isTechnologiesDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isTechnologiesDropdownOpen}
            >
              {courseDetails.technologies.length > 0 ? courseDetails.technologies.join('   ,  ') : 'Select Technologies'}
              {isTechnologiesDropdownOpen ? <ChevronUp className="text-[#ffffff]" size={15} /> : <ChevronDown className="text-white" size={20} />}
            </button>
            {isTechnologiesDropdownOpen && (
              <div className="mt-1 w-full rounded-md shadow-lg bg-[#F6E6FF]/50 backdrop-blur-sm ring-1 ring-black ring-opacity-5 focus:outline-none" style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {availableTechnologies.map(tech => (
                    <div key={tech} className="px-4 py-2 hover:bg-[#8e8d8d] cursor-pointer" role="menuitem">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-[#BF4BF6] rounded border-gray-300 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
                          value={tech}
                          checked={courseDetails.technologies.includes(tech)}
                          onChange={() => handleCheckboxTechnologyChange(tech)}
                        />
                        <span className="ml-2 text-white font-['Nunito_Sans']">{tech}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.technologies && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">Please select at least one technology.</p>}
        </div>
      </div>
  );
};

export default CourseDetailsForm;