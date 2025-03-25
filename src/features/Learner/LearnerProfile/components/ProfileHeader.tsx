import React from 'react';
import { Camera, Edit2, FileText, Save, X } from 'lucide-react';
import { ProfileData } from '../types';

interface ProfileHeaderProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  isViewOnly?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isEditing,
  setProfileData,
  handleEdit,
  handleSave,
  handleCancel,
  isViewOnly = false
}) => {
  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between border-b gap-4 md:gap-0">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
        <div className="relative">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-bold text-white">
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          {isEditing && !isViewOnly && (
            <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-lg">
              <Camera className="h-4 w-4 text-[#52007C]" />
            </button>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B0A3F] mb-1">{profileData.name}</h1>
          <p className="text-lg text-[#52007C]">{profileData.role}</p>
          {profileData.id && <p className="text-sm text-gray-500 mt-1">ID: {profileData.id}</p>}
        </div>
      </div>
      <div className="space-x-2 sm:space-x-3 flex flex-wrap justify-center gap-2 sm:gap-0">
        {isEditing && !isViewOnly ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 sm:px-6 py-2.5 bg-[#BF4BF6] text-white rounded-lg inline-flex items-center gap-2 hover:bg-[#A030D6] transition-colors shadow-md"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 sm:px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </>
        ) : (
          <>
            {!isViewOnly && (
              <button
                onClick={handleEdit}
                className="px-4 sm:px-6 py-2.5 bg-[#F6E6FF] text-[#52007C] rounded-lg inline-flex items-center gap-2 hover:bg-[#D68BF9] hover:text-white transition-colors shadow-md"
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            
            <button
             onClick={() => window.location.href = '/cv'}
             className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-lg inline-flex items-center gap-2 hover:from-[#52007C] hover:to-[#A030D6] transition-colors shadow-md">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">CV</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;