// src/features/Learner/CourseContent/CourseContent.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react'; // THE FIX IS HERE
import Layout from '../../../components/Sidebar/Layout';
import { LearnerCourseDto } from '../../../types/course.types';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
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
            
            if (categoryDetails.status.toLowerCase() === 'inactive') {
                setIsCategoryInactive(true);
                const { categoryEnrolled } = await getCoursesForCategory(categoryIdParam);
                if (isMountedRef.current) {
                    setEnrolledCourses(categoryEnrolled);
                    setActiveTab('learning');
                }
            } else {
                setIsCategoryInactive(false);
                const { available, categoryEnrolled } = await getCoursesForCategory(categoryIdParam);
                if (isMountedRef.current) {
                    setAvailableCourses(available);
                    setEnrolledCourses(categoryEnrolled);
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

    const handleEnroll = useCallback(async (courseId: number) => {
        const courseToEnroll = availableCourses.find(c => c.id === courseId);
        if (!courseToEnroll) return;

        setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
        setEnrolledCourses(prev => [...prev, { ...courseToEnroll, isEnrolled: true }]);
        setActiveTab('learning');
        const enrollToast = toast.loading(`Enrolling...`);
        try {
            const newEnrollment = await createEnrollment(courseId);
            setEnrolledCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrollmentId: newEnrollment.id } : c));
            toast.success(`Successfully enrolled!`, { id: enrollToast });
            clearCourseCaches();
        } catch (err: any) {
            toast.error(`Failed to enroll: ${err.response?.data?.message || 'Please try again.'}`, { id: enrollToast });
            setAvailableCourses(prev => [...prev, courseToEnroll]);
            setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
            setActiveTab('courses');
        }
    }, [availableCourses]);

    const handleUnenroll = useCallback(async () => {
        if (!selectedCourseForUnenroll?.enrollmentId) return;
        const unenrollToast = toast.loading("Unenrolling...");
        try {
            await deleteEnrollment(selectedCourseForUnenroll.enrollmentId);
            toast.success(`Unenrolled successfully!`, { id: unenrollToast });
            fetchData(); // Refetch data to get the correct state
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

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-3 sm:p-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-8 space-y-4 sm:space-y-8">
                    <button onClick={handleBack} className="flex items-center text-[#D68BF9] hover:text-white transition-colors mb-3 sm:mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Course Categories
                    </button>
                    
                    <div className="text-center mb-6 sm:mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold font-unbounded mb-4 text-white">{categoryName}</h2>
                        <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto">Explore our curated courses and start your learning journey</p>
                    </div>

                    {isCategoryInactive && (
                        <div className="bg-yellow-800/30 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3">
                            <Info className="h-5 w-5"/>
                            <span>This course category is currently inactive. New enrollments are not available, but you can still access any courses you are already enrolled in.</span>
                        </div>
                    )}

                    <StatsOverview 
                        availableCoursesCount={availableCourses.length}
                        enrolledCoursesCount={enrolledCourses.length}
                        totalCategoryDuration={`${[...availableCourses, ...enrolledCourses].reduce((sum, course) => sum + course.estimatedTime, 0)} h`}
                    />
                    
                    {!isCategoryInactive && <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />}
                    
                    {loading ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin h-12 w-12 text-white" /></div>
                    ) : error ? (
                        <div className="text-center py-10 text-white"><p>{error}</p><button onClick={handleRetry} className="mt-4 bg-purple-600 px-4 py-2 rounded">Retry</button></div>
                    ) : (
                        <CourseGrid
                            activeTab={activeTab}
                            availableCourses={availableCourses}
                            enrolledCourses={enrolledCourses}
                            onEnroll={handleEnroll}
                            onUnenroll={(course) => { setSelectedCourseForUnenroll(course); setIsUnenrollModalOpen(true); }}
                            onContinueLearning={handleContinueLearning}
                        />
                    )}
                </div>
                <ConfirmationModal isOpen={isUnenrollModalOpen} onClose={() => setIsUnenrollModalOpen(false)} onConfirm={handleUnenroll} title="Confirm Unenrollment" courseName={selectedCourseForUnenroll?.title || ''} />
            </div>
        </Layout>
    );
};

export default CourseContent;