import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProfileData } from '../types';
import { Code, X, Plus, ChevronDown, Search } from 'lucide-react';

interface TechnologyStackProps {
  profileData: ProfileData;
  isEditing: boolean;
  onSkillRemove: (skillId: string) => void;
  onSkillAdd: (skillName: string) => void;
  availableTechnologies: string[];
  isTechOperationInProgress: boolean;
}

const TechnologyStack: React.FC<TechnologyStackProps> = ({ profileData, isEditing, onSkillRemove, onSkillAdd, availableTechnologies, isTechOperationInProgress }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const userSkillsLower = new Set(profileData.skills.map(s => s.name.toLowerCase()));
    return availableTechnologies.filter(tech => 
      !userSkillsLower.has(tech.toLowerCase()) && 
      tech.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableTechnologies, profileData.skills]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddClick = (skillName: string) => {
    onSkillAdd(skillName);
    setIsSearchVisible(false);
    setSearchTerm('');
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Technology Stack</h3>
        {isEditing && (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsSearchVisible(!isSearchVisible)} disabled={isTechOperationInProgress} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                    <Plus size={14} className="mr-1"/> Add Technology <ChevronDown size={14} className="ml-1"/>
                </button>
                {isSearchVisible && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-20">
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input 
                                    type="text" 
                                    placeholder="Search technologies..." 
                                    className="w-full pl-8 pr-2 py-1.5 text-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length > 0 ? filteredOptions.map(skill => (
                                <button key={skill} onClick={() => handleAddClick(skill)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    {skill}
                                </button>
                            )) : (
                                <p className="px-4 py-2 text-sm text-gray-500">No matching skills found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {profileData.skills.length > 0 ? (
          profileData.skills.map(skill => (
            <div key={skill.id} className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:shadow-md">
              <span>{skill.name}</span>
              {isEditing && (
                <button onClick={() => onSkillRemove(skill.id!)} className="text-indigo-400 hover:text-indigo-800" disabled={isTechOperationInProgress}>
                  <X size={14} strokeWidth={3}/>
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No technologies have been added.</p>
        )}
      </div>
    </div>
  );
};

export default TechnologyStack;