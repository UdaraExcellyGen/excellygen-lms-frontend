// src/features/Learner/CourseContent/CourseContent.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

import { getCoursesForCategory, clearCourseCaches } from '../../../api/services/Course/learnerCourseService';
import { createEnrollment, deleteEnrollment } from '../../../api/services/Course/enrollmentService';
import { getCategoryById } from '../../../api/services/courseCategoryService';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CourseContent: React.FC = () => {
    const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMountedRef = useRef(true);

    const [activeTab, setActiveTab] = useState<'courses' | 'learning'>('courses');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableCourses, setAvailableCourses] = useState<LearnerCourseDto[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]);
    const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
    const [selectedCourseForUnenroll, setSelectedCourseForUnenroll] = useState<LearnerCourseDto | null>(null);
    const [categoryName, setCategoryName] = useState<string>('Loading Category...');
    const [isCategoryInactive, setIsCategoryInactive] = useState(false);
    
    // New state for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [learningFilter, setLearningFilter] = useState<'all' | 'completed' | 'ongoing'>('all');

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async () => {
        if (!user?.id || !categoryIdParam) return;

        setLoading(true);
        setError(null);
        clearCourseCaches();

        try {
            const categoryDetails = await getCategoryById(categoryIdParam);
            if (!isMountedRef.current) return;

            setCategoryName(categoryDetails.title);
            
            // 🔥 FIXED: Only fix lesson counts, preserve ALL other data including creator
            const ensureProperCourseData = (courses: LearnerCourseDto[]): LearnerCourseDto[] => {
                return courses.map(course => {
                    const totalLessons = course.lessons?.length || course.totalLessons || 0;
                    const completedLessons = course.lessons?.filter(lesson => lesson.isCompleted).length || course.completedLessons || 0;
                    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                    
                    // 🔥 DEBUG: Log what creator data we have
                    console.log(`🔍 Course "${course.title}" creator data:`, {
                        originalCreator: course.creator,
                        creatorName: course.creator?.name,
                        creatorId: course.creator?.id
                    });
                    
                    return {
                        ...course,
                        totalLessons,
                        completedLessons,
                        progressPercentage: course.progressPercentage || progressPercentage,
                        // 🔥 PRESERVE original creator data completely - NO modifications
                        creator: course.creator,
                        activeLearnersCount: course.activeLearnersCount || 0
                    };
                });
            };
            
            if (categoryDetails.status.toLowerCase() === 'inactive') {
                setIsCategoryInactive(true);
                const { categoryEnrolled } = await getCoursesForCategory(categoryIdParam);
                if (isMountedRef.current) {
                    setEnrolledCourses(ensureProperCourseData(categoryEnrolled));
                    setActiveTab('learning');
                }
            } else {
                setIsCategoryInactive(false);
                const { available, categoryEnrolled } = await getCoursesForCategory(categoryIdParam);
                if (isMountedRef.current) {
                    setAvailableCourses(ensureProperCourseData(available));
                    setEnrolledCourses(ensureProperCourseData(categoryEnrolled));
                }
            }
        } catch (err: any) {
            if (!isMountedRef.current) return;
            console.error("Failed to fetch data:", err);
            const errorMessage = err.response?.data?.message || "Failed to load courses for this category.";
            setError(errorMessage);
            toast.error(errorMessage);
            if(err.response?.status === 404) {
                navigate('/learner/course-categories', { replace: true });
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [user?.id, categoryIdParam, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Debug function to log course data
    useEffect(() => {
        if (availableCourses.length > 0) {
            console.log('📚 Available Courses Final Data:', availableCourses.map(course => ({
                title: course.title,
                creatorName: course.creator?.name,
                creatorId: course.creator?.id,
                fullCreator: course.creator,
                activeLearnersCount: course.activeLearnersCount,
                totalLessons: course.totalLessons
            })));
        }
    }, [availableCourses]);

    const handleEnroll = useCallback(async (courseId: number) => {
        const courseToEnroll = availableCourses.find(c => c.id === courseId);
        if (!courseToEnroll) return;

        // FIXED: Use existing totalLessons from backend instead of calculating from lessons array
        const totalLessons = courseToEnroll.totalLessons || 0;
        const completedLessons = 0; // Always 0 for newly enrolled courses

        // Optimistic UI update - preserve ALL original data
        setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
        setEnrolledCourses(prev => [...prev, { 
            ...courseToEnroll, 
            isEnrolled: true,
            totalLessons, // FIXED: Use the correct totalLessons from backend
            completedLessons,
            progressPercentage: 0,
            // Preserve all other original data
            creator: courseToEnroll.creator,
            activeLearnersCount: courseToEnroll.activeLearnersCount
        }]);
        
        setTimeout(() => {
            setActiveTab('learning');
        }, 300);

        const enrollToast = toast.loading(`Enrolling in "${courseToEnroll.title}"...`);
        
        try {
            const newEnrollment = await createEnrollment(courseId);
            
            setEnrolledCourses(prev => 
                prev.map(c => {
                    if (c.id === courseId) {
                        return { 
                            ...c, 
                            enrollmentId: newEnrollment.id, 
                            isEnrolled: true,
                            // FIXED: Keep the correct totalLessons, don't recalculate
                            totalLessons: totalLessons,
                            completedLessons: 0,
                            progressPercentage: 0,
                            creator: c.creator,
                            activeLearnersCount: c.activeLearnersCount
                        };
                    }
                    return c;
                })
            );
            
            toast.success(`Successfully enrolled in "${courseToEnroll.title}"!`, { id: enrollToast });
            clearCourseCaches();
            
        } catch (err: any) {
            toast.error(`Failed to enroll: ${err.response?.data?.message || 'Please try again.'}`, { id: enrollToast });
            setAvailableCourses(prev => [...prev, courseToEnroll]);
            setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
            setActiveTab('courses');
        }
    }, [availableCourses]);

    // Listen for course progress updates
    useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
        const { courseId } = event.detail;
        console.log(`🔄 Received progress update for course ${courseId}`);
        
        // Refetch data for the updated course
        fetchData();
    };

    window.addEventListener('courseProgressUpdated', handleProgressUpdate as EventListener);
    
    return () => {
        window.removeEventListener('courseProgressUpdated', handleProgressUpdate as EventListener);
    };
    }, [fetchData]);

    const handleUnenroll = useCallback(async () => {
        if (!selectedCourseForUnenroll?.enrollmentId) return;
        const unenrollToast = toast.loading("Unenrolling...");
        try {
            await deleteEnrollment(selectedCourseForUnenroll.enrollmentId);
            toast.success(`Unenrolled successfully!`, { id: unenrollToast });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to unenroll.", { id: unenrollToast });
        } finally {
            setIsUnenrollModalOpen(false);
            setSelectedCourseForUnenroll(null);
        }
    }, [selectedCourseForUnenroll, fetchData]);

    const handleContinueLearning = (courseId: number) => navigate(`/learner/course-view/${courseId}`);
    const handleBack = () => navigate('/learner/course-categories');
    const handleRetry = () => fetchData();

    // Filter functions
    const getFilteredAvailableCourses = () => {
        return availableCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.technologies?.some(tech => tech.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const getFilteredEnrolledCourses = () => {
        let filtered = enrolledCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.technologies?.some(tech => tech.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Apply learning filter
        if (learningFilter === 'completed') {
            filtered = filtered.filter(course => (course.progressPercentage || 0) === 100);
        } else if (learningFilter === 'ongoing') {
            // Ongoing should show all enrolled courses that are not 100% completed
            // This includes 0% (not started) and partially completed courses
            filtered = filtered.filter(course => (course.progressPercentage || 0) !== 100);
        }

        return filtered;
    };

    return (
        <Layout>
            {/* UPDATED: Applied CourseCategories theme - gradient background */}
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
                    {/* UPDATED: Back button with CourseCategories theme */}
                    <div className="flex items-center space-x-4">
                        <button onClick={handleBack} className="flex items-center text-[#D68BF9] hover:text-white transition-colors font-nunito">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Course Categories
                        </button>
                    </div>
                    
                    {/* UPDATED: Header with CourseCategories theme */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold font-unbounded mb-4 text-white">{categoryName}</h1>
                        <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto leading-relaxed font-nunito">Explore our curated courses and start your learning journey</p>
                    </div>

                    {/* UPDATED: Inactive category warning with CourseCategories theme */}
                    {isCategoryInactive && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-4 rounded-xl flex items-center gap-4 shadow-lg backdrop-blur-md">
                            <Info className="h-6 w-6 flex-shrink-0"/>
                            <span className="font-medium font-nunito">This course category is currently inactive. New enrollments are not available, but you can still access any courses you are already enrolled in.</span>
                        </div>
                    )}

                    {/* UPDATED: Stats without background wrapper */}
                    <StatsOverview 
                        availableCoursesCount={availableCourses.length}
                        enrolledCoursesCount={enrolledCourses.length}
                        totalCategoryDuration={`${[...availableCourses, ...enrolledCourses].reduce((sum, course) => sum + course.estimatedTime, 0)} h`}
                    />

                    {/* NEW: Search Bar */}
                    <SearchBar 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    
                    {/* UPDATED: Tabs with filter dropdown */}
                    {!isCategoryInactive && (
                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)]">
                            <CourseTabs 
                                activeTab={activeTab} 
                                setActiveTab={setActiveTab}
                                learningFilter={learningFilter}
                                setLearningFilter={setLearningFilter}
                            />
                        </div>
                    )}
                    
                    {/* UPDATED: Main content area with CourseCategories theme */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="animate-spin h-12 w-12 text-white mb-4" />
                                <p className="text-white text-lg font-nunito">Loading courses...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-white text-lg mb-6 font-nunito">{error}</p>
                                <button 
                                    onClick={handleRetry} 
                                    className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-nunito"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <CourseGrid
                                activeTab={activeTab}
                                availableCourses={getFilteredAvailableCourses()}
                                enrolledCourses={getFilteredEnrolledCourses()}
                                onEnroll={handleEnroll}
                                onUnenroll={(course) => { setSelectedCourseForUnenroll(course); setIsUnenrollModalOpen(true); }}
                                onContinueLearning={handleContinueLearning}
                            />
                        )}
                    </div>
                </div>
                
                {/* UPDATED: Modal with new red and white theme */}
                <ConfirmationModal 
                    isOpen={isUnenrollModalOpen} 
                    onClose={() => setIsUnenrollModalOpen(false)} 
                    onConfirm={handleUnenroll} 
                    title="Confirm Unenrollment" 
                    courseName={selectedCourseForUnenroll?.title || ''} 
                />
            </div>
        </Layout>
    );
};

export default CourseContent;