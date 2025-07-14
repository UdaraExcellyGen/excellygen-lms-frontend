// LearnerListPage/LearnerListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CourseList from './components/CourseList';
import { Course, Student } from './types/index';

import { getAllCourses } from '../../../api/services/Course/courseService';
import { getAllEnrollmentsAdminView } from '../../../api/services/Course/enrollmentService';
import { CourseDto, EnrollmentDto } from '../../../types/course.types'
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
    const [selectedCourseTitle, setSelectedCourseTitle] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [allCoursesWithLearners, setAllCoursesWithLearners] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

           
            const currentCoordinatorId = getCurrentUserId();
            if (!currentCoordinatorId) {
                setError("Could not identify the current user. Please log in again.");
                setIsLoading(false);
                setAllCoursesWithLearners([]);
                return;
            }
            

            try {
                const [fetchedApiCourses, fetchedApiEnrollments] = await Promise.all([
                    getAllCourses(),
                    getAllEnrollmentsAdminView(),
                ]);
  
                const coordinatorCreatedCourses = fetchedApiCourses.filter(
                    (courseDto: CourseDto) => courseDto.creator && courseDto.creator.id === currentCoordinatorId
                );
                
                const transformedCourses: Course[] = coordinatorCreatedCourses.map((courseDto: CourseDto) => {
                    const learnersForCourse: Student[] = fetchedApiEnrollments
                        .filter((enrollment: EnrollmentDto) => enrollment.courseId === courseDto.id)
                        .map((enrollment: EnrollmentDto) => ({
                            id: enrollment.id, 
                            name: enrollment.userName,
                            userId: enrollment.userId,
                        }));
                    
                    return {
                        title: courseDto.title,
                        students: learnersForCourse,
                    };
                });

                setAllCoursesWithLearners(transformedCourses);
            } catch (err) {
                console.error("Error fetching learner list data:", err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(`Failed to load data: ${errorMessage}. Please try again later.`);
                setAllCoursesWithLearners([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); 

    useEffect(() => {
        let coursesToFilter = [...allCoursesWithLearners]; 
        const searchTermLower = searchTerm.toLowerCase();

        if (selectedCourseTitle && selectedCourseTitle !== 'all') {
            coursesToFilter = coursesToFilter.filter(course => course.title === selectedCourseTitle);
        }

        if (searchTerm) {
            coursesToFilter = coursesToFilter.filter(course => {
                const courseTitleMatch = course.title.toLowerCase().includes(searchTermLower);
                const studentNameMatch = course.students.some(student => student.name.toLowerCase().includes(searchTermLower));
                return courseTitleMatch || studentNameMatch;
            });
        }
        setFilteredCourses(coursesToFilter);

    }, [selectedCourseTitle, searchTerm, allCoursesWithLearners]); 

    const handleCourseFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourseTitle(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };
    const handleHeaderNavigation = (path: string) => {
        navigate(path);
    };

    if (isLoading) {
        return (
            <div className="bg-primary min-h-screen flex justify-center items-center text-white text-xl font-nunito">
                Loading your courses and learner data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-primary min-h-screen flex flex-col justify-center items-center text-red-400 text-xl p-8 font-nunito">
                <p className="text-center mb-4">{error}</p>
                <button 
                    onClick={() => { 
                        setIsLoading(true); 
                        setError(null); 
                        // Consider refactoring fetchData to be callable directly
                        // For now, a simple way to re-trigger is to force a dependency change or reload:
                        // This is a simplistic retry, ideally fetchData would be its own callable function.
                        const currentCoordinatorId = getCurrentUserId();
                        if (currentCoordinatorId) { // Re-fetch logic needs to be robust
                            // Re-calling the effect's logic by changing a dummy state, or refactor fetchData
                            // For simplicity, if error state is complex, reload might be easiest:
                             window.location.reload(); 
                        } else {
                            setError("Cannot retry: User ID not found.");
                        }
                    }}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    if (!isLoading && !error && allCoursesWithLearners.length === 0) {
        return (
            <div className="bg-primary min-h-screen flex flex-col font-nunito text-gray-900">
                <div className="container mx-auto px-6 py-4">
                    <Header
                        selectedCourseTitle={selectedCourseTitle}
                        courses={[]} 
                        onCourseFilterChange={handleCourseFilterChange}
                        handleNavigate={handleHeaderNavigation}
                    />
                </div>
                <div className="flex-grow container mx-auto px-6 py-8 flex justify-center items-center">
                    <p className="text-xl text-gray-400">You have not created any courses yet.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-primary min-h-screen flex flex-col font-nunito text-gray-900">
            <div className="container mx-auto px-6 py-4">
            <Header
                selectedCourseTitle={selectedCourseTitle}
                courses={allCoursesWithLearners} 
                onCourseFilterChange={handleCourseFilterChange}
                handleNavigate={handleHeaderNavigation}
            />
            </div>
            <div className="container mx-auto px-6 py-4">
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onClearSearch={handleClearSearch}
                />
            </div>
            <main className="flex-grow container mx-auto px-6 py-8">
                <CourseList
                    courses={filteredCourses} 
                    selectedCourseTitle={selectedCourseTitle}
                    searchTerm={searchTerm}
                />
            </main>
        </div>
    );
};

export default LearnerListPage;