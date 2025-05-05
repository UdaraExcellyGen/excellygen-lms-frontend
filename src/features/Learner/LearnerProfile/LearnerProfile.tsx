import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import { toast } from 'react-hot-toast';

// Import components
import ProfileHeader from './components/ProfileHeader';
import ContactInfo from './components/ContactInfo';
import Bio from './components/Bio';
import RewardsBadges from './components/RewardsBadges';
import TechnologyStack from './components/TechnologyStack';
import ProjectsList from './components/ProjectsList';
import CertificationsList from './components/CertificationsList';

// Import services
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '../../../api/services/LearnerProfile/userProfileService';
import { getUserBadgeSummary } from '../../../api/services/LearnerProfile/userBadgeService';
import { getUserTechnologies, addUserTechnology, removeUserTechnology, getAvailableTechnologies } from '../../../api/services/LearnerProfile/userTechnologyService';
import { getUserProjects } from '../../../api/services/LearnerProfile/userProjectService';
import { getUserCertifications } from '../../../api/services/LearnerProfile/userCertificationService';

// Import types
import { ProfileData } from './types';

const LearnerProfile = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingErrors, setLoadingErrors] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [technologyOperation, setTechnologyOperation] = useState<{
    type: 'add' | 'remove' | null;
    name: string | null;
    inProgress: boolean;
  }>({ type: null, name: null, inProgress: false });

  // Determine if viewing own profile or someone else's
  useEffect(() => {
    console.log("ID Parameter:", id);
    
    if (id) {
      // This is someone else's profile - view only mode
      setIsViewOnly(true);
    } else {
      // This is the user's own profile - editable mode
      setIsViewOnly(false);
    }
    
    // Fetch profile data
    fetchProfileData();
  }, [id]);

  // Fetch technologies separately to avoid UI flashes
  const fetchTechnologies = useCallback(async (userId: string) => {
    try {
      // Get user technologies
      const technologies = await getUserTechnologies(userId);
      
      // Update only the skills part of profile data
      setProfileData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          skills: technologies.map(tech => ({ name: tech.name, id: tech.id }))
        };
      });
      
      // If not in view-only mode, also fetch available technologies
      if (!isViewOnly) {
        try {
          const availableTechs = await getAvailableTechnologies(userId);
          setAvailableTechnologies(availableTechs.map(tech => tech.name));
        } catch (error) {
          console.error('Error fetching available technologies:', error);
          // Don't show error toast here to avoid too many notifications
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error fetching technologies:', error);
      return false;
    }
  }, [isViewOnly]);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setLoadingErrors({});
    
    try {
      // First try URL parameter
      let userId = id || '';
      
      // If no URL parameter, try localStorage
      if (!userId) {
        userId = localStorage.getItem('userId') || '';
        console.log("Using userId from localStorage:", userId);
      }
      
      // If still no userId, try to get from user object
      if (!userId) {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            if (user && user.id) {
              userId = user.id;
              console.log("Found userId in user object:", userId);
              localStorage.setItem('userId', userId);
            }
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }
      
      if (!userId) {
        toast.error('User ID not found');
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching profile for user ID:", userId);
      
      // Default empty data structure to handle partial failures
      const defaultProfileData: ProfileData = {
        id: userId,
        name: 'User',
        email: '',
        phone: '',
        department: '',
        role: '',
        about: '',
        skills: [],
        certifications: [],
        projects: [],
        rewards: {
          totalBadges: 0,
          thisMonth: 0,
          recentBadges: []
        }
      };
      
      let newProfileData: ProfileData = { ...defaultProfileData };
      const errors: Record<string, boolean> = {};
      
      // Get user profile
      try {
        console.log(`Making API request to /user-profile/${userId}`);
        const profileResponse = await getUserProfile(userId);
        console.log("Profile response received:", profileResponse);
        
        newProfileData = {
          ...newProfileData,
          id: profileResponse.id,
          name: profileResponse.name,
          email: profileResponse.email,
          phone: profileResponse.phone,
          department: profileResponse.department,
          role: profileResponse.jobRole || '',
          about: profileResponse.about || '',
          avatar: profileResponse.avatar,
          roles: profileResponse.roles
        };
      } catch (error) {
        console.error('Error fetching user profile:', error);
        errors.profile = true;
      }
      
      // Get badge summary
      try {
        const badgeSummary = await getUserBadgeSummary(userId);
        newProfileData.rewards = {
          totalBadges: badgeSummary.totalBadges,
          thisMonth: badgeSummary.thisMonth,
          recentBadges: badgeSummary.recentBadges
        };
      } catch (error) {
        console.error('Error fetching badge summary:', error);
        errors.badges = true;
      }
      
      // Get technologies using specialized function
      try {
        // Set initial skills array
        setProfileData({
          ...newProfileData,
          skills: [] // Set empty skills initially to avoid UI glitches
        });
        
        const techSuccess = await fetchTechnologies(userId);
        if (!techSuccess) {
          errors.technologies = true;
        }
      } catch (error) {
        console.error('Error fetching technologies:', error);
        errors.technologies = true;
      }
      
      // Get projects
      try {
        const projects = await getUserProjects(userId);
        
        // Update profile data with projects
        setProfileData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            projects: projects
          };
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
        errors.projects = true;
      }
      
      // Get certifications
      try {
        const certifications = await getUserCertifications(userId);
        
        // Update profile data with certifications
        setProfileData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            certifications: certifications
          };
        });
      } catch (error) {
        console.error('Error fetching certifications:', error);
        errors.certifications = true;
      }
      
      // Set profile base data if not already set
      setProfileData(prevData => {
        if (!prevData) return newProfileData;
        return prevData;
      });
      
      // Update loading errors state
      setLoadingErrors(errors);
      
      // Show toast for partial failures
      if (Object.keys(errors).length > 0) {
        toast.error('Some profile data could not be loaded completely');
      }
    } catch (error) {
      console.error('Error in fetch profile operation:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchTechnologies]);

  // Optimized function to add a technology with better error handling
  const handleSkillAdd = useCallback(async (skillName: string) => {
    if (!profileData || technologyOperation.inProgress) return;
    
    try {
      // Set technology operation state
      setTechnologyOperation({ type: 'add', name: skillName, inProgress: true });
      
      const userId = id || localStorage.getItem('userId') || '';
      
      // Don't immediately update UI - wait for successful API call
      console.log(`Adding technology: ${skillName} for user: ${userId}`);
      
      try {
        // Our updated service will handle the conversion from technology name to ID
        const addedTechnology = await addUserTechnology(userId, skillName);
        
        // Only update UI after successful API call
        setProfileData(prevData => {
          if (!prevData) return prevData;
          
          // Check if already exists to prevent duplicates
          if (prevData.skills.some(s => s.name === addedTechnology.name)) {
            return prevData;
          }
          
          // Update with the data from the API to ensure consistency
          return {
            ...prevData,
            skills: [
              ...prevData.skills, 
              { name: addedTechnology.name, id: addedTechnology.id }
            ]
          };
        });
        
        toast.success(`Added ${skillName} to your technologies`);
      } catch (error) {
        console.error('Error adding technology:', error);
        toast.error('Failed to add technology');
      }
    } finally {
      // Reset technology operation state
      setTechnologyOperation({ type: null, name: null, inProgress: false });
    }
  }, [id, profileData, technologyOperation]);

  // Optimized function to remove a technology with better error handling
  const handleSkillRemove = useCallback(async (skillName: string) => {
    if (!profileData || technologyOperation.inProgress) return;
    
    try {
      // Set technology operation state
      setTechnologyOperation({ type: 'remove', name: skillName, inProgress: true });
      
      const userId = id || localStorage.getItem('userId') || '';
      const skill = profileData.skills.find(s => s.name === skillName);
      
      if (!skill || !skill.id) {
        toast.error(`Cannot remove ${skillName}: ID not found`);
        setTechnologyOperation({ type: null, name: null, inProgress: false });
        return;
      }
      
      // Store the skill info before removal for recovery if needed
      const skillToRestore = { ...skill };
      
      // Optimistic UI update - remove immediately for better UX
      setProfileData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          skills: prevData.skills.filter(s => s.name !== skillName)
        };
      });
      
      try {
        // Attempt to remove on the backend
        await removeUserTechnology(userId, skill.id);
        toast.success(`Removed ${skillName} from your technologies`);
      } catch (error) {
        // If removal fails, restore the skill to the UI
        console.error('Error removing technology:', error);
        toast.error('Failed to remove technology');
        
        // Restore the removed skill
        setProfileData(prevData => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            skills: [...prevData.skills, skillToRestore]
          };
        });
      }
    } catch (error) {
      console.error('Error in skill removal process:', error);
      toast.error('An unexpected error occurred');
    } finally {
      // Reset technology operation state
      setTechnologyOperation({ type: null, name: null, inProgress: false });
    }
  }, [id, profileData, technologyOperation]);

  // Event handlers
  const handleEdit = useCallback(() => {
    if (!isViewOnly) setIsEditing(true);
  }, [isViewOnly]);
  
  const handleSave = useCallback(async () => {
    if (!profileData) return;
    
    setIsSaving(true);
    try {
      const userId = id || localStorage.getItem('userId') || '';
      
      await updateUserProfile(userId, {
        jobRole: profileData.role,
        about: profileData.about
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
      await fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [id, profileData, fetchProfileData]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    fetchProfileData(); // Revert to original data
  }, [fetchProfileData]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!profileData) return;
    
    try {
      const userId = id || localStorage.getItem('userId') || '';
      
      // Show loading state
      const toastId = toast.loading('Uploading avatar...');
      
      const avatarUrl = await uploadUserAvatar(userId, file);
      
      // Update profile data with new avatar
      setProfileData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          avatar: avatarUrl
        };
      });
      
      // ADD THIS CODE: Update user data in localStorage
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          userData.avatar = avatarUrl;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Updated user avatar in localStorage:', avatarUrl);
        }
      } catch (e) {
        console.error('Error updating user data in localStorage:', e);
      }
      
      toast.dismiss(toastId);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.dismiss();
      toast.error('Failed to upload avatar');
    }
  }, [id, profileData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8">
            <p className="text-center">Loading profile data...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!profileData) {
    return (
      <Layout>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8">
            <p className="text-center text-red-500">Failed to load profile data. Please try again.</p>
            <div className="flex justify-center mt-4">
              <button 
                onClick={fetchProfileData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Error Notifications */}
          {Object.keys(loadingErrors).length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Some profile data couldn't be loaded. You may see partial information.
                  </p>
                  <button
                    onClick={fetchProfileData}
                    className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <ProfileHeader 
            profileData={profileData}
            isEditing={isEditing}
            setProfileData={setProfileData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            isViewOnly={isViewOnly}
            onAvatarUpload={handleAvatarUpload}
            isSaving={isSaving}
          />

          {/* Contact Information */}
          <ContactInfo 
            profileData={profileData}
            isEditing={isEditing && !isViewOnly}
            setProfileData={setProfileData}
          />

          {/* Bio */}
          <Bio 
            profileData={profileData}
            isEditing={isEditing && !isViewOnly}
            setProfileData={setProfileData}
          />

          {/* Rewards & Badges */}
          <RewardsBadges profileData={profileData} />

          {/* Skills Section */}
          <TechnologyStack 
            profileData={profileData}
            setProfileData={setProfileData}
            viewOnly={isViewOnly}
            availableTechnologies={availableTechnologies}
            onSkillAdd={handleSkillAdd}
            onSkillRemove={handleSkillRemove}
          />

          {/* Projects Section */}
          <ProjectsList 
            profileData={profileData} 
            viewOnly={isViewOnly}
          />

          {/* Certifications */}
          <CertificationsList 
            profileData={profileData} 
            viewOnly={isViewOnly}
          />

          {/* Back button (only shown in view-only mode) */}
          {isViewOnly && (
            <div className="p-4 sm:p-8 border-t">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                Back to Search Results
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LearnerProfile;