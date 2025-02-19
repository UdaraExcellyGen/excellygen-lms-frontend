import { EnrollmentDataType, QuizDataType } from '../types/analytics';

export const enrollmentData: EnrollmentDataType = [
  { course: "React", count: 35 },
  { course: "Agile Development", count: 20 },
  { course: ".Net", count: 45 },
  { course: "Software Testing", count: 10 },
];

export const quizData: QuizDataType = {
  React: {
    "Quiz 1": [
      { range: "0-20", count: 5 },
      { range: "21-40", count: 15 },
      { range: "41-60", count: 25 },
      { range: "61-80", count: 30 },
      { range: "81-100", count: 45 },
    ],
    "Quiz 2": [
      { range: "0-20", count: 10 },
      { range: "21-40", count: 18 },
      { range: "41-60", count: 22 },
      { range: "61-80", count: 35 },
      { range: "81-100", count: 40 },
    ],
  },
  ".Net": {
    "Quiz 1": [
      { range: "0-20", count: 5 },
      { range: "21-40", count: 15 },
      { range: "41-60", count: 25 },
      { range: "61-80", count: 30 },
      { range: "81-100", count: 45 },
    ],
    "Quiz 2": [
      { range: "0-20", count: 10 },
      { range: "21-40", count: 18 },
      { range: "41-60", count: 22 },
      { range: "61-80", count: 35 },
      { range: "81-100", count: 40 },
    ],
  },
  "Agile Development": {
    "Quiz 1": [
      { range: "0-20", count: 5 },
      { range: "21-40", count: 15 },
      { range: "41-60", count: 25 },
      { range: "61-80", count: 30 },
      { range: "81-100", count: 45 },
    ],
    "Quiz 2": [
      { range: "0-20", count: 10 },
      { range: "21-40", count: 18 },
      { range: "41-60", count: 22 },
      { range: "61-80", count: 35 },
      { range: "81-100", count: 40 },
    ],
  },
  "Software Testing": {
    "Quiz 1": [
      { range: "0-20", count: 5 },
      { range: "21-40", count: 15 },
      { range: "41-60", count: 25 },
      { range: "61-80", count: 30 },
      { range: "81-100", count: 45 },
    ],
    "Quiz 2": [
      { range: "0-20", count: 10 },
      { range: "21-40", count: 18 },
      { range: "41-60", count: 22 },
      { range: "61-80", count: 35 },
      { range: "81-100", count: 40 },
    ],
  },
};