import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; 
import { EnrollmentDto } from '../../../types/course.types';
import { getAllCourses } from '../../../api/services/Course/courseService';
import { getAllEnrollmentsAdminView } from '../../../api/services/Course/enrollmentService';

// Import Components
import Header from './components/Header';
import StatCard from './components/StatCard';
import NotificationCard from './components/NotificationCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';

// Import Data
import { initialNotifications, getQuickActions } from './data/dashboardData';

const CourseCoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseStats, setCourseStats] = useState<{ total: number; active: number }>({ total: 0, active: 0 });
  const [studentStats, setStudentStats] = useState<{ total: number; active: number }>({ total: 0, active: 0 });
  const [avatar, setAvatar] = useState<string | null>(null);
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
        const [allCoursesResponse, userProfile] = await Promise.all([
          getAllCourses(),
          getUserProfile(user.id)
        ]);

        // Set the avatar from the fetched profile
        if (userProfile?.avatar) {
          setAvatar(userProfile.avatar);
        }
        const coordinatorCourses = allCoursesResponse.filter(
          (course) => course.creator && course.creator.id === user.id
        );

        setCourseStats({
          total: coordinatorCourses.length,
          active: coordinatorCourses.filter(c => c.status === 'Published').length,
        });

        const coordinatorCourseIds = coordinatorCourses.map(course => course.id);

        if (coordinatorCourseIds.length > 0) {
            const allEnrollments: EnrollmentDto[] = await getAllEnrollmentsAdminView();
            const coordinatorEnrollments = allEnrollments.filter(e => coordinatorCourseIds.includes(e.courseId));
            const uniqueStudentIds = new Set(coordinatorEnrollments.map(e => e.userId));
            setStudentStats({
                total: coordinatorEnrollments.length,
                active: uniqueStudentIds.size,
            });
        } else {
            setStudentStats({ total: 0, active: 0 });
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        let errorMessage = "Failed to load dashboard data.";
        if (err instanceof Error) {
            errorMessage = `Failed to load dashboard data: ${err.message}.`;
        }
        setError(errorMessage);
        setCourseStats({ total: 0, active: 0 });
        setStudentStats({ total: 0, active: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div className="text-xl">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg text-red-700 px-6 py-4 max-w-lg text-center">
          <p className="font-semibold text-lg mb-2 text-[#1B0A3F]">Error Loading Dashboard</p>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
      return (
          <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center">
              <p className="text-white">User not authenticated. Please log in.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg relative z-50">
          <Header
            notifications={initialNotifications}
            coordinatorName={user.name || "Course Coordinator"}
            role="Course Coordinator"
            avatar={avatar}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <StatCard
            icon={BookOpen}
            title="My Courses"
            stats={courseStats}
            totalLabel="Total Created Courses"
            activeLabel="My Published Courses"
            onClick={() => navigate('/coordinator/course-display-page')}
          />
          <StatCard
            icon={Users}
            title="Student Overview"
            stats={studentStats}
            totalLabel="Total Enrollments"
            activeLabel="Unique Students Enrolled"
            onClick={() => navigate('/coordinator/learner-list')}
          />
          <NotificationCard notifications={initialNotifications} />
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
            <h2 className="text-white text-xl font-['Unbounded'] font-bold">Quick Actions</h2>
          </div>
          <QuickActionsGrid actions={getQuickActions(navigate)} />
        </div>
      </div>
    </div>
  );
};

export default CourseCoordinatorDashboard;