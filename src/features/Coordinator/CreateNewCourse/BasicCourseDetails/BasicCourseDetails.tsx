// // features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails.tsx
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useCourseContext } from '../../contexts/CourseContext';
// import toast from 'react-hot-toast';

// import { BasicCourseDetailsState, CategoryOption, TechnologyOption, CourseDto, UpdateCourseCoordinatorDtoFE } from '../../../../types/course.types';
// import { getCourseCategories, getTechnologies, createCourse, getCourseById, updateCourseBasicDetails } from '../../../../api/services/courseService';

// import FormTextInput from './components/FormTextInput';
// import FormSelect from './components/FormSelect';
// import FormTextArea from './components/FormTextArea';
// import ThumbnailUpload from './components/ThumbnailUpload';
// import TechnologyDropdown from './components/TechnologyDropdown';
// import ProgressSteps from './components/ProgressSteps';

// const BasicCourseDetails: React.FC = () => {
//     const navigate = useNavigate();
//     const { courseId: courseIdFromParams } = useParams<{ courseId?: string }>();
//     const {
//         courseData: contextCourseData,
//         updateBasicCourseDetails: updateContextBasicDetails, // Renamed for clarity from context
//         setCreatedCourseId,
//         resetCourseContext
//     } = useCourseContext();

//     const getInitialDetailsState = (): BasicCourseDetailsState => ({
//         title: '',
//         description: '',
//         estimatedTime: '',
//         categoryId: '',
//         technologies: [],
//         thumbnail: null,
//     });

//     const [details, setDetails] = useState<BasicCourseDetailsState>(getInitialDetailsState());
//     const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
//     const [availableTechnologies, setAvailableTechnologies] = useState<TechnologyOption[]>([]);
//     const [errors, setErrors] = useState({ title: '', category: '', estimatedTime: '', technologies: '', thumbnail: '' });

//     const [isSubmitting, setIsSubmitting] = useState(false); // For API submission (create/update)
//     const [isPageLoading, setIsPageLoading] = useState(true); // For initial data fetch (lookups + existing course if any)
//     const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

//     const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);
//     const [isTechnologiesDropdownOpen, setIsTechnologiesDropdownOpen] = useState<boolean>(false);
//     const technologiesDropdownRef = useRef<HTMLDivElement>(null);
//     const initialLoadDoneRef = useRef(false); // To prevent re-fetching on minor context changes after initial load

//     // Fetch lookups (categories, technologies) - Runs once
//     useEffect(() => {
//         let isMounted = true;
//         setIsPageLoading(true); // Indicate overall page loading starts
//         const fetchLookups = async () => {
//             try {
//                 const [categories, technologies] = await Promise.all([
//                     getCourseCategories(),
//                     getTechnologies(),
//                 ]);
//                 if (isMounted) {
//                     setAvailableCategories(categories.map(c => ({ id: c.id, title: c.title })));
//                     setAvailableTechnologies(technologies.map(t => ({ id: t.id, name: t.name })));
//                     console.log('Fetched Categories & Technologies');
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch lookups:', error);
//                 if (isMounted) toast.error('Failed to load form options.');
//             } finally {
//                 // Do not set isPageLoading to false here; let the course loading logic handle it
//             }
//         };
//         fetchLookups();
//         return () => { isMounted = false; };
//     }, []); // Empty dependency array, runs once

//     // Load existing course data if courseId is present in URL or resume from context
//     useEffect(() => {
//         let isMounted = true;
//         // setIsPageLoading(true) is set initially by the component for lookups and course data.

//         const loadCourseForEditing = async (idToLoad: number) => {
//             if (!isMounted) return;
//             setIsPageLoading(true); // Explicitly set loading when fetching
//             try {
//                 console.log(`EFFECT: Attempting to load course ID: ${idToLoad} for editing.`);
//                 const loadingToastId = toast.loading(`Loading course details...`, { id: `loading-course-${idToLoad}` });
//                 const fetchedCourse = await getCourseById(idToLoad);

