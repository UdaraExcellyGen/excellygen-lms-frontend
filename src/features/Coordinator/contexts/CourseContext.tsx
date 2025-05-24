// src/contexts/CourseContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {
    BasicCourseDetailsState,
    CourseContextState,
    SubtopicFE,
    ExistingMaterialFile
} from '../../../types/course.types'; // Ensure path is correct

// --- Initial State ---
const initialBasicDetails: BasicCourseDetailsState = {
    title: '',
    description: '',
    estimatedTime: '',
    categoryId: '',
    technologies: [],
    thumbnail: null,
};

const initialCourseState: CourseContextState = {
    createdCourseId: null,
    basicDetails: initialBasicDetails,
    lessons: [],
    lessonsLoaded: false,
};

// --- Context Type ---
type CourseContextType = {
    courseData: CourseContextState;
    updateBasicCourseDetails: (details: BasicCourseDetailsState) => void;
    setCreatedCourseId: (id: number | null) => void;
    setLessonsState: (lessons: SubtopicFE[]) => void;
    setLessonsLoaded: (loaded: boolean) => void;
    addLessonToState: (lesson: SubtopicFE) => void;
    updateLessonInState: (updatedLesson: SubtopicFE) => void;
    removeLessonFromState: (lessonId: number) => void;
    addDocumentToLessonState: (lessonId: number, document: ExistingMaterialFile) => void;
    removeDocumentFromLessonState: (lessonId: number, documentId: number) => void;
    resetCourseContext: () => void;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// --- Provider Component ---
export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [courseData, setCourseData] = useState<CourseContextState>(initialCourseState);

    const updateBasicCourseDetails = useCallback((details: BasicCourseDetailsState) => {
        setCourseData(prev => ({
            ...prev,
            // Ensure we are creating a new object for basicDetails to trigger re-renders where it's a dependency
            basicDetails: { ...details },
        }));
    }, []); // This function itself is stable

    const setCreatedCourseId = useCallback((id: number | null) => {
        setCourseData(prev => ({
            ...prev,
            createdCourseId: id,
            // When a new course ID is set (or cleared), reset lessons and their loaded status
            lessons: id === null ? [] : prev.createdCourseId === id ? prev.lessons : [], // Keep lessons if ID is same, else clear
            lessonsLoaded: id === null ? false : prev.createdCourseId === id ? prev.lessonsLoaded : false,
        }));
    }, []); // Stable

    const setLessonsState = useCallback((lessons: SubtopicFE[]) => {
        setCourseData(prev => ({ ...prev, lessons: lessons }));
    }, []); // Stable

    const setLessonsLoaded = useCallback((loaded: boolean) => {
        setCourseData(prev => ({ ...prev, lessonsLoaded: loaded }));
    }, []); // Stable

    const addLessonToState = useCallback((lesson: SubtopicFE) => {
        setCourseData(prev => ({ ...prev, lessons: [...prev.lessons, lesson] }));
    }, []); // Stable

    const updateLessonInState = useCallback((updatedLesson: SubtopicFE) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l => l.id === updatedLesson.id ? { ...updatedLesson } : l) // Ensure new object for updated lesson
        }));
    }, []); // Stable

    const removeLessonFromState = useCallback((lessonId: number) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.filter(l => l.id !== lessonId)
        }));
    }, []); // Stable

    const addDocumentToLessonState = useCallback((lessonId: number, document: ExistingMaterialFile) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l =>
                l.id === lessonId
                    ? { ...l, documents: [...l.documents, document] } // New documents array
                    : l
            )
        }));
    }, []); // Stable

    const removeDocumentFromLessonState = useCallback((lessonId: number, documentId: number) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l =>
                l.id === lessonId
                    ? { ...l, documents: l.documents.filter(d => d.id !== documentId) } // New documents array
                    : l
            )
        }));
    }, []); // Stable

    const resetCourseContext = useCallback(() => {
        console.log("Resetting Course Context to initial state"); // Add log for debugging
        setCourseData(initialCourseState); // initialCourseState is defined outside and is stable
    }, []); // Dependency on initialCourseState is implicit, but [] is fine as it's module-scoped constant

    // Context Value
    const value: CourseContextType = {
        courseData,
        updateBasicCourseDetails,
        setCreatedCourseId,
        setLessonsState,
        setLessonsLoaded,
        addLessonToState,
        updateLessonInState,
        removeLessonFromState,
        addDocumentToLessonState,
        removeDocumentFromLessonState,
        resetCourseContext
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};

// --- Hook to use the context ---
export const useCourseContext = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourseContext must be used within a CourseProvider');
    }
    return context;
};