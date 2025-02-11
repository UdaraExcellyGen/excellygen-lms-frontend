// src/components/NavBar.tsx
import React, { useState } from 'react';
import LoginModal from './LoginModal';

const NavBar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-phlox rounded flex items-center justify-center">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-white transform rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 2L17 12L7 22" />
                </svg>
              </div>
              <span className="text-xl font-bold text-russian-violet">
                Excelly<span className="text-french-violet">Gen</span>
              </span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 text-base text-french-violet hover:text-indigo transition-colors duration-200 font-medium"
              >
                Login
              </button>
              <button className="px-4 py-2 text-base bg-french-violet hover:bg-indigo text-white rounded-md transition-colors duration-200 font-medium">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default NavBar;