//                 if (isMounted) {
//                     const loadedDetails: BasicCourseDetailsState = {
//                         title: fetchedCourse.title,
//                         description: fetchedCourse.description || '',
//                         estimatedTime: fetchedCourse.estimatedTime.toString(),
//                         categoryId: fetchedCourse.category.id,
//                         technologies: fetchedCourse.technologies.map(t => t.id),
//                         thumbnail: null, // Thumbnail from API is a URL, not File. User re-uploads to change.
//                     };
//                     setDetails(loadedDetails);
//                     updateContextBasicDetails(loadedDetails);
//                     setCreatedCourseId(idToLoad);
//                     setEditingCourseId(idToLoad);
//                     toast.dismiss(loadingToastId);
//                     toast.success("Course details loaded for editing.");
//                 }
//             } catch (error) {
//                 if (isMounted) {
//                     toast.dismiss(`loading-course-${idToLoad}`);
//                     console.error("Failed to load course for editing:", error);
//                     toast.error("Could not load course. Starting new course form.");
//                     setDetails(getInitialDetailsState());
//                     setEditingCourseId(null);
//                     resetCourseContext();
//                 }
//             } finally {
//                 if (isMounted) {
//                     setIsPageLoading(false);
//                     initialLoadDoneRef.current = true;
//                 }
//             }
//         };

//         const paramId = courseIdFromParams ? parseInt(courseIdFromParams, 10) : null;

//         if (paramId && !isNaN(paramId)) {
//             if (!initialLoadDoneRef.current || editingCourseId !== paramId) { // Fetch if not done or ID changed
//                 loadCourseForEditing(paramId);
//             } else {
//                 if (isMounted) setIsPageLoading(false); // Already loaded this ID
//             }
//         } else if (contextCourseData.createdCourseId) {
//             if (!initialLoadDoneRef.current || editingCourseId !== contextCourseData.createdCourseId) { // Resume from context if not done or ID changed
//                 console.log("EFFECT: Resuming draft from context for course ID:", contextCourseData.createdCourseId);
//                 if (isMounted) {
//                     setDetails(contextCourseData.basicDetails);
//                     setEditingCourseId(contextCourseData.createdCourseId);
//                     // Ensure createdCourseId in context is also set if it wasn't already
//                     setCreatedCourseId(contextCourseData.createdCourseId);
//                 }
//             }
//             if (isMounted) setIsPageLoading(false);
//         } else {
//             // Truly new course
//             console.log("EFFECT: Initializing for new course creation.");
//             if (isMounted) {
//                 if (editingCourseId !== null || (details.title && !initialLoadDoneRef.current)) { // Only reset if coming from an edit or if initial load hasn't populated from context
//                     setDetails(getInitialDetailsState());
//                 }
//                 setEditingCourseId(null);
//                 // setCreatedCourseId(null); // Context should be reset by handleGoBackToDashboard if navigating away
//             }
//             if (isMounted) {
//                 setIsPageLoading(false);
//                 initialLoadDoneRef.current = true;
//             }
//         }

//         return () => { isMounted = false; };
//     }, [courseIdFromParams, contextCourseData.createdCourseId]); // Only depend on IDs that trigger a change in what course to load/resume
//                                                               // And contextCourseData.basicDetails removed to prevent loops; direct prefill handled.

//     // Click outside dropdown handler
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
//                 setIsTechnologiesDropdownOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []); // technologiesDropdownRef is stable

//     const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setDetails(prev => ({ ...prev, [name]: value }));
//         setErrors(prev => ({ ...prev, [name]: '' }));
//     }, []);

