import React, { useRef } from 'react';
import { ProfileData } from '../types';
import { UserCircle, Camera, Trash2 } from 'lucide-react';

interface ProfileHeaderProps {
  profileData: ProfileData;
  isEditing: boolean;
  onAvatarUpload: (file: File) => void;
  onAvatarDelete: () => void;
  // This prop is no longer needed here as the parent controls saving state
  // isSaving?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileData, isEditing, onAvatarUpload, onAvatarDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-4 group">
        {profileData.avatar ? (
          <img src={profileData.avatar} alt={profileData.name} className="w-full h-full rounded-full object-cover ring-4 ring-indigo-200/50 shadow-md" />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ring-4 ring-indigo-200/50 shadow-md">
            <UserCircle strokeWidth={1} size={80} />
          </div>
        )}
        
        {isEditing && (
            <>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-3 bg-white/80 rounded-full text-indigo-600 hover:bg-white mx-1"
                        title="Change Photo"
                    >
                        <Camera size={20} />
                    </button>
                    {profileData.avatar && (
                        <button 
                            onClick={onAvatarDelete} 
                            className="p-3 bg-white/80 rounded-full text-red-500 hover:bg-white mx-1"
                            title="Remove Photo"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-800">{profileData.name}</h1>
      {isEditing ? (
        <p className="text-md text-gray-500">{profileData.role || 'Learner'}</p> // Role is not editable in this view
      ) : (
        <p className="text-md text-indigo-600 font-medium">{profileData.role || 'Learner'}</p>
      )}
      <p className="text-xs text-gray-400 mt-2 bg-gray-100 px-2 py-0.5 rounded-md inline-block">ID: {profileData.id}</p>
    </div>
  );
};

export default ProfileHeader;