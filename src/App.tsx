import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

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

// User Roles
import { UserRole } from './types/auth.types';

// Learner Components
import LearnerDashboard from './features/Learner/LearnerDashboard/LearnerDashboard';
import LearnerProfile from './features/Learner/LearnerProfile/LearnerProfile';
import BadgesAndRewards from './features/Learner/BadgesAndRewards/BadgesAndRewards';
import LearnerProjects from './features/Learner/LearnerProjects/LearnerProjects';
import CertificatesPage from './features/Learner/Certificates/CertificatePage';
import DiscussionForum from './features/Learner/DiscussionForum/DiscussionForum';
import LearnerNotifications from './features/Learner/LearnerNotifications/LearnerNotification';
import Leaderboard from './features/Learner/Leaderboard/Leaderboard';
import CourseCategories from './features/Learner/CourseCategories/CourseCategories';
import CourseContent from './features/Learner/CourseContent/CourseContent';
import LearnerCourseOverview from './features/Learner/CourseContent/LearnerCourseOverview';
import TakeQuiz from './features/Learner/TakeQuiz/TakeQuiz';
import QuizResults from './features/Learner/QuizResults/QuizResults';

// Admin Components
import AdminDashboard from './features/Admin/AdminDashboard/AdminDashboard';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';
import AdminAnalytics from './features/Admin/AdminAnalytics/Adminanalytics';
import ManageUsers from './features/Admin/ManageUser/ManageUser';
import ManageTech from './features/Admin/ManageTech/ManageTech';

// Coordinator Components
import CourseCoordinatorDashboard from './features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';
import CCNotifications from './features/Coordinator/CoordinatorNotification/CCNotifications';
import LearnerListPage from './features/Coordinator/LearnerListPage/LearnerListPage';
import LearnerQuizPage from './features/Coordinator/learnerQuizPage/learnerQuizPage';
import QuizCreator from './features/Coordinator/QuizCreator/QuizCreator';
import UploadMaterials from './features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials';
import PublishCoursePage from './features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage';
import CoursesDisplayPage from './features/Coordinator/CoursesDisplayPage/CoursesDisplayPage';
import CourseDetails from './features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails';
import CoordinatorCourseOverview from './features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/CoordinatorCourseOverview';
import AssignLearners from './features/Coordinator/coordinatorCourseView/AssignLearners/AssignLearners';
import CreateQuiz from './features/Coordinator/QuizManagement/CreateQuiz';
import EditQuiz from './features/Coordinator/QuizManagement/EditQuiz';

import QuizList from './features/Coordinator/LessonQuizzes/QuizList';
import QuizResultsCoordinator from './features/Coordinator/LessonQuizzes/QuizResultsCoordinator';

// Project Manager Components
import ProjectManagerDashboard from './features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard';
import ProjectManagerNotification from './features/ProjectManager/PMnotifications/ProjectManagerNotification';
import EmployeeManagement from './features/ProjectManager/Employee-assign/Employee-assign';
import ProjectCruds from './features/ProjectManager/ProjectCruds/ProjectCruds';

// Search Components
import SearchResults from './components/Sidebar/SearchResults';
import ViewLearnerProfile from './components/Sidebar/ViewLearnerProfile';
import CategoryCoursesPage from './features/Admin/CategoryCourses/CategoryCoursesPage';
import ManageCourseCategory from './features/Admin/ManageCourseCategory/ManageCourseCategory';
import LandingPage from './features/landing/AnimatedLandingPage';
import RoleSelection from './features/auth/RoleSelection';

// API Loading Interceptor Component
const ApiLoadingInterceptor: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  
  useEffect(() => {
    // Setup the loader functions for API client
    setupLoaderFunctions(startLoading, stopLoading);
  }, [startLoading, stopLoading]);
  
  return null; 
};

function AppWrapper() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <ApiLoadingInterceptor />
          <BookLoader />
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

function App() {
  // Helper function to wrap component with CourseProvider
  const withCourseContext = (Component: React.ComponentType) => (
    <CourseProvider>
      <Component />
    </CourseProvider>
  );

  // Helper function to wrap component with SidebarProvider and SearchProvider
  const withSidebarAndSearch = (Component: React.ComponentType) => (
    <SidebarProvider>
      <SearchProvider>
        <Component />
      </SearchProvider>
    </SidebarProvider>
  );

  const CourseAssignLearners = () => { // Create a wrapper component to access context
    const { courseData } = useCourseContext();
    return <AssignLearners courseName={courseData.basicDetails.title} />; // Pass courseName from context
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public Routes */}
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

        {/* LEARNER ROUTES*/}
        <Route path="/learner">
          {/* Main Learner Pages */}
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
          
          {/* Course related pages */}
          <Route 
            path="course-categories" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(CourseCategories)}
              </ProtectedRoute>
            } 
          />
          {/* Route for category-specific courses */}
          <Route 
            path="courses/:categoryId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(CourseContent)}
              </ProtectedRoute>
            } 
          />
          {/* Route for specific course overview (learner view) */}
          <Route 
            path="course-view/:courseId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Learner]}>
                {withSidebarAndSearch(LearnerCourseOverview)}
              </ProtectedRoute>
            } 
          />
          
          {/* Quiz related pages */}
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

        
        {/* ADMIN ROUTES */}
        <Route path="/admin">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <AdminDashboard/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <AdminNotifications/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <AdminAnalytics/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-users" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <ManageUsers/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-tech" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <ManageTech/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="course-categories" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <ManageCourseCategory/>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="categories/:categoryId" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                <CategoryCoursesPage/>
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/*  COORDINATOR ROUTES */}
        <Route path="/coordinator">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <CourseCoordinatorDashboard/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <CourseCoordinatorAnalytics/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <CCNotifications/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="learner-list" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <LearnerListPage/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="quiz-learner-view" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CourseCoordinator]}>
                <LearnerQuizPage/>
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
          
          {/* Quiz Management Routes */}
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
        
        {/* PROJECT MANAGER ROUTES  */}
        <Route path="/project-manager">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <ProjectManagerDashboard/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <ProjectManagerNotification/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="employee-assign" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <EmployeeManagement/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <ProjectCruds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds/technologies" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <ProjectCruds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="project-cruds/roles" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
                <ProjectCruds />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Legacy path for ProjectManager notifications */}
        <Route 
          path="/ProjectManager/notifications" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ProjectManager]}>
              <ProjectManagerNotification/>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default AppWrapper;