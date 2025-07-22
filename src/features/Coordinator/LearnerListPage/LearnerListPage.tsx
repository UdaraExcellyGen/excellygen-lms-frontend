// src/features/Coordinator/LearnerListPage/LearnerListPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CourseFilter from './components/CourseFilter';
import CourseList from './components/CourseList';
import { Course, Student } from './types/index';
import { getAllCourses } from '../../../api/services/Course/courseService';
import { getAllEnrollmentsAdminView } from '../../../api/services/Course/enrollmentService';
import { CourseDto, EnrollmentDto, CourseStatus } from '../../../types/course.types';
import { BookOpen, AlertCircle, RefreshCw, Users } from 'lucide-react';

const getCurrentUserId = (): string | null => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            return user.id || null;
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
            return null;
        }
    }
    return null;
};

const LearnerListPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [allCoursesWithLearners, setAllCoursesWithLearners] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        const currentCoordinatorId = getCurrentUserId();
        if (!currentCoordinatorId) {
            setError("Could not identify the current user. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            const [fetchedApiCourses, fetchedApiEnrollments] = await Promise.all([
                getAllCourses(),
                getAllEnrollmentsAdminView(),
            ]);
            const coordinatorCreatedCourses = fetchedApiCourses.filter(
                (courseDto: CourseDto) =>
                    courseDto.creator &&
                    courseDto.creator.id === currentCoordinatorId &&
                    courseDto.status === CourseStatus.Published
            );
            const transformedCourses: Course[] = coordinatorCreatedCourses.map((courseDto: CourseDto) => ({
                id: courseDto.id, // Add the course ID here
                title: courseDto.title,
                students: fetchedApiEnrollments
                    .filter((enrollment: EnrollmentDto) => enrollment.courseId === courseDto.id)
                    .map((enrollment: EnrollmentDto) => ({
                        id: enrollment.id,
                        name: enrollment.userName,
                        userId: enrollment.userId,
                    })),
            }));
            const coursesWithLearnersOnly = transformedCourses.filter(course => course.students.length > 0);
            coursesWithLearnersOnly.sort((a, b) => b.students.length - a.students.length);
            setAllCoursesWithLearners(coursesWithLearnersOnly);
        } catch (err) {
            console.error("Error fetching learner list data:", err);
            setError("Failed to load data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let coursesToFilter = [...allCoursesWithLearners];
        if (selectedCourseTitle && selectedCourseTitle !== 'all') {
            coursesToFilter = coursesToFilter.filter(course => course.title === selectedCourseTitle);
        }
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            coursesToFilter = coursesToFilter.flatMap(course => {
                const matchingStudents = course.students.filter(student =>
                    student.name.toLowerCase().includes(searchTermLower)
                );
                if (matchingStudents.length > 0) {
                    return [{ ...course, students: matchingStudents }];
                }
                return [];
            });
        }
        setFilteredCourses(coursesToFilter);
    }, [selectedCourseTitle, searchTerm, allCoursesWithLearners]);

    const toggleCourseExpansion = (courseId: string) => { // Use courseId
        setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    };

    const handleCourseSelect = (courseTitle: string) => {
        setSelectedCourseTitle(courseTitle);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => setSearchTerm('');
    const handleHeaderNavigation = (path: string) => navigate(path);

    // ... (rest of the component remains the same)
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div>
                <p className="text-white text-lg">Loading learner data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex flex-col items-center justify-center text-center">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <p className="text-white text-lg mb-6">{error}</p>
                <button onClick={fetchData} className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <Header handleNavigate={handleHeaderNavigation} />
                <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            onClearSearch={handleClearSearch}
                        />
                        <CourseFilter
                            selectedCourseTitle={selectedCourseTitle}
                            courses={allCoursesWithLearners}
                            onSelectCourse={handleCourseSelect}
                        />
                    </div>
                </div>

                <main className="min-h-[400px]">
                    {allCoursesWithLearners.length > 0 ? (
                        <CourseList
                            courses={filteredCourses}
                            expandedCourses={expandedCourses}
                            toggleCourseExpansion={toggleCourseExpansion}
                        />
                    ) : (
                         <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Users size={48} className="text-[#BF4BF6] mb-4" />
                            <p className="text-white text-lg mb-2">No Enrolled Learners Found</p>
                            <p className="text-gray-400">None of your published courses have any learners enrolled yet.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LearnerListPage;