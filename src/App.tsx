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
import AdminNotificationGroup from './features/Admin/AdminNotifications/Components/NotificationGroup';
import AdminNotifications from './features/Admin/AdminNotifications/MainAdminNotification';





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
          <Route path="/coordinator/course-details" element={<CourseDetails/>} />
          <Route path="/admin/notifications" element={<AdminNotifications/>} />



          

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;