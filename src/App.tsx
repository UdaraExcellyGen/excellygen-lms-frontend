// src/App.tsx - Simplified Enterprise Version

import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Loading Provider and Book Loader
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import BookLoader from './components/common/BookLoader';
import { setupLoaderFunctions } from './api/apiClient';

// Protected Route
import ProtectedRoute from './components/routing/ProtectedRoute';

// Context Providers
import { SidebarProvider } from './components/Sidebar/contexts/SidebarContext';
import { SearchProvider } from './components/Sidebar/contexts/SearchContext';
import { CourseProvider, useCourseContext } from './features/Coordinator/contexts/CourseContext';
import { NotificationProvider } from './contexts/NotificationContext';

// User Roles
import { UserRole } from './types/auth.types';

// 🚀 LAZY LOADED COMPONENTS - Only load when needed
// Learner Components
const LearnerDashboard = lazy(() => import('./features/Learner/LearnerDashboard/LearnerDashboard'));
const LearnerProfile = lazy(() => import('./features/Learner/LearnerProfile/LearnerProfile'));
const BadgesAndRewards = lazy(() => import('./features/Learner/BadgesAndRewards/BadgesAndRewards'));
const LearnerProjects = lazy(() => import('./features/Learner/LearnerProjects/LearnerProjects'));
const CertificatesPage = lazy(() => import('./features/Learner/Certificates/CertificatePage'));
const DiscussionForum = lazy(() => import('./features/Learner/DiscussionForum/DiscussionForum'));
const LearnerNotifications = lazy(() => import('./features/Learner/LearnerNotifications/LearnerNotification'));
const Leaderboard = lazy(() => import('./features/Learner/Leaderboard/Leaderboard'));
const CourseCategories = lazy(() => import('./features/Learner/CourseCategories/CourseCategories'));
const CourseContent = lazy(() => import('./features/Learner/CourseContent/CourseContent'));
const LearnerCourseOverview = lazy(() => import('./features/Learner/CourseContent/LearnerCourseOverview'));
const TakeQuiz = lazy(() => import('./features/Learner/TakeQuiz/TakeQuiz'));
const QuizResults = lazy(() => import('./features/Learner/QuizResults/QuizResults'));

// Admin Components
const AdminDashboard = lazy(() => import('./features/Admin/AdminDashboard/AdminDashboard'));
const AdminNotifications = lazy(() => import('./features/Admin/AdminNotifications/MainAdminNotification'));
const AdminAnalytics = lazy(() => import('./features/Admin/AdminAnalytics/Adminanalytics'));
const ManageUsers = lazy(() => import('./features/Admin/ManageUser/ManageUser'));
const ManageTech = lazy(() => import('./features/Admin/ManageTech/ManageTech'));
const CategoryCoursesPage = lazy(() => import('./features/Admin/CategoryCourses/CategoryCoursesPage'));
const ManageCourseCategory = lazy(() => import('./features/Admin/ManageCourseCategory/ManageCourseCategory'));

// Coordinator Components
const CourseCoordinatorDashboard = lazy(() => import('./features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard'));
const CourseCoordinatorAnalytics = lazy(() => import('./features/Coordinator/Analytics/CourseCoordinatorAnalytics'));
const CCNotifications = lazy(() => import('./features/Coordinator/CoordinatorNotification/CCNotifications'));
const LearnerListPage = lazy(() => import('./features/Coordinator/LearnerListPage/LearnerListPage'));
const LearnerQuizPage = lazy(() => import('./features/Coordinator/learnerQuizPage/learnerQuizPage'));
const QuizCreator = lazy(() => import('./features/Coordinator/QuizCreator/QuizCreator'));
const UploadMaterials = lazy(() => import('./features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials'));
const PublishCoursePage = lazy(() => import('./features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage'));
const CoursesDisplayPage = lazy(() => import('./features/Coordinator/CoursesDisplayPage/CoursesDisplayPage'));
const CourseDetails = lazy(() => import('./features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails'));
const CoordinatorCourseOverview = lazy(() => import('./features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/CoordinatorCourseOverview'));
const AssignLearners = lazy(() => import('./features/Coordinator/coordinatorCourseView/AssignLearners/AssignLearners'));
const CreateQuiz = lazy(() => import('./features/Coordinator/QuizManagement/CreateQuiz'));
const EditQuiz = lazy(() => import('./features/Coordinator/QuizManagement/EditQuiz'));
const QuizList = lazy(() => import('./features/Coordinator/LessonQuizzes/QuizList'));
const QuizResultsCoordinator = lazy(() => import('./features/Coordinator/LessonQuizzes/QuizResultsCoordinator'));

// Project Manager Components
const ProjectManagerDashboard = lazy(() => import('./features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard'));
const ProjectManagerNotification = lazy(() => import('./features/ProjectManager/PMnotifications/ProjectManagerNotification'));
const EmployeeManagement = lazy(() => import('./features/ProjectManager/Employee-assign/Employee-assign'));
const ProjectCruds = lazy(() => import('./features/ProjectManager/ProjectCruds/ProjectCruds'));

// Search Components
const SearchResults = lazy(() => import('./components/Sidebar/SearchResults'));
const ViewLearnerProfile = lazy(() => import('./components/Sidebar/ViewLearnerProfile'));

