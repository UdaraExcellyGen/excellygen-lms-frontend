import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';
import CourseCoordinatorDashboard from './features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard';
import LearnerDashboard from './features/Learner/LearnerDashboard/LearnerDashboard';
import { SidebarProvider } from './components/Layout/Sidebar/contexts/SidebarContext';
import CourseDetails from './features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails';
import BadgesAndRewards from './features/Learner/BadgesAndRewards/BadgesAndRewards';
import LearnerProjects from './features/Learner/LearnerProjects/LearnerProjects';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';

import UploadMaterials from './features/Coordinator/CreateNewCourse/UploadMaterials/UploadMaterials';

import Certificates from './features/Learner/Certificates/Certificates';
import DiscussionForum from './features/Learner/DiscussionForum/DiscussionForum';
import L_Leaderboard from './features/Learner/L-leaderboard/L-Leaderboard';






function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/coordinator/analytics" element={<CourseCoordinatorAnalytics/>} />
          <Route path="/coordinator/dashboard" element={<CourseCoordinatorDashboard/>} />
          <Route path="/learner/dashboard" element={<SidebarProvider><LearnerDashboard/></SidebarProvider>} />
          <Route path="/badges-rewards" element={<SidebarProvider><BadgesAndRewards/></SidebarProvider>} />
          <Route path="/learner-projects" element={<SidebarProvider><LearnerProjects/></SidebarProvider>} />
          <Route path="/certificate" element={<SidebarProvider><Certificates/></SidebarProvider>} />
          <Route path="/forum" element={<SidebarProvider><DiscussionForum/></SidebarProvider>} />
          <Route path="/coordinator/course-details" element={<CourseDetails/>} />
          <Route path="/admin/notifications" element={<AdminNotifications/>} />

          <Route path="/coordinator/upload-materials" element={<UploadMaterials/>} />



          <Route path="/learner/leaderboard" element={<L_Leaderboard/>} />


          

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;