import React, { useState } from 'react';
import NavBar from '../../components/Layout/Navbar/NavBar';
import Footer from '../../components/Layout/Footer/Footer';
import AuthContainer from '../../features/auth/AuthContainer';
import HeroSection from '../../features/landing/components/HeroSection';
import FeaturesSection from '../../features/landing/components/FeaturesSection';

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