// Landing and Auth (keep these loaded immediately as they're entry points)
import LandingPage from './features/landing/AnimatedLandingPage';
import RoleSelection from './features/auth/RoleSelection';

// 🎨 Enhanced Loading Component
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center">
    <div className="text-center">
      <BookLoader />
      <p className="text-white mt-4 text-lg">Loading...</p>
    </div>
  </div>
);

// API Loading Interceptor Component
const ApiLoadingInterceptor: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  
  useEffect(() => {
    setupLoaderFunctions(startLoading, stopLoading);
  }, [startLoading, stopLoading]);
  
  return null; 
};

// ENTERPRISE APPROACH: Simple cleanup on logout
const AuthCleanup: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('User logged out, clearing session data...');
      // Simple cleanup - only clear what's necessary
      try {
        sessionStorage.removeItem('course_categories');
        console.log('Session data cleared');
      } catch (error) {
        console.log('Session cleanup failed:', error);
      }
    }
  }, [user]);

  return null;
};

function AppWrapper() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <NotificationProvider>
            <ApiLoadingInterceptor />
            <AuthCleanup />
            <BookLoader />
            <App />
            <Toaster position="top-right" />
          </NotificationProvider>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

function App() {
  // Helper function to wrap component with CourseProvider
  const withCourseContext = (Component: React.ComponentType) => (
    <CourseProvider>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </CourseProvider>
  );

  // Helper function to wrap component with SidebarProvider and SearchProvider
  const withSidebarAndSearch = (Component: React.ComponentType) => (
    <SidebarProvider>
      <SearchProvider>
        <Suspense fallback={<PageLoader />}>
          <Component />
        </Suspense>
      </SearchProvider>
    </SidebarProvider>
  );

  const CourseAssignLearners = () => {
    const { courseData } = useCourseContext();
    return <AssignLearners courseName={courseData.basicDetails.title} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public Routes - Keep immediately loaded */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route 
          path="/role-selection" 
          element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } 
        />

        {/* LEARNER ROUTES - All lazy loaded */}
        <Route path="/learner">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerDashboard)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerProfile)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="badges-rewards" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(BadgesAndRewards)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="projects" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerProjects)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="certificate" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(CertificatesPage)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="forum" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(DiscussionForum)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerNotifications)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="leaderboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(Leaderboard)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-categories" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(CourseCategories)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="courses/:categoryId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(CourseContent)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-view/:courseId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerCourseOverview)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="take-quiz/:quizId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(TakeQuiz)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="quiz-results/:attemptId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(QuizResults)}
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Search Routes */}
        <Route 
          path="/search-results" 
          element={
            <ProtectedRoute>
              {withSidebarAndSearch(SearchResults)}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learner/:id" 
          element={
            <ProtectedRoute>
              {withSidebarAndSearch(ViewLearnerProfile)}
            </ProtectedRoute>
          } 
        />

        {/* ADMIN ROUTES - All lazy loaded */}
        <Route path="/admin">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <AdminNotifications/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <AdminAnalytics/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-users" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <ManageUsers/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-tech" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <ManageTech/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-categories" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <ManageCourseCategory/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="categories/:categoryId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <Suspense fallback={<PageLoader />}>
                  <CategoryCoursesPage/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* COORDINATOR ROUTES - All lazy loaded */}
        <Route path="/coordinator">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <Suspense fallback={<PageLoader />}>
                  <CourseCoordinatorDashboard/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <Suspense fallback={<PageLoader />}>
                  <CourseCoordinatorAnalytics/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <Suspense fallback={<PageLoader />}>
                  <CCNotifications/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="learner-list" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <Suspense fallback={<PageLoader />}>
                  <LearnerListPage/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="quiz-learner-view" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <Suspense fallback={<PageLoader />}>
                  <LearnerQuizPage/>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="quiz-creator" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(QuizCreator)}
              </ProtectedRoute>
            }
          />
          <Route 
            path="upload-materials/:courseId"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(UploadMaterials)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="publish-Course/:courseId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(PublishCoursePage)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-display-page" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(CoursesDisplayPage)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-details/:courseId?" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(CourseDetails)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-view/:courseId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withSidebarAndSearch(CoordinatorCourseOverview)}
              </ProtectedRoute>
            }
          />
          <Route 
            path="assign-learners" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withCourseContext(CourseAssignLearners)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="create-quiz/:lessonId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withSidebarAndSearch(CreateQuiz)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="edit-quiz/:quizId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withSidebarAndSearch(EditQuiz)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="quiz-list/:lessonId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withSidebarAndSearch(QuizList)}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="quiz-results/:quizId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                {withSidebarAndSearch(QuizResultsCoordinator)}
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* PROJECT MANAGER ROUTES - All lazy loaded */}
        <Route path="/project-manager">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <ProjectManagerDashboard/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <ProjectManagerNotification/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="employee-assign" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <EmployeeManagement/>
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <ProjectCruds />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds/technologies" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <ProjectCruds />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds/roles" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <Suspense fallback={<PageLoader />}>
                  <ProjectCruds />
                </Suspense>
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Legacy path for ProjectManager notifications */}
        <Route 
          path="/ProjectManager/notifications" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
              <Suspense fallback={<PageLoader />}>
                <ProjectManagerNotification/>
              </Suspense>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default AppWrapper;