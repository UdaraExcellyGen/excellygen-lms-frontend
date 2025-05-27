// LearnerListPage/LearnerListPage.tsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CourseList from './components/CourseList';
import Footer from './components/Footer';
import { coursesWithStudents } from './data/courses';
import { Course } from './types/index';

const LearnerListPage: React.FC = () => {
    const [selectedCourseTitle, setSelectedCourseTitle] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredCourses, setFilteredCourses] = useState<Course[]>(coursesWithStudents);

    useEffect(() => {
        let coursesToFilter = coursesWithStudents;
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

    }, [selectedCourseTitle, searchTerm]);

    const handleCourseFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourseTitle(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="bg-primary min-h-screen flex flex-col font-nunito text-gray-900">
            <Header
                selectedCourseTitle={selectedCourseTitle}
                courses={coursesWithStudents}
                onCourseFilterChange={handleCourseFilterChange}
            />
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
            <Footer />
        </div>
    );
};

export default LearnerListPage;