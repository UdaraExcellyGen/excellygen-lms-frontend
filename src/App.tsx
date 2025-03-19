import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/LandingPage';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';
import CourseCoordinatorDashboard from './features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard';
import LearnerDashboard from './features/Learner/LearnerDashboard/LearnerDashboard';
import { SidebarProvider } from './components/Layout/Sidebar/contexts/SidebarContext';
import CourseDetails from './features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails';

import { CourseProvider } from './features/Coordinator/contexts/CourseContext';

import BadgesAndRewards from './features/Learner/BadgesAndRewards/BadgesAndRewards';
import LearnerProjects from './features/Learner/LearnerProjects/LearnerProjects';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';

import AdminAnalytics from './features/Admin/AdminAnalytics/Adminanalytics';
import CCNotifications from './features/Coordinator/CoordinatorNotification/CCNotifications';

import LearnerNotifications from './features/Learner/LearnerNotifications/LearnerNotification';
import ProjectManagerNotification from './features/ProjectManager/PMnotifications/ProjectManagerNotification';

import UploadMaterials from './features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials';

import CertificatesPage from './features/Learner/Certificates/CertificatePage';
import DiscussionForum from './features/Learner/DiscussionForum/DiscussionForum';
import EmployeeManagement from './features/ProjectManager/Employee-assign/Employee-assign';
import ProjectManagerDashboard from './features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard';
import ProjectCruds from './features/ProjectManager/ProjectCruds/ProjectCruds';
import Leaderboard from './features/Learner/Leaderboard/Leaderboard';
import AdminDashboard from './features/Admin/AdminDashboard/AdminDashboard';

function App() {

  const withCourseContex = (Component: React.ComponentType) => (
    <CourseProvider>
      <Component />
    </CourseProvider>
    
  );
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/coordinator/analytics" element={<CourseCoordinatorAnalytics/>} />
          <Route path="/coordinator/dashboard" element={<CourseCoordinatorDashboard/>} />
          <Route path="/learner/dashboard" element={<SidebarProvider><LearnerDashboard/></SidebarProvider>} />

          <Route path="/coordinator/course-details" element={withCourseContex(CourseDetails)} />

          <Route path="/badges-rewards" element={<SidebarProvider><BadgesAndRewards/></SidebarProvider>} />
          <Route path="/learner-projects" element={<SidebarProvider><LearnerProjects/></SidebarProvider>} />
          <Route path="/certificate" element={<SidebarProvider><CertificatesPage/></SidebarProvider>} />
          <Route path="/forum" element={<SidebarProvider><DiscussionForum/></SidebarProvider>} />
          <Route path="/coordinator/course-details" element={<CourseDetails/>} />
          <Route path="/admin/notifications" element={<AdminNotifications/>} />

          <Route path="/admin/analytics" element={<AdminAnalytics/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />

          <Route path="/coordinator/notifications" element={<CCNotifications/>} />

          <Route path="/notifications" element={<SidebarProvider><LearnerNotifications/></SidebarProvider>} />
          <Route path="/ProjectManager/notifications" element={<ProjectManagerNotification/>} />
          <Route path="/project-manager/dashboard" element={<ProjectManagerDashboard/>} />
          <Route path="/project-manager/employee-assign" element={<EmployeeManagement/>} />
          
          {/* Project Cruds Routes */}
          <Route path="/project-manager/project-cruds" element={<ProjectCruds />} />
          <Route path="/project-manager/project-cruds/technologies" element={<ProjectCruds />} />
          <Route path="/project-manager/project-cruds/roles" element={<ProjectCruds />} />

          <Route path="/coordinator/upload-materials" element={<UploadMaterials/>} />

          <Route path="/leaderboard" element={<SidebarProvider><Leaderboard/></SidebarProvider>} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;