// data/mockData.ts
import { Material, QuizDetails, Question, CourseData } from '../types';

export const mockMaterials: Material[] = [
    { id: '1', type: 'document', name: 'Introduction to HTML5.pdf', url: 'Introduction to HTML5.pdf', subtopic: 'HTML5 Fundamentals' },
    { id: '2', type: 'video', name: 'HTML5 Structure and Elements', url: 'video1.mp4', subtopic: 'HTML5 Fundamentals' },
    { id: '4', type: 'video', name: 'Responsive Design Tutorial', url: 'react1.mp4', subtopic: 'CSS3 and Responsive Design' },
    { id: '5', type: 'document', name: 'CSS3 Fundamentals Guide.pdf', url: 'react-notes.pdf', subtopic: 'CSS3 and Responsive Design' },
    { id: '6', type: 'document', name: 'CSS3 Advanced Topics.pdf', url: 'advanced-css.pdf', subtopic: 'CSS3 and Responsive Design' },
    { id: '7', type: 'document', name: 'JavaScript Basics.pdf', url: 'js-basics.pdf', subtopic: 'JavaScript Essentials' },
    { id: '8', type: 'video', name: 'Working with Functions in JavaScript', url: 'js-functions.mp4', subtopic: 'JavaScript Essentials' },
    { id: '9', type: 'document', name: 'React State Management.pdf', url: 'react-state.pdf', subtopic: 'React Advanced Concepts' },
    { id: '10', type: 'video', name: 'React Hooks Explained', url: 'react-hooks.mp4', subtopic: 'React Advanced Concepts' },
    { id: '11', type: 'document', name: 'Node.js Introduction.pdf', url: 'node-intro.pdf', subtopic: 'Backend Development with Node.js' },
    { id: '12', type: 'video', name: 'Building APIs with Node.js', url: 'node-api.mp4', subtopic: 'Backend Development with Node.js' },
];

const mockQuizDetailsIntroduction: QuizDetails = {
    title: 'Quiz 1',
    bankSize: 20,
    quizSize: 10,
    duration: 15,
    subtopic: 'HTML5 Fundamentals',
    points: 50,
    questions: [{ questionText: 'Sample Question 1 for HTML5', questionType: 'multiple-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' }]
};

const mockQuizDetailsReactFundamentals: QuizDetails = {
    title: 'CSS3 and Responsive Design',
    bankSize: 50,
    quizSize: 20,
    duration: 30,
    subtopic: 'CSS3 and Responsive Design',
    points: 75,
    questions: [{ questionText: 'Sample Question 1 for CSS3', questionType: 'multiple-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 'b' }]
};

const mockQuizDetailsJS: QuizDetails = {
    title: 'JavaScript Essentials Quiz',
    bankSize: 30,
    quizSize: 15,
    duration: 20,
    subtopic: 'JavaScript Essentials',
    points: 60,
    questions: [{ questionText: 'Sample Question 1 for JS', questionType: 'multiple-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 'c' }]
};

const mockQuizDetailsReactAdvanced: QuizDetails = {
    title: 'React Advanced Quiz',
    bankSize: 40,
    quizSize: 20,
    duration: 25,
    subtopic: 'React Advanced Concepts',
    points: 80,
    questions: [{ questionText: 'Sample Question 1 for React Advanced', questionType: 'multiple-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 'd' }]
};

const mockQuizDetailsNodeJS: QuizDetails = {
    title: 'Node.js Backend Quiz',
    bankSize: 35,
    quizSize: 18,
    duration: 22,
    subtopic: 'Backend Development with Node.js',
    points: 70,
    questions: [{ questionText: 'Sample Question 1 for Node', questionType: 'multiple-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' }]
};


export const mockQuizDetails: QuizDetails[] = [mockQuizDetailsIntroduction, mockQuizDetailsReactFundamentals, mockQuizDetailsJS, mockQuizDetailsReactAdvanced, mockQuizDetailsNodeJS];

export const mockQuestions: Question[] = [
    { questionText: 'What is React?', questionType: 'multiple-choice' },
    { questionText: 'True or False: useState is a hook.', questionType: 'true-false' },
    { questionText: 'Explain JSX.', questionType: 'short-answer' },
];

export const courseDataMock: CourseData = {
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of web development with HTML, CSS, and JavaScript through comprehensive topics and hands-on exercises.',
    materials: mockMaterials,
    quizDetails: mockQuizDetails,
    questions: mockQuestions,
    deadline: 30,
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
};