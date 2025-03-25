import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { ProfileData, Skill } from '../types';
import { PREDEFINED_SKILLS } from '../data/skills';

interface TechnologyStackProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  viewOnly?: boolean;
}

const TechnologyStack: React.FC<TechnologyStackProps> = ({
  profileData,
  setProfileData,
  viewOnly = false
}) => {
  const handleSkillAdd = (skillName: string) => {
    if (viewOnly) return;
    
    if (!profileData.skills.some(s => s.name === skillName)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, { name: skillName }]
      });
    }
  };

  const handleSkillRemove = (skillName: string) => {
    if (viewOnly) return;
    
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s.name !== skillName)
    });
  };

  return (
    <div className="p-4 sm:p-8 border-b bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Technology Stack</h2>
        {!viewOnly && (
          <div className="relative inline-block w-full sm:w-auto">
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  handleSkillAdd(value);
                  e.target.value = '';
                }
              }}
              className="w-full sm:w-48 px-4 py-2 appearance-none bg-[#F6E6FF] text-[#52007C] border border-[#E4D5F4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] cursor-pointer pr-10"
              defaultValue=""
            >
              <option value="" disabled>Add technology</option>
              {PREDEFINED_SKILLS
                .filter(skill => !profileData.skills.some(s => s.name === skill))
                .map(skill => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52007C] pointer-events-none transform rotate-90" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {profileData.skills.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {viewOnly ? 
              "No technologies added to this profile." : 
              "Select technologies from the dropdown to add them to your profile."}
          </p>
        ) : (
          profileData.skills.map((skill) => (
            <div
              key={skill.name}
              className="bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full px-4 py-2 relative group"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{skill.name}</span>
              </div>
              {!viewOnly && (
                <button
                  onClick={() => handleSkillRemove(skill.name)}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TechnologyStack;