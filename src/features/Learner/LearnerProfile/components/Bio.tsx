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
    <div className="p-6 border-b border-[#BF4BF6]/20">
      <h2 className="text-xl font-semibold text-[#1B0A3F] mb-4">About</h2>
      {isEditing ? (
        <textarea
          value={profileData.about || ''}
          onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
          className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/30 rounded-xl px-4 py-3 h-36 focus:outline-none focus:border-[#BF4BF6]"
          placeholder="Tell us about yourself..."
        />
      ) : (
        <p className="text-[#1B0A3F] leading-relaxed bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-[#BF4BF6]/10 shadow-sm">
          {profileData.about || 'No bio provided.'}
        </p>
      )}
    </div>
  );
};

export default Bio;