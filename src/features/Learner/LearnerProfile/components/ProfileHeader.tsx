import React, { useRef } from 'react';
import { Camera, Edit2, FileText, Save, X, Trash } from 'lucide-react';
import { ProfileData } from '../types'; // This should resolve to src/features/Learner/LearnerProfile/types.ts
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  isViewOnly?: boolean;
  onAvatarUpload?: (file: File) => void;
  onAvatarDelete?: () => void;
  isSaving?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isEditing,
  setProfileData,
  handleEdit,
  handleSave,
  handleCancel,
  isViewOnly = false,
  onAvatarUpload,
  onAvatarDelete,
  isSaving = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate(); // Import and use useNavigate hook

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarUpload) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  const handleViewCv = () => {
    // For now, we navigate with userId, but Cv.tsx is not yet dynamic
    // This sets up the navigation pattern for when Cv.tsx becomes dynamic
    navigate(`/cv?userId=${profileData.id}`); 
  };

  return (
    <div className="p-6 flex flex-col md:flex-row items-center md:items-start justify-between border-b border-[#BF4BF6]/20 gap-4 md:gap-0">
      <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative">
          {profileData.avatar ? (
            <img 
              src={profileData.avatar} 
              alt={profileData.name} 
              className="h-28 w-28 rounded-2xl object-cover shadow-lg border border-[#BF4BF6]/20"
            />
          ) : (
            <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : '??'}
              </span>
            </div>
          )}
          {isEditing && !isViewOnly && (
            <>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button 
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-[#F6E6FF] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload new avatar"
                >
                  <Camera className="h-4 w-4 text-[#52007C]" />
                </button>
                
                {profileData.avatar && onAvatarDelete && (
                  <button 
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-red-100 transition-colors"
                    onClick={onAvatarDelete}
                    title="Remove avatar"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B0A3F] mb-1">{profileData.name}</h1>
          
          {/* Editable Job Role */}
          {isEditing ? (
            <input 
              type="text"
              value={profileData.role || ''}
              onChange={(e) => setProfileData({...profileData, role: e.target.value})}
              className="text-lg text-[#52007C] bg-[#F6E6FF]/50 border border-[#BF4BF6]/30 rounded-lg px-3 py-1.5 w-full md:w-64 focus:outline-none focus:border-[#BF4BF6]"
              placeholder="Enter job role"
            />
          ) : (
            <p className="text-lg text-[#52007C] font-medium">{profileData.role || profileData.jobRole || 'Job Role'}</p>
          )}
          
          {/* User ID with better placement and styling */}
          {!isEditing && (
            <div className="text-xs text-gray-500 mt-1 bg-[#F6E6FF]/50 px-2 py-1 rounded-md inline-block">
              <span className="font-medium">ID:</span> {profileData.id}
            </div>
          )}
        </div>
      </div>
      <div className="space-x-2 sm:space-x-3 flex flex-wrap justify-center gap-2 sm:gap-0">
        {isEditing && !isViewOnly ? (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg inline-flex items-center gap-2 transition-colors shadow-md disabled:opacity-70 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2.5 bg-[#F6E6FF] text-[#52007C] rounded-lg inline-flex items-center gap-2 hover:bg-[#E6D0FF] transition-colors disabled:opacity-70"
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
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
            
           <button
              onClick={handleViewCv} // Updated to use the new handler
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-lg inline-flex items-center gap-2 hover:from-[#52007C] hover:to-[#A030D6] transition-colors shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">View CV</span>
              <span className="sm:hidden">CV</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;