//     const processAndSetThumbnail = useCallback((file: File) => {
//         const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         const maxSizeMB = 2;
//         const maxSizeByte = maxSizeMB * 1024 * 1024;
//         let error = '';
//         if (!allowedImageTypes.includes(file.type)) { error = "Invalid file type. JPG, PNG, GIF only."; }
//         else if (file.size > maxSizeByte) { error = `Image size < ${maxSizeMB}MB.`; }
//         setErrors(prev => ({ ...prev, thumbnail: error }));
//         setDetails(prev => ({ ...prev, thumbnail: error ? null : file }));
//     }, []);

//     const handleThumbnailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0] || null;
//         if (file) processAndSetThumbnail(file);
//         else setDetails(prev => ({ ...prev, thumbnail: null }));
//     }, [processAndSetThumbnail]);

//     const handleThumbnailDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
//         event.preventDefault(); setIsDraggingThumbnail(false);
//         const file = event.dataTransfer?.files?.[0];
//         if (file) processAndSetThumbnail(file);
//     }, [processAndSetThumbnail]);

//     const handleTechnologyChange = useCallback((techId: string) => {
//         setDetails(prev => ({
//             ...prev,
//             technologies: prev.technologies.includes(techId)
//                 ? prev.technologies.filter(id => id !== techId)
//                 : [...prev.technologies, techId]
//         }));
//         setErrors(prev => ({ ...prev, technologies: '' }));
//     }, []);

//     const validateForm = useCallback((): boolean => {
//         let isValid = true;
//         const newErrors = { title: '', category: '', estimatedTime: '', technologies: '', thumbnail: errors.thumbnail };
//         if (!details.title.trim()) { newErrors.title = 'Course Title is required.'; isValid = false; }
//         else if (details.title.length > 200) { newErrors.title = 'Max 200 chars.'; isValid = false; }
//         if (!details.categoryId) { newErrors.category = 'Category is required.'; isValid = false; }
//         if (!details.estimatedTime.trim()) { newErrors.estimatedTime = 'Estimated Time is required.'; isValid = false; }
//         else {
//             const timeNum = Number(details.estimatedTime);
//             if (isNaN(timeNum) || !Number.isInteger(timeNum) || timeNum <= 0 || timeNum > 1000) {
//                 newErrors.estimatedTime = 'Valid hours (1-1000).'; isValid = false;
//             }
//         }
//         if (details.technologies.length === 0) { newErrors.technologies = 'Select at least one technology.'; isValid = false; }
//         if (newErrors.thumbnail) isValid = false;
//         setErrors(newErrors);
//         return isValid;
//     }, [details, errors.thumbnail]);

//     const handleNext = async () => {
//         if (!validateForm()) {
//             toast.error('Please fix errors in the form.');
//             return;
//         }
//         setIsSubmitting(true); // Changed from setIsLoading to isSubmitting
//         const currentActiveCourseId = editingCourseId || contextCourseData.createdCourseId;

//         const estimatedTimeNumber = parseInt(details.estimatedTime, 10);
//         // This check is already in validateForm, but good for defense
//         if (isNaN(estimatedTimeNumber)) {
//             toast.error("Invalid Estimated Time."); setIsSubmitting(false); return;
//         }

//         const coursePayload: UpdateCourseCoordinatorDtoFE = {
//             title: details.title.trim(),
//             description: details.description?.trim() || undefined,
//             estimatedTime: estimatedTimeNumber,
//             categoryId: details.categoryId,
//             technologyIds: details.technologies,
//         };

//         const operationToastId = toast.loading(currentActiveCourseId ? 'Updating course...' : 'Creating course...');

//         try {
//             let courseResponse: CourseDto;
//             if (currentActiveCourseId) {
//                 courseResponse = await updateCourseBasicDetails(currentActiveCourseId, coursePayload, details.thumbnail);
//                 toast.success(`Course '${courseResponse.title}' updated!`);
//             } else {
//                 // For createCourse, payload structure is the same as UpdateCourseCoordinatorDtoFE for non-file parts
//                 courseResponse = await createCourse(coursePayload, details.thumbnail);
//                 toast.success(`Course '${courseResponse.title}' created!`);
//             }
//             toast.dismiss(operationToastId);

