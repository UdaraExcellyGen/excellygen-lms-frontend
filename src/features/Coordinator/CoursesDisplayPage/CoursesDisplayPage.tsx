// features/Coordinator/CoursesDisplayPage/CoursesDisplayPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useCourseContext } from '../contexts/CourseContext';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseDto, CategoryDto as GlobalCategoryDto, TechnologyDto as GlobalTechnologyDto } from '../../../types/course.types';
import { GridCard } from './components/GridCard';
import { getAllCourses, deleteCourse as apiDeleteCourse, getCourseCategories, getTechnologies } from '../../../api/services/Course/courseService';

const CoursesDisplayPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseData: contextCourseData, resetCourseContext, setCreatedCourseId } = useCourseContext();
    const { user } = useAuth();

    const [allFetchedCourses, setAllFetchedCourses] = useState<CourseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [searchCategory, setSearchCategory] = useState(''); // Stores category ID for filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDeleteId, setCourseToDeleteId] = useState<number | null>(null);

    const [availableCategories, setAvailableCategories] = useState<GlobalCategoryDto[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<GlobalTechnologyDto[]>([]);

    // Fetch all courses, categories, and technologies on mount
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        Promise.all([
            getAllCourses(),
            getCourseCategories(),
            getTechnologies()
        ]).then(([fetchedCourses, fetchedCategories, fetchedTechnologies]) => {
            if (isMounted) {
                setAllFetchedCourses(fetchedCourses);
                setAvailableCategories(fetchedCategories); // Already filtered by backend
                setAvailableTechnologies(fetchedTechnologies);
                console.log("Fetched courses:", fetchedCourses);
                console.log("Fetched categories for filter:", fetchedCategories);
                console.log("Fetched technologies for context merge:", fetchedTechnologies);
            }
        }).catch(error => {
            if (isMounted) {
                console.error("Failed to fetch initial page data:", error);
                toast.error("Could not load course data or options.");
            }
        }).finally(() => {
            if (isMounted) setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []); // Empty dependency array for one-time fetch

    // Effect to merge/update the list with a newly created/updated course from context
    useEffect(() => {
        if (contextCourseData.createdCourseId && contextCourseData.basicDetails.title && user) {
            const newCourseId = contextCourseData.createdCourseId;
            const alreadyExistsInFetched = allFetchedCourses.some(c => c.id === newCourseId);

            // Construct the new/updated course object for display
            // It assumes new courses from context are 'Draft' until explicitly published
            const basicDetails = contextCourseData.basicDetails;
            const courseForDisplay: CourseDto = {
                id: newCourseId,
                title: basicDetails.title,
                description: basicDetails.description,
                estimatedTime: parseInt(basicDetails.estimatedTime, 10) || 0,
                thumbnailUrl: basicDetails.thumbnail
                    ? URL.createObjectURL(basicDetails.thumbnail)
                    : undefined,
                category: availableCategories.find(c => c.id === basicDetails.categoryId) || { id: basicDetails.categoryId, title: "Loading..." },
                technologies: basicDetails.technologies.map(techId => {
                    const foundTech = availableTechnologies.find(t => t.id === techId);
                    return { id: techId, name: foundTech?.name || `Tech...` };
                }),
                creator: { id: user.id, name: user.name },
                status: 'Draft', // Newly created/edited courses via context are initially drafts
                createdAt: new Date().toISOString(), // Placeholder, backend value would be source of truth on fetch
                lastUpdatedDate: new Date().toISOString(), // Placeholder
                lessons: [], // No detailed lessons from basic details context
                calculatedCoursePoints: 0,
            };

            if (!alreadyExistsInFetched) {
                console.log("Adding new course from context to display list, ID:", newCourseId);
                setAllFetchedCourses(prevCourses => [courseForDisplay, ...prevCourses]);
            } else {
                console.log("Updating existing course from context in display list, ID:", newCourseId);
                setAllFetchedCourses(prevCourses =>
                    prevCourses.map(c => c.id === newCourseId ? courseForDisplay : c)
                );
            }
            // Reset context ID after processing to avoid re-adding/updating on subsequent renders
            setCreatedCourseId(null);
        }
    }, [
        contextCourseData.createdCourseId,
        contextCourseData.basicDetails,
        user,
        allFetchedCourses, // Re-run if fetched courses change (e.g. after delete)
        availableCategories,
        availableTechnologies,
        setCreatedCourseId
    ]);

    const filteredCourses = useMemo(() => {
        return allFetchedCourses.filter(course => {
            const matchesCategory = searchCategory === '' || course.category.id === searchCategory;
            const matchesSearch = searchQuery === '' || course.title.toLowerCase().includes(searchQuery.toLowerCase());

            if (!user?.id) return false;

            let matchesFilter = false;
            // Assuming backend sends status as "Draft", "Published", "Archived" (PascalCase or exact strings)
            // Your CourseDto type expects: status: 'Draft' | 'Published' | 'Archived';
            const courseStatus = course.status;

            if (filter === 'all') {
                matchesFilter = course.creator.id === user.id;
            } else if (filter === 'draft') {
                matchesFilter = courseStatus === 'Draft' && course.creator.id === user.id;
            } else if (filter === 'published') {
                matchesFilter = courseStatus === 'Published' && course.creator.id === user.id;
            }
            // Add 'Archived' filter if needed and if your 'filter' state can accommodate it
            // else if (filter === 'archived') {
            //     matchesFilter = courseStatus === 'Archived' && course.creator.id === user.id;
            // }

            return matchesFilter && matchesCategory && matchesSearch;
        });
    }, [allFetchedCourses, filter, searchCategory, searchQuery, user?.id]);

    const handleDeleteCourseRequest = (id: number) => {
        setCourseToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (courseToDeleteId === null) return;
        const courseTitle = allFetchedCourses.find(c => c.id === courseToDeleteId)?.title || "this course";
        const toastId = toast.loading(`Deleting ${courseTitle}...`);
        try {
            await apiDeleteCourse(courseToDeleteId);
            setAllFetchedCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDeleteId));
            toast.dismiss(toastId);
            toast.success(`Course "${courseTitle}" deleted successfully.`);
        } catch (error) {
            toast.dismiss(toastId);
            console.error("Failed to delete course:", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setCourseToDeleteId(null);
        }
    };

    const cancelDeleteCourse = () => {
        setIsDeleteDialogOpen(false);
        setCourseToDeleteId(null);
    };

    const handleAddNewCourse = () => {
        resetCourseContext();
        navigate('/coordinator/course-details');
    };

    return (
        <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 font-['Unbounded'] text-sm tablet:p-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center tablet:p-4">
                 <div className="flex items-center gap-3 sm:gap-4">
                    <button aria-label="Back to Dashboard" className="text-black hover:text-gray-800"
                        onClick={() => navigate('/coordinator/dashboard')}>
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#52007C]" />
                    </button>
                    <h1 className="text-lg sm:text-[24px] font-semibold text-[#000000] tablet:text-xl">My Courses</h1>
                </div>
                <button className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-3 sm:px-4 py-1 sm:py-2 rounded-[40px] flex items-center gap-2 text-xs sm:text-sm tablet:px-3 tablet:py-1.5 tablet:text-xs"
                    onClick={handleAddNewCourse}>
                    <span>+</span>
                    <span className="text-xs sm:text-sm hidden sm:block tablet:text-xs">Add New Course</span>
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 sm:mb-6 flex justify-between items-center flex-col sm:flex-row gap-y-2 sm:gap-y-0 tablet:flex-row tablet:gap-x-4 tablet:mb-5">
                <div className="flex gap-2 sm:gap-4">
                    <button
                        className={`px-3 sm:px-4 py-2.5 rounded-[10px] text-xs sm:text-sm whitespace-nowrap ${filter === 'all' ? 'bg-[#BF4BF6] text-white' : 'bg-white text-violet-700'} tablet:px-3 tablet:py-2 tablet:text-xs`}
                        onClick={() => setFilter('all')}
                    >
                        All My Courses
                    </button>
                    <button
                        className={`px-3 sm:px-4 py-2.5 rounded-[10px] text-xs sm:text-sm whitespace-nowrap ${filter === 'draft' ? 'bg-[#BF4BF6] text-white' : 'bg-white text-violet-700'} tablet:px-3 tablet:py-2 tablet:text-xs`}
                        onClick={() => setFilter('draft')}
                    >
                        Draft
                    </button>
                    <button
                        className={`px-3 sm:px-4 py-2.5 rounded-[10px] text-xs sm:text-sm whitespace-nowrap ${filter === 'published' ? 'bg-[#BF4BF6] text-white' : 'bg-white text-violet-700'} tablet:px-3 tablet:py-2 tablet:text-xs`}
                        onClick={() => setFilter('published')}
                    >
                        Published
                    </button>
                </div>

                <div className="relative w-full sm:w-auto tablet:w-[250px]">
                     <select
                        className="p-1.5 sm:p-2 pl-2 sm:pl-3 rounded-xl border border-gray-200 appearance-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent text-xs sm:text-sm w-full sm:w-[300px] tablet:w-full tablet:text-xs"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                         {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.title}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 sm:right-3 top-0 h-full pointer-events-none flex items-center">
                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
            </div>

            <div className="mb-4 sm:mb-6 relative tablet:mb-5">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 text-[#7A00B8] mr-2 absolute left-2 sm:left-3 top-2/4 -translate-y-2/4" />
                <input
                    type="text"
                    placeholder="Search Courses by Title..."
                    className="w-full p-1.5 sm:p-2 pl-7 sm:pl-9 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent tablet:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="text-center text-white py-10">Loading courses...</div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 tablet:grid-cols-2 tablet:gap-5">
                    {filteredCourses.map((course) => (
                        <GridCard
                            key={course.id}
                            course={course}
                            onDeleteCourse={handleDeleteCourseRequest}
                            currentUserId={user?.id || ""}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white/10 rounded-xl p-8 text-center tablet:p-6">
                    <p className="text-white text-lg tablet:text-base">No courses found matching your criteria.</p>
                    <button
                        className="mt-4 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full tablet:px-3 tablet:py-1.5 tablet:text-sm"
                        onClick={() => {
                            setFilter('all');
                            setSearchCategory('');
                            setSearchQuery('');
                        }}
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {isDeleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20">
                    <div className="bg-white rounded-xl p-6 sm:p-8 w-[90%] max-w-md tablet:p-5">
                        <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 tablet:text-lg">Confirm Delete</h3>
                            <p className="text-gray-600 mb-4 sm:mb-6 text-sm tablet:text-sm">Are you sure you want to delete this course? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            <button
                                onClick={confirmDeleteCourse}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-colors text-xs sm:text-sm tablet:px-3 tablet:py-1.5 tablet:text-xs"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={cancelDeleteCourse}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-colors text-xs sm:text-sm tablet:px-3 tablet:py-1.5 tablet:text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesDisplayPage;