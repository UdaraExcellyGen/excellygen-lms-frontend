import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import EnrollmentChart from "./components/EnrollmentChart";
import QuizPerformance from "./components/QuizPerformance";
import { enrollmentData, quizData } from "./data/mockData";

const CourseCoordinatorAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string>("React");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("Quiz 1");

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    setSelectedQuiz(Object.keys(quizData[course])[0]);
  };

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      <Header
        title="Course Analytics"
        subtitle="Course Enrollment and Quiz Performance Analytics"
        onBackClick={() => navigate('/coordinator/dashboard')}
      />

      <EnrollmentChart data={enrollmentData} />

      <QuizPerformance
        quizData={quizData}
        selectedCourse={selectedCourse}
        selectedQuiz={selectedQuiz}
        onCourseChange={handleCourseChange}
        onQuizChange={setSelectedQuiz}
      />
    </div>
  );
};

export default CourseCoordinatorAnalytics;