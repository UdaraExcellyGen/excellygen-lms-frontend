import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CourseCoordinatorAnalytics from './features/Coordinator/Analytics/CourseCoordinatorAnalytics';





function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/coordinator/dashboard" element={<CourseCoordinatorAnalytics/>} />
          


        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;