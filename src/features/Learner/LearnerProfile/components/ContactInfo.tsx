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
        {[
          [Mail, 'email', 'Email'],
          [Phone, 'phone', 'Phone'],
          [Briefcase, 'department', 'Department']
        ].map(([Icon, field, label]) => (
          <div key={field as string} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              {React.createElement(Icon as React.ElementType, { className: "h-5 w-5 text-[#BF4BF6]" })}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={profileData[field as keyof ProfileData] as string}
                onChange={(e) => setProfileData({ ...profileData, [field as string]: e.target.value })}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2"
              />
            ) : (
              <div className="overflow-hidden">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-[#1B0A3F] font-medium truncate">{profileData[field as keyof ProfileData]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;