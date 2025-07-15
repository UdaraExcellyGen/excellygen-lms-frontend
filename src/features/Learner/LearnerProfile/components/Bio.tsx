import React from 'react';
import { ProfileData } from '../types';

interface BioProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const Bio: React.FC<BioProps> = ({ profileData, isEditing, setProfileData }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">About Me</h3>
    {isEditing ? (
      <textarea
        value={profileData.about || ''}
        onChange={(e) => setProfileData(p => p ? { ...p, about: e.target.value } : null)}
        className="w-full h-32 p-3 border rounded-lg bg-indigo-50/50 border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
        placeholder="Tell us a little about yourself..."
      />
    ) : (
      <p className="text-gray-600 leading-relaxed text-sm">{profileData.about || 'No bio information provided.'}</p>
    )}
  </div>
);

export default Bio;