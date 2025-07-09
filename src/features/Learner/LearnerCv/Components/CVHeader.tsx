// src/features/Learner/LearnerCv/Components/CVHeader.tsx
import React from 'react';
import { Mail, Phone, Briefcase, User, Download } from 'lucide-react';
import { PersonalInfo } from '../types/types';

interface CVHeaderProps {
  personalInfo: PersonalInfo;
  onDownloadCV: () => void;
}

const CVHeader: React.FC<CVHeaderProps> = ({ personalInfo, onDownloadCV }) => {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-start gap-6 flex-1">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-purple-200 overflow-hidden bg-white shadow-lg">
              {personalInfo.photo ? (
                <img 
                  src={personalInfo.photo} 
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <User size={32} className="text-purple-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">{personalInfo.name}</h1>
            <h2 className="text-xl text-purple-200 mb-4 font-medium">{personalInfo.position}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-purple-300" />
                <span>{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-purple-300" />
                <span>{personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-purple-300" />
                <span>Department of {personalInfo.department}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDownloadCV}
          className="download-button bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg flex-shrink-0"  //Added download-button class
        >
          <Download size={16} />
          Download CV
        </button>
      </div>
    </div>
  );
};

export default CVHeader;