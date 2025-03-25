import React from 'react';
import { ProfileData } from '../types';

interface BioProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
}

const Bio: React.FC<BioProps> = ({
  profileData,
  isEditing,
  setProfileData
}) => {
  return (
    <div className="p-4 sm:p-8 border-b">
      <h2 className="text-xl font-semibold text-[#1B0A3F] mb-3">About</h2>
      {isEditing ? (
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 h-32"
        />
      ) : (
        <p className="text-[#1B0A3F] leading-relaxed">{profileData.bio}</p>
      )}
    </div>
  );
};

export default Bio;