import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; // Auth context to get current user

import Header from './components/Header';
import StatCard from './components/StatCard';
import NotificationCard from './components/NotificationCard';
import QuickActionsGrid from './components/QuickActionsGrid';

import {
  initialNotifications, // Assuming this is still relevant or a placeholder
  getQuickActions
} from './data/dashboardData';

import { getAllCourses } from '../../../api/services/Course/courseService';
import { getAllEnrollmentsAdminView } from '../../../api/services/Course/enrollmentService'; // Added
import { CourseDto, EnrollmentDto } from '../../../types/course.types'; // Added EnrollmentDto

const CourseCoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseStats, setCourseStats] = useState<{ total: number; active: number }>({
    total: 0,
    active: 0,
  });

  const [studentStats, setStudentStats] = useState<{ total: number; active: number }>({
    total: 0, 
    active: 0, 
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        setError("User information is not available. Cannot fetch coordinator-specific data.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch courses
        const allCoursesResponse: CourseDto[] = await getAllCourses();
        const coordinatorCourses = allCoursesResponse.filter(
          (course) => course.creator && course.creator.id === user.id
        );

        const totalCoordinatorCourses = coordinatorCourses.length;
        const publishedCoordinatorCourses = coordinatorCourses.filter(
          (course) => course.status === 'Published'
        ).length;

        setCourseStats({
          total: totalCoordinatorCourses,
          active: publishedCoordinatorCourses,
        });

        // Fetch enrollments for student stats
        // Assuming CourseDto.id is number, matching EnrollmentDto.courseId
        const coordinatorCourseIds = coordinatorCourses.map(course => course.id);

        if (coordinatorCourseIds.length > 0) {
            const allEnrollments: EnrollmentDto[] = await getAllEnrollmentsAdminView();

            const coordinatorEnrollments = allEnrollments.filter(enrollment =>
                // Ensure enrollment.courseId and course.id types are compatible for includes()
                // Assuming both are numbers. If course.id is string, convert:
                // coordinatorCourseIds.map(id => String(id)).includes(String(enrollment.courseId))
                coordinatorCourseIds.includes(enrollment.courseId)
            );

            const totalEnrollmentsInCoordinatorCourses = coordinatorEnrollments.length;

            const uniqueEnrolledStudentIds = new Set<string>();
            coordinatorEnrollments.forEach(enrollment => {
                uniqueEnrolledStudentIds.add(enrollment.userId);
            });
            const uniqueStudentsInCoordinatorCourses = uniqueEnrolledStudentIds.size;

            setStudentStats({
                total: totalEnrollmentsInCoordinatorCourses,
                active: uniqueStudentsInCoordinatorCourses,
            });
        } else {
            // No courses created by this coordinator, so no student enrollments to show
            setStudentStats({ total: 0, active: 0 });
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        let errorMessage = "Failed to load dashboard data. Some statistics might be unavailable.";
        if (err instanceof Error) {
            errorMessage = `Failed to load dashboard data: ${err.message}. Some statistics might be unavailable.`;
        }
        setError(errorMessage);
        // Reset stats on error
        setCourseStats({ total: 0, active: 0 });
        setStudentStats({ total: 0, active: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchDashboardData();
    } else {
      setIsLoading(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user && isLoading) {
      return (
          <div className="min-h-screen bg-[#52007C] flex items-center justify-center">
              <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading user data...</p>
              </div>
          </div>
      );
  }
  if (isLoading) {
      return (
          <div className="min-h-screen bg-[#52007C] flex items-center justify-center">
              <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading dashboard data...</p>
              </div>
          </div>
      );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#52007C] flex flex-col items-center justify-center p-4 text-white">
        <Header
          notifications={initialNotifications}
          coordinatorName={user?.name || "Course Coordinator"}
          role="Course Coordinator"
        />
        <div className="text-center bg-white/10 p-8 rounded-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4">Oops! Something went wrong.</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
                if (user) {
                    // Trigger re-fetch by depending on useEffect's `user` dependency implicitly
                    // or explicitly call fetchDashboardData after resetting loading/error
                    setIsLoading(true);
                    setError(null);
                    // The useEffect will re-run if `user` is stable and you want an explicit retry.
                    // For an explicit call:
                    // fetchDashboardData(); // This would be called directly.
                    // However, it's often cleaner to manage via state changes that useEffect depends on.
                    // For now, relying on `useEffect` structure. If user object itself hasn't changed,
                    // a direct call or a dummy state change might be needed to force re-fetch.
                    // Let's assume useEffect with 'user' dependency is sufficient for retries if 'user' re-validates.
                    // If an explicit retry button needs to work without user changing, you might need a retry_count state.
                } else {
                    setError("Cannot retry: User data not available.");
                }
            }}
            className="bg-white text-[#52007C] px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
      return (
          <div className="min-h-screen bg-[#52007C] flex items-center justify-center">
              <p className="text-white">User not authenticated. Redirecting...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      <Header
        notifications={initialNotifications}
        coordinatorName={user.name || "Course Coordinator"}
        role="Course Coordinator"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-6 mb-6">
        <StatCard
          icon={BookOpen}
          title="My Courses"
          stats={courseStats}
          totalLabel="Total Created Courses"
          activeLabel="My Published Courses"
          onViewMore={() => navigate('/coordinator/course-display-page')}
        />

        <StatCard
          icon={Users}
          title="Student Overview (Your Courses)" 
          stats={studentStats}
          totalLabel="Total Enrollments"
          activeLabel="Unique Students Enrolled" 
          onViewMore={() => navigate('/coordinator/learner-list')}
        />

        <NotificationCard
          notifications={initialNotifications}
        />
      </div>

      <QuickActionsGrid
        actions={getQuickActions(navigate)}
      />
    </div>
  );
};

export default CourseCoordinatorDashboard;