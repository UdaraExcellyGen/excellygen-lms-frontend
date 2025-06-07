import React, { useState } from 'react';
import NavBar from '../../components/Navbar/NavBar';
import Footer from '../../components/Footer/Footer';
import AuthContainer from '../../features/auth/AuthContainer';
import AnimatedHeroSection from './components/AnimatedHeroSection';
import AnimatedFeaturesSection from './components/AnimatedFeaturesSection';

const AnimatedLandingPage: React.FC = () => {
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
        <AnimatedHeroSection onGetStarted={handleGetStarted} />
        <AnimatedFeaturesSection />
      </main>
      <Footer />
      <AuthContainer 
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
      />
    </div>
  );
};

export default AnimatedLandingPage;