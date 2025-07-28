// src/features/Coordinator/contexts/CourseContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {
    BasicCourseDetailsState,
    CourseContextState,
    SubtopicFE,
    CourseDocumentDto
} from '../../../types/course.types';

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
    addDocumentToLessonState: (lessonId: number, document: CourseDocumentDto) => void;
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
            basicDetails: { ...details },
        }));
    }, []);

    const setCreatedCourseId = useCallback((id: number | null) => {
        setCourseData(prev => ({
            ...prev,
            createdCourseId: id,
            lessons: id === null ? [] : prev.createdCourseId === id ? prev.lessons : [],
            lessonsLoaded: id === null ? false : prev.createdCourseId === id ? prev.lessonsLoaded : false,
        }));
    }, []);

    const setLessonsState = useCallback((lessons: SubtopicFE[]) => {
        setCourseData(prev => ({ ...prev, lessons: lessons }));
    }, []);

    const setLessonsLoaded = useCallback((loaded: boolean) => {
        setCourseData(prev => ({ ...prev, lessonsLoaded: loaded }));
    }, []);

    const addLessonToState = useCallback((lesson: SubtopicFE) => {
        setCourseData(prev => ({ ...prev, lessons: [...prev.lessons, lesson] }));
    }, []);

    const updateLessonInState = useCallback((updatedLesson: SubtopicFE) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l => l.id === updatedLesson.id ? { ...updatedLesson } : l)
        }));
    }, []);

    const removeLessonFromState = useCallback((lessonId: number) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.filter(l => l.id !== lessonId)
        }));
    }, []);

    const addDocumentToLessonState = useCallback((lessonId: number, document: CourseDocumentDto) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l =>
                l.id === lessonId
                    ? { ...l, documents: [...l.documents, document] }
                    : l
            )
        }));
    }, []);

    const removeDocumentFromLessonState = useCallback((lessonId: number, documentId: number) => {
        setCourseData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l =>
                l.id === lessonId
                    ? { ...l, documents: l.documents.filter(d => d.id !== documentId) }
                    : l
            )
        }));
    }, []);

    const resetCourseContext = useCallback(() => {
        console.log("Resetting Course Context to initial state");
        setCourseData(initialCourseState);
    }, []);

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