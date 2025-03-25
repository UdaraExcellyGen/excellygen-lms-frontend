// src/components/Footer.tsx
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-russian-violet text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
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
              <span className="text-xl font-bold">
                Excelly<span className="text-phlox">Gen</span>
              </span>
            </div>
            <p className="text-gray-300">
              Empowering businesses with cutting-edge AI solutions for continuous learning and development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button className="text-gray-300 hover:text-phlox transition-colors duration-200">About Us</button></li>
              <li><button className="text-gray-300 hover:text-phlox transition-colors duration-200">Services</button></li>
              <li><button className="text-gray-300 hover:text-phlox transition-colors duration-200">Contact</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <MapPin size={18} className="text-phlox" />
                <span className="text-gray-300">440B, Batama South, Kadana</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-phlox" />
                <span className="text-gray-300">+94 718 677 861</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-phlox" />
                <span className="text-gray-300">hello@excelly.io</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <button className="text-gray-300 hover:text-phlox transition-colors duration-200">
                <Facebook size={24} />
              </button>
              <button className="text-gray-300 hover:text-phlox transition-colors duration-200">
                <Twitter size={24} />
              </button>
              <button className="text-gray-300 hover:text-phlox transition-colors duration-200">
                <Linkedin size={24} />
              </button>
              <button className="text-gray-300 hover:text-phlox transition-colors duration-200">
                <Instagram size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {currentYear} ExcellyGen. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;