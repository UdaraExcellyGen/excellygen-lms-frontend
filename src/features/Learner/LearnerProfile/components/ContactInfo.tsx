// src/features/Learner/LearnerProfile/components/ContactInfo.tsx
import React from 'react';
import { Mail, Phone, Briefcase } from 'lucide-react';
import { ProfileData } from '../types';

interface ContactInfoProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  profileData,
  isEditing,
  setProfileData
}) => {
  return (
    <div className="p-4 md:p-8 border-b bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Email Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.email}</p>
          </div>
        </div>
        
        {/* Phone Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-500 mb-1">Phone</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.phone}</p>
          </div>
        </div>
        
        {/* Department Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-500 mb-1">Department</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;