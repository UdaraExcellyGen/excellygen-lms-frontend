import React, { useState } from 'react';
import NavBar from '../../components/Navbar/NavBar';
import Footer from '../Coordinator/LearnerListPage/components/Footer';
import AuthContainer from '../auth/AuthContainer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';

const LandingPage: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const handleGetStarted = (): void => {
    setIsAuthOpen(true);
  };

  const handleCloseAuth = (): void => {
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6E6FF]">
      <NavBar />
      <main className="flex-grow">
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
      </main>
      <Footer />
      <AuthContainer 
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
      />
    </div>
  );
};

export default LandingPage;