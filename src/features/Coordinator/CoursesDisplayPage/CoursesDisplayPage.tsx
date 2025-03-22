// features/createNewCourse/CoursesDisplayPage/CoursesDisplayPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Trash2, Edit, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCourseContext } from '../contexts/CourseContext';
import { Course } from './types/Course';
import { GridCard } from './components/GridCard';
import { mockCourses } from './data/mockCourses';

const CoursesDisplayPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseData } = useCourseContext();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDeleteId, setCourseToDeleteId] = useState<string | null>(null);
    const currentCoordinator = 'Sehani Silva';
    const [dropdownCategories, setDropdownCategories] = useState<string[]>([]);

    useEffect(() => {
        setCourses(mockCourses);
    }, []);

    useEffect(() => {
        if (courseData && courseData.basicDetails && courseData.basicDetails.title) {
            setCourses(currentCourses => {
                let allCourses = [...currentCourses];

                const existingCourseIndex = allCourses.findIndex(
                    c => c.title === courseData.basicDetails.title
                );

                const totalPoints = courseData.materials.reduce(
                    (sum, subtopic) => sum + (subtopic.subtopicPoints || 0),
                    0
                );

                const allMaterials = courseData.materials.flatMap(subtopic =>
                    subtopic.materials || []
                );

                const newCourse: Course = {
                    id: `course-${Date.now()}`,
                    title: courseData.basicDetails.title,
                    category: courseData.basicDetails.category,
                    description: courseData.basicDetails.description,
                    deadline: `${courseData.basicDetails.estimatedTime} days`,
                    thumbnailUrl: courseData.basicDetails.thumbnail
                        ? URL.createObjectURL(courseData.basicDetails.thumbnail)
                        : null,
                    coordinatorPoints: totalPoints.toString(),
                    materials: allMaterials,
                    quizDetails: null,
                    questions: [],
                    status: 'published',
                    instructor: 'Sehani Silva',
                    studentCount: 0,
                };

                if (existingCourseIndex >= 0) {
                    allCourses[existingCourseIndex] = newCourse;
                } else {
                    allCourses = [newCourse, ...allCourses];
                }

                return allCourses;
            });
        }
    }, [courseData]);


    const categories = useMemo(() => {
        const coordinatorCourseCategories = courses
            .filter(course => course.instructor === currentCoordinator)
            .map(course => course.category);

        const uniqueCategoriesSet = new Set(coordinatorCourseCategories);
        return Array.from(uniqueCategoriesSet).sort();
    }, [courses, currentCoordinator]);


    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesCategory = searchCategory === '' ||
                course.category.toLowerCase() === searchCategory.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesFilter = false;
            if (filter === 'all') {
                matchesFilter = course.instructor === currentCoordinator ||
                    course.category === 'Web Development';
            } else if (filter === 'draft') {
                matchesFilter = course.status === 'draft' &&
                    course.instructor === currentCoordinator;
            } else if (filter === 'published') {
                matchesFilter = course.status === 'published' &&
                    course.instructor === currentCoordinator;
            }

            return matchesFilter && matchesCategory && matchesSearch;
        });
    }, [courses, filter, searchCategory, searchQuery, currentCoordinator]);

    const handleDeleteCourse = (id: string) => {
        setCourseToDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteCourse = () => {
        if (courseToDeleteId) {
            const updatedCourses = courses.filter(course => course.id !== courseToDeleteId);
            setCourses(updatedCourses);
            alert(`Delete request sent for course ID: ${courseToDeleteId}. Admin approval is pending.`);
            setDeleteDialogOpen(false);
            setCourseToDeleteId(null);
        }
    };

    const cancelDeleteCourse = () => {
        setDeleteDialogOpen(false);
        setCourseToDeleteId(null);
    };


    useEffect(() => {
        setDropdownCategories(categories);
    }, [categories]);

    return (
        <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 font-['Unbounded'] text-sm tablet:p-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center tablet:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button className="text-white hover:text-gray-800"
                        onClick={() => navigate('/coordinator/dashboard')}>
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#52007C]" />
                    </button>
                    <h1 className="text-lg sm:text-[24px] font-semibold text-[#000000] tablet:text-xl">Courses</h1>
                </div>
                <button className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-3 sm:px-4 py-1 sm:py-2 rounded-[40px] flex items-center gap-2 text-xs sm:text-sm tablet:px-3 tablet:py-1.5 tablet:text-xs"
                    onClick={() => navigate('/coordinator/course-details')}>
                    <span>+</span>
                    <span className="text-xs sm:text-sm hidden sm:block tablet:text-xs">Add New Course</span>
                </button>
            </div>

            <div className="mb-4 sm:mb-6 flex justify-between items-center flex-col sm:flex-row gap-y-2 sm:gap-y-0 tablet:flex-row tablet:gap-x-4 tablet:mb-5">
                <div className="flex gap-2 sm:gap-4">
                    <button
                        className={`px-3 sm:px-4 py-2.5 rounded-[10px] text-xs sm:text-sm whitespace-nowrap ${filter === 'all' ? 'bg-[#BF4BF6] text-white' : 'bg-white text-violet-700'} tablet:px-3 tablet:py-2 tablet:text-xs`}
                        onClick={() => setFilter('all')}
                    >
                        All Course
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
                        <option value="">Select Category</option>
                        {dropdownCategories.map(category => (
                            <option key={category} value={category} className="text-xs sm:text-sm tablet:text-xs">{category}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 sm:right-3 top-0 h-full pointer-events-none flex items-center">
                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div className="mb-4 sm:mb-6 relative tablet:mb-5">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 text-[#7A00B8] mr-2 absolute left-2 sm:left-3 top-2 sm:top-3" />
                <input
                    type="text"
                    placeholder="Search Courses..."
                    className="w-full p-1.5 sm:p-2 pl-6 sm:pl-8 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent tablet:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 tablet:grid-cols-2 tablet:gap-5">
                    {filteredCourses.map((course) => (
                        <GridCard
                            key={course.id}
                            course={course}
                            onDeleteCourse={handleDeleteCourse}
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
                        Clear Filters
                    </button>
                </div>
            )}

            {isDeleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white rounded-xl p-6 sm:p-8 w-[400px] max-w-md tablet:p-5">
                        <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 tablet:text-lg">Confirm Delete</h3>
                            <p className="text-gray-600 mb-4 sm:mb-6 text-sm tablet:text-sm">Are you sure you want to request deletion of this course?</p>
                        </div>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            <button
                                onClick={confirmDeleteCourse}
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-colors text-xs sm:text-sm tablet:px-3 tablet:py-1.5 tablet:text-xs"
                            >
                                Yes, Request Delete
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