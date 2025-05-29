import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronDown, X, Search, Plus } from 'lucide-react';
import { ProfileData, Skill } from '../types';

interface TechnologyStackProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  viewOnly?: boolean;
  availableTechnologies?: string[];
  onSkillAdd?: (skillName: string) => void;
  onSkillRemove?: (skillName: string) => void;
}

const TechnologyStack: React.FC<TechnologyStackProps> = React.memo(({
  profileData,
  setProfileData,
  viewOnly = false,
  availableTechnologies = [],
  onSkillAdd,
  onSkillRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [isRemovingTech, setIsRemovingTech] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize filtered technologies to avoid recalculation on every render
  const filteredOptions = useMemo(() => {
    const alreadyAddedTechs = new Set(profileData.skills.map(s => s.name.toLowerCase()));
    
    if (searchTerm.trim() === '') {
      return availableTechnologies.filter(tech => 
        !alreadyAddedTechs.has(tech.toLowerCase())
      );
    }
    
    return availableTechnologies.filter(tech => 
      tech.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !alreadyAddedTechs.has(tech.toLowerCase())
    );
  }, [searchTerm, availableTechnologies, profileData.skills]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchVisible(false);
        setSearchTerm('');
        setError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when search becomes visible
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSkillAdd = useCallback(async (skillName: string) => {
    if (viewOnly || !skillName || isAddingTech) return;
    
    try {
      setIsAddingTech(true);
      setError(null);
      
      if (onSkillAdd) {
        // We don't do optimistic UI updates here since we need the backend
        // to resolve the technology ID first
        await onSkillAdd(skillName);
      }
      
      // Clear search and hide dropdown after adding
      setSearchTerm('');
      setIsSearchVisible(false);
    } catch (err) {
      console.error('Failed to add technology:', err);
      setError('Failed to add technology. Please try again.');
    } finally {
      setIsAddingTech(false);
    }
  }, [viewOnly, isAddingTech, onSkillAdd]);

  const handleSkillRemove = useCallback(async (skillName: string) => {
    if (viewOnly || isRemovingTech) return;
    
    try {
      setIsRemovingTech(skillName);
      setError(null);
      
      if (onSkillRemove) {
        await onSkillRemove(skillName);
      }
    } catch (err) {
      console.error('Failed to remove technology:', err);
      setError('Failed to remove technology. Please try again.');
    } finally {
      setIsRemovingTech(null);
    }
  }, [viewOnly, isRemovingTech, onSkillRemove]);

  const toggleSearchVisibility = useCallback(() => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Reset search term when opening
      setSearchTerm('');
      setError(null);
    }
  }, [isSearchVisible]);

  return (
    <div className="p-6 border-b border-[#BF4BF6]/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Technology Stack</h2>
        {!viewOnly && (
          <div className="relative inline-block w-full sm:w-64" ref={dropdownRef}>
            {/* Error message */}
            {error && (
              <div className="absolute -top-10 left-0 right-0 bg-red-100 text-red-600 p-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* Dropdown Button */}
            <button
              onClick={toggleSearchVisibility}
              disabled={isAddingTech}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg flex items-center justify-between focus:outline-none shadow-md disabled:opacity-70 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                {isAddingTech ? 'Adding...' : 'Add Technology'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Search Dropdown */}
            {isSearchVisible && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white/90 backdrop-blur-md border border-[#BF4BF6]/20 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-3 border-b border-[#BF4BF6]/20">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search technologies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={isAddingTech}
                      className="w-full pl-9 py-2 pr-3 text-sm bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 rounded-lg focus:outline-none focus:border-[#BF4BF6] disabled:opacity-70"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BF4BF6]" />
                  </div>
                </div>
                
                <div className="py-1">
                  {filteredOptions.map(skill => (
                    <div
                      key={skill}
                      className={`px-4 py-2.5 text-[#52007C] hover:bg-[#F6E6FF] cursor-pointer ${isAddingTech ? 'opacity-50' : ''}`}
                      onClick={() => !isAddingTech && handleSkillAdd(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                  
                  {filteredOptions.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      {searchTerm.trim() !== '' ? "No matching technologies found" : "No technologies available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {profileData.skills.length === 0 ? (
          <p className="text-[#52007C] p-4 bg-[#F6E6FF]/30 rounded-lg">
            {viewOnly ? 
              "No technologies added to this profile." : 
              "Click 'Add Technology' to add technologies to your profile."}
          </p>
        ) : (
          profileData.skills.map((skill) => (
            <div
              key={skill.id || skill.name}
              className="bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full px-4 py-2 relative group shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{skill.name}</span>
              </div>
              {!viewOnly && (
                <button
                  onClick={() => handleSkillRemove(skill.name)}
                  disabled={isRemovingTech === skill.name}
                  className={`absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full group-hover:flex items-center justify-center shadow-sm ${
                    isRemovingTech === skill.name ? 'flex opacity-50' : 'hidden'
                  }`}
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
});

TechnologyStack.displayName = 'TechnologyStack';

export default TechnologyStack;