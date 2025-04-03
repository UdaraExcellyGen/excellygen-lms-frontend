import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context Providers
import { SidebarProvider } from './components/Sidebar/contexts/SidebarContext';
import { SearchProvider } from './components/Sidebar/contexts/SearchContext';
import { CourseProvider, useCourseContext } from './features/Coordinator/contexts/CourseContext';

// Landing Page
import LandingPage from './features/landing/LandingPage';

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

// Admin Components
import AdminDashboard from './features/Admin/AdminDashboard/AdminDashboard';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';
import AdminAnalytics from './features/Admin/AdminAnalytics/Adminanalytics';
import ManageUser from './features/Admin/ManageUser/ManageUser';
import ManageTech from './features/Admin/ManageTech/ManageTech';
import CourseCategoryManage from './features/Admin/ManageCourseCategory/CourseCategoryManage';

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

// Project Manager Components
import ProjectManagerDashboard from './features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard';
import ProjectManagerNotification from './features/ProjectManager/PMnotifications/ProjectManagerNotification';
import EmployeeManagement from './features/ProjectManager/Employee-assign/Employee-assign';
import ProjectCruds from './features/ProjectManager/ProjectCruds/ProjectCruds';

// Search Components
import SearchResults from './components/Sidebar/SearchResults';
import ViewLearnerProfile from './components/Sidebar/ViewLearnerProfile';

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
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage/>} />

          {/* LEARNER ROUTES*/}
          <Route path="/learner">
            {/* Main Learner Pages */}
            <Route path="dashboard" element={withSidebarAndSearch(LearnerDashboard)} />
            <Route path="profile" element={withSidebarAndSearch(LearnerProfile)} />
            <Route path="badges-rewards" element={withSidebarAndSearch(BadgesAndRewards)} />
            <Route path="projects" element={withSidebarAndSearch(LearnerProjects)} />
            <Route path="certificate" element={withSidebarAndSearch(CertificatesPage)} />
            <Route path="forum" element={withSidebarAndSearch(DiscussionForum)} />
            <Route path="notifications" element={withSidebarAndSearch(LearnerNotifications)} />
            <Route path="leaderboard" element={withSidebarAndSearch(Leaderboard)} />
            
            {/* Course related pages */}
            <Route path="course-categories" element={withSidebarAndSearch(CourseCategories)} />
            <Route path="courses/:pathTitle" element={withSidebarAndSearch(CourseContent)} />
            <Route path="course/:courseId" element={withSidebarAndSearch(CourseContent)} />
          </Route>

          {/* Legacy course routes (keeping for backward compatibility) */}
          <Route path="/courses/:pathTitle" element={withSidebarAndSearch(CourseContent)} />
          <Route path="/course/:courseId" element={withSidebarAndSearch(CourseContent)} />

          {/* Search Routes */}
          <Route path="/search-results" element={withSidebarAndSearch(SearchResults)} />
          <Route path="/learner/:id" element={withSidebarAndSearch(ViewLearnerProfile)} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin">
            <Route path="dashboard" element={<AdminDashboard/>} />
            <Route path="notifications" element={<AdminNotifications/>} />
            <Route path="analytics" element={<AdminAnalytics/>} />
            <Route path="manage-users" element={<ManageUser/>} />
            <Route path="manage-tech" element={<ManageTech/>} />
            <Route path="course-categories" element={<CourseCategoryManage/>} />
          </Route>
          
          {/*  COORDINATOR ROUTES */}
          <Route path="/coordinator">
            <Route path="dashboard" element={<CourseCoordinatorDashboard/>} />
            <Route path="analytics" element={<CourseCoordinatorAnalytics/>} />
            <Route path="notifications" element={<CCNotifications/>} />
            <Route path="learner-list" element={<LearnerListPage/>} />
            <Route path="quiz-learner-view" element={<LearnerQuizPage/>} />
            <Route path="quiz-creator" element={withCourseContext(QuizCreator)}/>
            <Route path="upload-materials" element={withCourseContext(UploadMaterials)} />
            <Route path="publish-Course" element={withCourseContext(PublishCoursePage)} />
            <Route path="course-display-page" element={withCourseContext(CoursesDisplayPage)} />
            <Route path="course-details" element={withCourseContext(CourseDetails)} />
            <Route path="course-view" element={<CoordinatorCourseOverview/>}/>
            <Route path="assign-learners" element={withCourseContext(CourseAssignLearners)} />
          </Route>
          
          {/* PROJECT MANAGER ROUTES  */}
          <Route path="/project-manager">
            <Route path="dashboard" element={<ProjectManagerDashboard/>} />
            <Route path="notifications" element={<ProjectManagerNotification/>} />
            <Route path="employee-assign" element={<EmployeeManagement/>} />
            <Route path="project-cruds" element={<ProjectCruds />} />
            <Route path="project-cruds/technologies" element={<ProjectCruds />} />
            <Route path="project-cruds/roles" element={<ProjectCruds />} />
          </Route>
          
          {/* Legacy path for ProjectManager notifications */}
          <Route path="/ProjectManager/notifications" element={<ProjectManagerNotification/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;