//             updateContextBasicDetails(details); // Update context with the form's current state
//             setCreatedCourseId(courseResponse.id); // Ensure context always has the latest (or new) ID
//             setEditingCourseId(courseResponse.id); // After create/update, we are "editing" this course ID

//             console.log(`Course ${currentActiveCourseId ? 'updated' : 'created'}, ID: ${courseResponse.id}`);
//             navigate(`/coordinator/upload-materials/${courseResponse.id}`);

//         } catch (error: any) {
//             toast.dismiss(operationToastId);
//             console.error(`Course ${currentActiveCourseId ? 'update' : 'creation'} failed:`, error);
//             // Generic error toast handled by apiClient.ts interceptor
//         } finally {
//             setIsSubmitting(false); // Changed from setIsLoading
//         }
//     };

//     const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
//     const handleDragEnter = () => { setIsDraggingThumbnail(true); };
//     const handleDragLeave = () => { setIsDraggingThumbnail(false); };

//     const handleGoBackToDashboard = () => {
//         // Check if form has any meaningful data
//         const isFormDirty = details.title || details.description || details.categoryId || details.estimatedTime || details.technologies.length > 0 || details.thumbnail;
//         if (isFormDirty) {
//             if (window.confirm("You have unsaved changes. Are you sure you want to leave and discard them?")) {
//                 resetCourseContext();
//                 navigate('/coordinator/dashboard');
//             }
//         } else {
//             resetCourseContext();
//             navigate('/coordinator/dashboard');
//         }
//     };

//     const currentDisplayId = editingCourseId || contextCourseData.createdCourseId;

//     if (isPageLoading) {
//         return (
//             <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
//                 <p className="text-white text-xl">Loading...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-[#52007C] p-6 relative min-h-screen">
//             <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#52007C] -z-10"></div>
//             <div className="bg-white rounded-2xl p-4 mb-6">
//                 <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-4">
//                         <button
//                             onClick={handleGoBackToDashboard}
//                             className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
//                             aria-label="Back to dashboard"
//                         >
//                             <ArrowLeft size={20} className="text-[#1B0A3F]" />
//                         </button>
//                         <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
//                             {currentDisplayId ? 'Edit Course Details' : 'Create New Course'}
//                         </h1>
//                     </div>
//                     <button
//                         disabled={isSubmitting} // Use isSubmitting
//                         className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors h-10 disabled:opacity-50"
//                         // onClick={handleSaveDraft} // TODO: Implement actual save draft
//                     >
//                         Save as Draft 
//                     </button>
//                 </div>
//             </div>

//             <ProgressSteps /> {/* This should ideally take a `currentStep={1}` prop */}

//             <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-2xl p-6 h-auto">
//                 <h2 className="text-lg font-['Unbounded'] text-[#ffffff] mb-6">Course Details</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="md:col-span-1">
//                         <ThumbnailUpload
//                             thumbnail={details.thumbnail}
//                             error={!!errors.thumbnail}
//                             errorMessage={errors.thumbnail}
//                             isDragging={isDraggingThumbnail}
//                             setIsDragging={setIsDraggingThumbnail}
//                             onFileInputChange={handleThumbnailChange}
//                             onDrop={handleThumbnailDrop}
//                             onDragOver={handleDragOver}
//                             onDragEnter={handleDragEnter}
//                             onDragLeave={handleDragLeave}
//                         />
//                     </div>
//                     <div className="md:col-span-2 space-y-4">
//                         <FormTextInput label="Course Title *" name="title" value={details.title} onChange={handleInputChange} error={!!errors.title} errorMessage={errors.title} />
//                         <FormSelect label="Course Category *" name="categoryId" value={details.categoryId} onChange={handleInputChange} error={!!errors.category} errorMessage={errors.category} options={availableCategories} placeholder="Select Category" />
//                         <FormTextArea label="Course Description" name="description" value={details.description} onChange={handleInputChange} />
//                         <FormTextInput label="Estimated Time (Hours) *" name="estimatedTime" value={details.estimatedTime} onChange={handleInputChange} error={!!errors.estimatedTime} errorMessage={errors.estimatedTime} type="text" placeholder="e.g., 10" />
//                         <TechnologyDropdown
//                             selectedTechnologyIds={details.technologies}
//                             availableTechnologies={availableTechnologies}
//                             error={!!errors.technologies}
//                             errorMessage={errors.technologies}
//                             onTechnologyChange={handleTechnologyChange}
//                             isOpen={isTechnologiesDropdownOpen}
//                             setIsOpen={setIsTechnologiesDropdownOpen}
//                             dropdownRef={technologiesDropdownRef}
//                         />
//                     </div>
//                 </div>
//                 <div className="flex justify-end mt-8">
//                     <button
//                         onClick={handleNext}
//                         disabled={isSubmitting || isPageLoading} // Disable if page is still loading data or submitting
//                         className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] font-bold hover:bg-[#D68BF9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {isSubmitting ? (currentDisplayId ? 'Updating...' : 'Creating...') : 'Save & Next'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BasicCourseDetails;

