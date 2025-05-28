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
    <div className="p-6 border-b border-[#BF4BF6]/20 bg-[#F6E6FF]/30 backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-[#52007C] mb-1 font-medium">Email</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.email}</p>
          </div>
        </div>
        
        {/* Phone Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-[#52007C] mb-1 font-medium">Phone</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.phone}</p>
          </div>
        </div>
        
        {/* Department Field - Always read-only */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-5 w-5 text-[#BF4BF6]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-[#52007C] mb-1 font-medium">Department</p>
            <p className="text-[#1B0A3F] font-medium truncate">{profileData.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;