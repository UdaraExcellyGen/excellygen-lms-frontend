import React from 'react';
import { Mail, Phone, Download, MapPin } from 'lucide-react';
import { PersonalInfo } from '../types/types';

interface CVHeaderProps {
  personalInfo: PersonalInfo;
  onDownloadCV: () => void;
}

const CVHeader: React.FC<CVHeaderProps> = ({ personalInfo, onDownloadCV }) => {
  return (
    <div className="bg-white flex min-h-[200px]">
      {/* Left side - Contact Info (Dark Blue Background) */}
      <div className="w-1/3 bg-blue-900 text-white p-6 flex flex-col">
        {/* Profile Photo */}
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mx-auto">
            {personalInfo.photo ? (
              <img 
                src={personalInfo.photo} 
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-2xl font-bold">
                  {personalInfo.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Section */}
        <div>
          <h3 className="text-sm font-bold mb-3 bg-blue-800 text-white p-2 text-center">Contact</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-white mb-1">Phone</p>
              <p className="text-xs text-blue-100">{personalInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-1">Email</p>
              <p className="text-xs text-blue-100 break-all">{personalInfo.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-1">Department</p>
              <p className="text-xs text-blue-100">{personalInfo.department}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Name and Position */}
      <div className="w-2/3 bg-gray-50 p-6 flex flex-col justify-center relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={onDownloadCV}
            className="download-button bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg text-white text-sm"
          >
            <Download size={16} />
            Download CV
          </button>
        </div>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 uppercase tracking-wide">{personalInfo.name}</h1>
          <h2 className="text-lg text-gray-600 font-medium">{personalInfo.position}</h2>
        </div>
      </div>
    </div>
  );
};

export default CVHeader;
