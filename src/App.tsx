import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/LandingPage';

import LearnerDashboard from './features/Learner/LearnerDashboard/LearnerDashboard';
import { SidebarProvider } from './components/Sidebar/contexts/SidebarContext';
import { SearchProvider } from './components/Sidebar/contexts/SearchContext'; // Import SearchProvider

// Import search components
import SearchResults from './components/Sidebar/SearchResults';
import ViewLearnerProfile from './components/Sidebar/ViewLearnerProfile';


import BadgesAndRewards from './features/Learner/BadgesAndRewards/BadgesAndRewards';
import LearnerProjects from './features/Learner/LearnerProjects/LearnerProjects';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';

import AdminAnalytics from './features/Admin/AdminAnalytics/Adminanalytics';

import LearnerNotifications from './features/Learner/LearnerNotifications/LearnerNotification';
import ProjectManagerNotification from './features/ProjectManager/PMnotifications/ProjectManagerNotification';



import CertificatesPage from './features/Learner/Certificates/CertificatePage';
import DiscussionForum from './features/Learner/DiscussionForum/DiscussionForum';
import EmployeeManagement from './features/ProjectManager/Employee-assign/Employee-assign';
import ProjectManagerDashboard from './features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard';
import ProjectCruds from './features/ProjectManager/ProjectCruds/ProjectCruds';
import Leaderboard from './features/Learner/Leaderboard/Leaderboard';



import AdminDashboard from './features/Admin/AdminDashboard/AdminDashboard';
import LearnerProfile from './features/Learner/LearnerProfile/LearnerProfile';


// coordinator import
import { CourseProvider } from './features/Coordinator/contexts/CourseContext';
import QuizCreator from './features/Coordinator/QuizCreator/QuizCreator';
import PublishCoursePage from './features/Coordinator/CreateNewCourse/PublishCoursePage/PublishCoursePage';
import CoursesDisplayPage from './features/Coordinator/CoursesDisplayPage/CoursesDisplayPage';
import UploadMaterials from './features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials';
import LearnerListPage from './features/Coordinator/LearnerListPage/LearnerListPage';
import CourseDetails from './features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';
import CourseCoordinatorDashboard from './features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard';
import CCNotifications from './features/Coordinator/CoordinatorNotification/CCNotifications';
import LearnerQuizPage from './features/Coordinator/learnerQuizPage/learnerQuizPage';
import CoordinatorCourseOverview from './features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/CoordinatorCourseOverview';

function App() {
  // Helper function to wrap component with CourseProvider
  const withCourseContex = (Component: React.ComponentType) => (
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

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage/>} />


          
          
          {/* Learner routes with Search functionality */}
          <Route path="/learner/dashboard" element={withSidebarAndSearch(LearnerDashboard)} />
          <Route path="/profile" element={withSidebarAndSearch(LearnerProfile)} />
          <Route path="/badges-rewards" element={withSidebarAndSearch(BadgesAndRewards)} />
          <Route path="/learner-projects" element={withSidebarAndSearch(LearnerProjects)} />
          <Route path="/certificate" element={withSidebarAndSearch(CertificatesPage)} />
          <Route path="/forum" element={withSidebarAndSearch(DiscussionForum)} />
          <Route path="/notifications" element={withSidebarAndSearch(LearnerNotifications)} />
          <Route path="/leaderboard" element={withSidebarAndSearch(Leaderboard)} />
          
          {/* New search routes */}
          <Route path="/search-results" element={withSidebarAndSearch(SearchResults)} />
          <Route path="/learner/:id" element={withSidebarAndSearch(ViewLearnerProfile)} />

          
          <Route path="/admin/notifications" element={<AdminNotifications/>} />
          <Route path="/admin/analytics" element={<AdminAnalytics/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />
          <Route path="/coordinator/notifications" element={<CCNotifications/>} />
          <Route path="/ProjectManager/notifications" element={<ProjectManagerNotification/>} />
          <Route path="/project-manager/dashboard" element={<ProjectManagerDashboard/>} />
          <Route path="/project-manager/employee-assign" element={<EmployeeManagement/>} />
          
          <Route path="/project-manager/project-cruds" element={<ProjectCruds />} />
          <Route path="/project-manager/project-cruds/technologies" element={<ProjectCruds />} />
          <Route path="/project-manager/project-cruds/roles" element={<ProjectCruds />} />

          {/* coordinator routes */}
          <Route path="/coordinator/analytics" element={<CourseCoordinatorAnalytics/>} />
          <Route path="/coordinator/dashboard" element={<CourseCoordinatorDashboard/>} />
          <Route path="/coordinator/learner-list" element={<LearnerListPage/>} />
          <Route path="/coordinator/quiz-learner-view" element={<LearnerQuizPage/>} />
          <Route path="/coordinator/quiz-creator" element={withCourseContex(QuizCreator)}/>
          <Route path="/coordinator/upload-materials" element={withCourseContex(UploadMaterials)} />
          <Route path="/coordinator/publish-Course" element={withCourseContex(PublishCoursePage)} />
          <Route path="/coordinator/course-display-page" element={withCourseContex(CoursesDisplayPage)} />
          <Route path="/coordinator/course-details" element={withCourseContex(CourseDetails)} />
          <Route path="/coordinator/course-view" element={<CoordinatorCourseOverview/>}/>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;