import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';
import CourseCoordinatorDashboard from './features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard';





function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/coordinator/analytics" element={<CourseCoordinatorAnalytics/>} />
          <Route path="/coordinator/dashboard" element={<CourseCoordinatorDashboard/>} />
          


        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;