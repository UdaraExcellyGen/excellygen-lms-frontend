// CourseContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';

// Export all interfaces
export interface CourseDetails {
    title: string;
    category: string;
    description: string;
    estimatedTime: string;
    thumbnail: File | null;
    technologies: string[];
}

export interface MaterialFile {
    id: string;
    name: string;
    type: 'document' | 'video' | 'quiz';
    file: File | null;
    videoLink?: string;
    quizId?: string;
}

export interface Subtopic {
    id: string;
    title: string;
    materials: MaterialFile[];
    hasQuiz: boolean;
    quizBank?: QuizBank | null;
    subtopicPoints: number;
}

export interface QuizDetails {
    title: string;
    bankSize: string;
    quizSize: string;
    duration: string;
}

export interface QuizBank {
    quizDetails: QuizDetails;
    questions: Question[];
    name: string;
    bankSize: number;
    quizSize: number;
    duration: number;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number | null;
}

// ** ADDED Course Interface here and exported it **
export interface Course {
    id?: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    deadline?: string;
    coordinatorPoints?: number;
    courseMaterials?: Subtopic[]; // You might not need courseMaterials here in the Course interface itself, depending on your backend structure.  Adjust if needed.
}


interface CourseContextType {
    courseData: {
        basicDetails: CourseDetails;
        materials: Subtopic[];
        // ... other course related data
        course: Course; // Include Course in the courseData structure
    };
    setCourseData: React.Dispatch<React.SetStateAction<{
        basicDetails: CourseDetails;
        materials: Subtopic[];
        course: Course;
        // ... other course related data
    }>>;
    updateBasicCourseDetails: (details: CourseDetails) => void;
    updateCourseMaterials: (materials: Subtopic[]) => void;
    loadCourseDataFromLocalStorage: () => void;
    saveCourseDataToLocalStorage: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
    children: ReactNode;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
    const [courseData, setCourseData] = useState<{
        basicDetails: CourseDetails;
        materials: Subtopic[];
        course: Course; // Initialize course in courseData
    }>({
        basicDetails: {
            title: 'My Awesome Course', // Example mock data
            category: 'Web Development',
            description: 'Learn web development from scratch.',
            estimatedTime: '20',
            thumbnail: null,
            technologies: ['React.js', 'Node.js', 'Express.js']
        },
        materials: [
            { id: '1', title: 'Introduction to Web Dev', materials: [], hasQuiz: false, quizBank: null, subtopicPoints: 1 },
            { id: '2', title: 'HTML Basics', materials: [], hasQuiz: false, quizBank: null, subtopicPoints: 1 }
        ],
        course: { // Initialize Course data
            title: 'Initial Course Title',
            description: 'Initial Course Description',
            thumbnailUrl: '/api/placeholder/400/200',
            deadline: '7',
            coordinatorPoints: 0,
        }
    });

    const updateBasicCourseDetails = (details: CourseDetails) => {
        setCourseData(prevData => ({ ...prevData, basicDetails: details }));
        // Optionally update course title from basic details if it makes sense for your app
        setCourseData(prevData => ({ ...prevData, course: {...prevData.course, title: details.title, description: details.description, thumbnailUrl: details.thumbnail ? URL.createObjectURL(details.thumbnail) : '/api/placeholder/400/200', deadline: details.estimatedTime }}));
    };

    const updateCourseMaterials = (materials: Subtopic[]) => {
        setCourseData(prevData => ({ ...prevData, materials: materials }));
    };

    // ** Local Storage Functions **
    const loadCourseDataFromLocalStorage = () => {
        const storedData = localStorage.getItem('courseData');
        if (storedData) {
            setCourseData(JSON.parse(storedData));
        }
    };

    const saveCourseDataToLocalStorage = () => {
        localStorage.setItem('courseData', JSON.stringify(courseData));
    };

    // ** Load from Local Storage on Mount **
    useEffect(() => {
        loadCourseDataFromLocalStorage();
    }, []);

    // ** Save to Local Storage on courseData Change **
    useEffect(() => {
        saveCourseDataToLocalStorage();
    }, [courseData]);


    const value: CourseContextType = {
        courseData,
        setCourseData,
        updateBasicCourseDetails,
        updateCourseMaterials,
        loadCourseDataFromLocalStorage,
        saveCourseDataToLocalStorage,
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourseContext = () => {
    const context = React.useContext(CourseContext);
    if (!context) {
        throw new Error('useCourseContext must be used within a CourseProvider');
    }
    return context;
};