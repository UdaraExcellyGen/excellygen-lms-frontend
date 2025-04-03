import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { Course } from './types/Course';
import { initialCourses, initialEnrolledCourses, validPaths } from './data/coursesData';
import ConfirmationModal from './components/ConfirmationModal';
import StatsOverview from './components/StatsOverview';
import CourseTabs from './components/CourseTabs';
import CourseGrid from './components/CourseGrid';

const CourseContent: React.FC = () => {
  const { pathTitle } = useParams<{ pathTitle: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'learning'>('courses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [selectedCourseForUnenroll, setSelectedCourseForUnenroll] = useState<Course | null>(null);

  // Load initial course data
  useEffect(() => {
    setAvailableCourses(
      initialCourses.filter(course => 
        course.category === pathTitle && 
        !initialEnrolledCourses.some(enrolled => enrolled.id === course.id)
      )
    );
    setEnrolledCourses(
      initialEnrolledCourses.filter(course => course.category === pathTitle)
    );
  }, [pathTitle]);

  // Validate path
  useEffect(() => {
    if (!validPaths.includes(pathTitle || '')) {
      navigate('/');
    }
  }, [pathTitle, navigate]);

  const handleEnroll = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find the course being enrolled
      const courseToEnroll = availableCourses.find(course => course.id === courseId);
      
      if (courseToEnroll) {
        // Add to enrolled courses with initial progress
        setEnrolledCourses(prev => [...prev, {
          ...courseToEnroll,
          enrolled: true,
          progress: 0
        }]);
        
        // Remove from available courses
        setAvailableCourses(prev => 
          prev.filter(course => course.id !== courseId)
        );

        // Switch to My Learning tab
        setActiveTab('learning');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to enroll in the course. Please try again.');
      setLoading(false);
    }
  };

  const handleUnenrollConfirmation = (course: Course) => {
    setSelectedCourseForUnenroll(course);
    setIsUnenrollModalOpen(true);
  };

  const handleUnenroll = async () => {
    if (!selectedCourseForUnenroll) return;

    try {
      setLoading(true);
      setError(null);

      // Move course back to available courses
      setAvailableCourses(prev => [...prev, {
        ...selectedCourseForUnenroll,
        enrolled: false,
        progress: undefined
      }]);

      // Remove from enrolled courses
      setEnrolledCourses(prev => 
        prev.filter(course => course.id !== selectedCourseForUnenroll.id)
      );

      setLoading(false);
      setIsUnenrollModalOpen(false);
      setSelectedCourseForUnenroll(null);
    } catch (err) {
      setError('Failed to unenroll from the course. Please try again.');
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-[#D68BF9] hover:text-white transition-colors mb-6 font-nunito"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Course categories
          </button>
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold font-unbounded mb-4 bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
              {pathTitle}
            </h2>
            <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
              Explore our curated courses and start your learning journey
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview 
            availableCoursesCount={availableCourses.length}
            enrolledCoursesCount={enrolledCourses.length}
          />

          {/* Tabs */}
          <CourseTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />

          {/* Error Message */}
          {error && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 mb-6 border border-red-500 text-red-500 font-nunito">
              {error}
            </div>
          )}

          {/* Course Grid */}
          <CourseGrid
            activeTab={activeTab}
            availableCourses={availableCourses}
            enrolledCourses={enrolledCourses}
            loading={loading}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenrollConfirmation}
            onContinueLearning={handleContinueLearning}
          />
        </div>

        {/* Unenroll Confirmation Modal */}
        <ConfirmationModal
          isOpen={isUnenrollModalOpen}
          onClose={() => {
            setIsUnenrollModalOpen(false);
            setSelectedCourseForUnenroll(null);
          }}
          onConfirm={handleUnenroll}
          title="Confirm Unenrollment"
          courseName={selectedCourseForUnenroll?.title || ''}
        />
      </div>
    </Layout>
  );
};

export default CourseContent;