// features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseContext } from '../../contexts/CourseContext';
import toast from 'react-hot-toast';

import { BasicCourseDetailsState, CategoryOption, TechnologyOption, CourseDto, UpdateCourseCoordinatorDtoFE } from '../../../../types/course.types';
import { getCourseCategories, getTechnologies, createCourse, getCourseById, updateCourseBasicDetails } from '../../../../api/services/Course/courseService';

import FormTextInput from './components/FormTextInput';
import FormSelect from './components/FormSelect';
import FormTextArea from './components/FormTextArea';
import ThumbnailUpload from './components/ThumbnailUpload';
import TechnologyDropdown from './components/TechnologyDropdown';
import ProgressSteps from './components/ProgressSteps';

const BasicCourseDetails: React.FC = () => {
    const navigate = useNavigate();
    const { courseId: courseIdFromParams } = useParams<{ courseId?: string }>();
    const {
        courseData: contextCourseData,
        updateBasicCourseDetails: updateContextBasicDetails,
        setCreatedCourseId,
        resetCourseContext
    } = useCourseContext();

    const getInitialDetailsState = useCallback((): BasicCourseDetailsState => ({
        title: '', description: '', estimatedTime: '', categoryId: '', technologies: [], thumbnail: null,
    }), []);

    const [details, setDetails] = useState<BasicCourseDetailsState>(getInitialDetailsState);
    const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<TechnologyOption[]>([]);
    const [errors, setErrors] = useState({ title: '', category: '', estimatedTime: '', technologies: '', thumbnail: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentEditingCourseId, setCurrentEditingCourseId] = useState<number | null>(null);

    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);
    const [isTechnologiesDropdownOpen, setIsTechnologiesDropdownOpen] = useState<boolean>(false);
    const technologiesDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch lookups (categories, technologies)
    useEffect(() => {
        let isMounted = true;
        const fetchLookups = async () => {
            setIsPageLoading(true); // Set loading for lookups as well initially
            try {
                const [categories, technologies] = await Promise.all([
                    getCourseCategories(),
                    getTechnologies(),
                ]);
                if (isMounted) {
                    setAvailableCategories(categories.map(c => ({ id: c.id, title: c.title })));
                    setAvailableTechnologies(technologies.map(t => ({ id: t.id, name: t.name })));
                }
            } catch (error) {
                if (isMounted) toast.error('Failed to load form options.');
                console.error('Failed to fetch lookups:', error);
            } finally {
                // isPageLoading will be set to false by the next useEffect after it decides course data state
            }
        };
        fetchLookups();
        return () => { isMounted = false; };
    }, []);

    // Load existing course data or initialize for new course
    useEffect(() => {
        let isMounted = true;
        setIsPageLoading(true); // Start true, will be set false at the end of all paths

        const paramId = courseIdFromParams ? parseInt(courseIdFromParams, 10) : null;
        const contextId = contextCourseData.createdCourseId;
        const targetCourseId = paramId && !isNaN(paramId) ? paramId : contextId;

        const loadCourseForEditing = async (idToLoad: number) => {
            if (!isMounted) return;
            console.log(`BasicDetails: Loading course ID: ${idToLoad} for editing.`);
            const loadingToastId = toast.loading(`Loading course details...`, { id: `loading-course-${idToLoad}`});
            try {
                const fetchedCourse = await getCourseById(idToLoad);
                if (isMounted) {
                    const loadedDetails: BasicCourseDetailsState = {
                        title: fetchedCourse.title,
                        description: fetchedCourse.description || '',
                        estimatedTime: fetchedCourse.estimatedTime.toString(),
                        categoryId: fetchedCourse.category.id,
                        technologies: fetchedCourse.technologies.map(t => t.id),
                        thumbnail: null,
                    };
                    setDetails(loadedDetails);
                    updateContextBasicDetails(loadedDetails);
                    setCreatedCourseId(idToLoad);
                    setCurrentEditingCourseId(idToLoad);
                    toast.success("Course details loaded.", { id: loadingToastId });
                }
            } catch (error) {
                if (isMounted) {
                    toast.error("Could not load course. Starting new.", { id: loadingToastId });
                    console.error(`BasicDetails: Failed to load course ${idToLoad}:`, error);
                    navigate('/coordinator/course-details', { replace: true });
                    resetCourseContext();
                    setDetails(getInitialDetailsState());
                    setCurrentEditingCourseId(null);
                }
            } finally {
                if (isMounted) setIsPageLoading(false);
            }
        };

        if (targetCourseId) {
            if (currentEditingCourseId !== targetCourseId || (targetCourseId === contextId && JSON.stringify(details) !== JSON.stringify(contextCourseData.basicDetails))) {
                 // Load if target ID is different from current editing ID,
                 // OR if target ID is from context and local details don't match context's basicDetails (e.g. user navigated back, context changed)
                loadCourseForEditing(targetCourseId);
            } else {
                if (isMounted) setIsPageLoading(false);
            }
        } else {
            // Truly new course
            if (isMounted) {
                if (currentEditingCourseId !== null || details.title !== '') { // Only reset if not already in initial new state
                    setDetails(getInitialDetailsState());
                }
                setCurrentEditingCourseId(null);
                // If navigating to new course creation, ensure context.createdCourseId is also null
                if(contextCourseData.createdCourseId !== null) {
                    setCreatedCourseId(null); // Reset context id for new course
                }
            }
            if (isMounted) setIsPageLoading(false);
        }
        return () => { isMounted = false; };
    }, [courseIdFromParams, contextCourseData.createdCourseId, contextCourseData.basicDetails, getInitialDetailsState, navigate, resetCourseContext, setCreatedCourseId, updateContextBasicDetails, currentEditingCourseId]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (technologiesDropdownRef.current && !technologiesDropdownRef.current.contains(event.target as Node)) {
                setIsTechnologiesDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    const processAndSetThumbnail = useCallback((file: File) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSizeMB = 2;
        const maxSizeByte = maxSizeMB * 1024 * 1024;
        let error = '';
        if (!allowedImageTypes.includes(file.type)) { error = "Invalid file type. JPG, PNG, GIF only."; }
        else if (file.size > maxSizeByte) { error = `Image size < ${maxSizeMB}MB.`; }
        setErrors(prev => ({ ...prev, thumbnail: error }));
        setDetails(prev => ({ ...prev, thumbnail: error ? null : file }));
    }, []);

    const handleThumbnailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) processAndSetThumbnail(file);
        else setDetails(prev => ({ ...prev, thumbnail: null }));
    }, [processAndSetThumbnail]);

    const handleThumbnailDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); setIsDraggingThumbnail(false);
        const file = event.dataTransfer?.files?.[0];
        if (file) processAndSetThumbnail(file);
    }, [processAndSetThumbnail]);

    const handleTechnologyChange = useCallback((techId: string) => {
        setDetails(prev => ({
            ...prev,
            technologies: prev.technologies.includes(techId)
                ? prev.technologies.filter(id => id !== techId)
                : [...prev.technologies, techId]
        }));
        setErrors(prev => ({ ...prev, technologies: '' }));
    }, []);

    const validateForm = useCallback((): boolean => {
        let isValid = true;
        const newErrors = { title: '', category: '', estimatedTime: '', technologies: '', thumbnail: errors.thumbnail };
        if (!details.title.trim()) { newErrors.title = 'Course Title is required.'; isValid = false; }
        else if (details.title.length > 200) { newErrors.title = 'Max 200 chars.'; isValid = false; }
        if (!details.categoryId) { newErrors.category = 'Category is required.'; isValid = false; }
        if (!details.estimatedTime.trim()) { newErrors.estimatedTime = 'Estimated Time is required.'; isValid = false; }
        else {
            const timeNum = Number(details.estimatedTime);
            if (isNaN(timeNum) || !Number.isInteger(timeNum) || timeNum <= 0 || timeNum > 1000) {
                newErrors.estimatedTime = 'Valid hours (1-1000).'; isValid = false;
            }
        }
        if (details.technologies.length === 0) { newErrors.technologies = 'Select at least one technology.'; isValid = false; }
        if (newErrors.thumbnail) isValid = false; // Keep existing thumbnail error if any
        setErrors(newErrors);
        return isValid;
    }, [details, errors.thumbnail]);

    const performSaveOperation = async (isDraft: boolean) => {
        if (!validateForm() && !isDraft) { // For "Save & Next", full validation is needed
            toast.error('Please fix errors in the form.');
            return;
        }
        if (isDraft && !details.title.trim()) { // For "Save Draft", only title is minimal requirement
            toast.error('Course Title is required to save a draft.');
            setErrors(prev => ({ ...prev, title: 'Course Title is required.'}));
            return;
        }

        setIsSubmitting(true);
        const activeCourseId = currentEditingCourseId || contextCourseData.createdCourseId;
        const estimatedTimeNumber = parseInt(details.estimatedTime, 10); // Parse, default if NaN later

        const payload: UpdateCourseCoordinatorDtoFE = { // Using one DTO for both create/update payload
            title: details.title.trim(),
            description: details.description?.trim() || undefined,
            estimatedTime: isNaN(estimatedTimeNumber) ? 0 : estimatedTimeNumber, // Backend might validate this better
            categoryId: details.categoryId, // Send empty if not selected, backend might validate
            technologyIds: details.technologies,
        };

        const operationType = activeCourseId ? (isDraft ? "Saving draft..." : "Updating course...") : (isDraft ? "Creating draft..." : "Creating course...");
        const toastId = toast.loading(operationType);

        try {
            let response: CourseDto;
            if (activeCourseId) {
                response = await updateCourseBasicDetails(activeCourseId, payload, details.thumbnail);
                toast.success(`Course '${response.title}' ${isDraft ? 'draft updated' : 'updated'}!`, { id: toastId });
            } else {
                response = await createCourse(payload, details.thumbnail);
                toast.success(`Course '${response.title}' ${isDraft ? 'draft created' : 'created'}!`, { id: toastId });
            }

            updateContextBasicDetails(details);
            setCreatedCourseId(response.id);
            setCurrentEditingCourseId(response.id);

            if (!isDraft) {
                navigate(`/coordinator/upload-materials/${response.id}`);
            } else {
                 // Optionally navigate for draft save, or just stay
                 // navigate('/coordinator/dashboard');
                 console.log(`Draft saved for course ID: ${response.id}`);
            }
        } catch (error) {
            toast.error(`${isDraft ? 'Draft save' : (activeCourseId ? 'Update' : 'Creation')} failed.`, { id: toastId });
            console.error("Error in performSaveOperation:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => performSaveOperation(false);
    const handleSaveDraft = () => performSaveOperation(true);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDragEnter = () => setIsDraggingThumbnail(true);
    const handleDragLeave = () => setIsDraggingThumbnail(false);

    const handleGoBackToDashboard = useCallback(() => {
        const isDirty = details.title || details.description || details.categoryId || details.estimatedTime || details.technologies.length > 0 || details.thumbnail;
        if (isDirty && !window.confirm("You have unsaved changes and are about to leave this page. Are you sure?")) {
            return;
        }
        resetCourseContext();
        setCurrentEditingCourseId(null);
        setDetails(getInitialDetailsState());
        navigate('/coordinator/dashboard');
    }, [details, navigate, resetCourseContext, getInitialDetailsState]);
    
    const displayIdForTitle = currentEditingCourseId || contextCourseData.createdCourseId;

    if (isPageLoading) {
        return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center"><p className="text-white text-xl">Loading...</p></div>;
    }

    return (
        <div className="bg-[#52007C] p-6 relative min-h-screen">
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#52007C] -z-10"></div>
            <div className="bg-white rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGoBackToDashboard}
                            className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
                            aria-label="Back to dashboard"
                            disabled={isSubmitting}
                        >
                            <ArrowLeft size={20} className="text-[#1B0A3F]" />
                        </button>
                        <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
                            {displayIdForTitle ? 'Edit Course Details' : 'Create New Course'}
                        </h1>
                    </div>
                    <button
                        onClick={handleSaveDraft}
                        disabled={isSubmitting || isPageLoading}
                        className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] hover:bg-[#D68BF9] transition-colors h-10 disabled:opacity-50 w-[160px] text-center"
                    >
                        {isSubmitting && !displayIdForTitle ? 'Creating Draft...' : isSubmitting && displayIdForTitle ? 'Saving Draft...' : 'Save as Draft'}
                    </button>
                </div>
            </div>

            <ProgressSteps /> {/* Consider passing currentStep={1} */}

            <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-2xl p-6 h-auto">
                <h2 className="text-lg font-['Unbounded'] text-[#ffffff] mb-6">Course Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <ThumbnailUpload thumbnail={details.thumbnail} error={!!errors.thumbnail} errorMessage={errors.thumbnail} isDragging={isDraggingThumbnail} setIsDragging={setIsDraggingThumbnail} onFileInputChange={handleThumbnailChange} onDrop={handleThumbnailDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}/>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <FormTextInput label="Course Title *" name="title" value={details.title} onChange={handleInputChange} error={!!errors.title} errorMessage={errors.title} />
                        <FormSelect label="Course Category *" name="categoryId" value={details.categoryId} onChange={handleInputChange} error={!!errors.category} errorMessage={errors.category} options={availableCategories} placeholder="Select Category" />
                        <FormTextArea label="Course Description" name="description" value={details.description} onChange={handleInputChange} />
                        <FormTextInput label="Estimated Time (Hours) *" name="estimatedTime" value={details.estimatedTime} onChange={handleInputChange} error={!!errors.estimatedTime} errorMessage={errors.estimatedTime} type="text" placeholder="e.g., 10" />
                        <TechnologyDropdown selectedTechnologyIds={details.technologies} availableTechnologies={availableTechnologies} error={!!errors.technologies} errorMessage={errors.technologies} onTechnologyChange={handleTechnologyChange} isOpen={isTechnologiesDropdownOpen} setIsOpen={setIsTechnologiesDropdownOpen} dropdownRef={technologiesDropdownRef} />
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || isPageLoading}
                        className="px-6 py-3 bg-[#BF4BF6] text-white rounded-lg font-['Nunito_Sans'] font-bold hover:bg-[#D68BF9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (displayIdForTitle ? 'Updating...' : 'Creating...') : 'Save & Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BasicCourseDetails;