import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Import components
import ProfileHeader from './components/ProfileHeader';
import ContactInfo from './components/ContactInfo';
import Bio from './components/Bio';
import RewardsBadges from './components/RewardsBadges';
import TechnologyStack from './components/TechnologyStack';
import ProjectsList from './components/ProjectsList';
import CertificationsList from './components/CertificationsList';

// Import services
import { getUserProfile, updateUserProfile, uploadUserAvatar, deleteUserAvatar } from '../../../api/services/LearnerProfile/userProfileService';
import { getBadgesAndRewards } from '../../../api/services/Learner/badgesAndRewardsService';
import { getUserTechnologies, addUserTechnology, removeUserTechnology, getAvailableTechnologies } from '../../../api/services/LearnerProfile/userTechnologyService';
import { getUserProjects } from '../../../api/services/LearnerProfile/userProjectService';
import { getAllCertificates } from '../../../api/services/Course/certificateService';

// Import types
import { ProfileData } from './types';

const LearnerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isTechOperationInProgress, setIsTechOperationInProgress] = useState(false);

  const isViewOnly = !!id;

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    const userJson = localStorage.getItem('user');
    const loggedInUser = userJson ? JSON.parse(userJson) : null;
    const userIdToFetch = id || loggedInUser?.id;

    if (!userIdToFetch) {
        toast.error('Could not determine user profile to load.');
        setIsLoading(false);
        return;
    }

    try {
        const [profileResult, badgesResult, projectsResult, certsResult, techResult] = await Promise.allSettled([
            getUserProfile(userIdToFetch),
            getBadgesAndRewards(),
            getUserProjects(userIdToFetch),
            getAllCertificates(),
            getUserTechnologies(userIdToFetch)
        ]);

        let baseProfile: Omit<ProfileData, 'skills' | 'projects' | 'certifications' | 'rewards'> | null = null;
        if (profileResult.status === 'fulfilled') {
            const p = profileResult.value;
            baseProfile = { id: p.id, name: p.name, email: p.email, phone: p.phone, department: p.department, role: p.jobRole, about: p.about, avatar: p.avatar, roles: p.roles };
        } else {
            throw new Error('Could not load essential profile information.');
        }

        const badges = badgesResult.status === 'fulfilled' ? badgesResult.value : [];
        const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
        const certs = certsResult.status === 'fulfilled' ? certsResult.value : [];
        const skills = techResult.status === 'fulfilled' ? techResult.value : [];

        const claimedBadges = badges.filter(b => b.isClaimed);
        const thisMonthBadges = claimedBadges.filter(b => b.dateEarned && new Date(b.dateEarned).getMonth() === new Date().getMonth()).length;

        const finalProfileData = {
            ...baseProfile,
            skills,
            projects,
            certifications: certs.map(c => ({ id: String(c.id), name: c.type === 'internal' ? c.courseTitle : c.title, issuingOrganization: c.type === 'internal' ? 'ExcellyGen LMS' : c.issuer, issueDate: new Date(c.completionDate || c.dateEarned || '').toLocaleDateString(), status: 'Completed', imageUrl: c.imageUrl, description: c.description })),
            rewards: {
                totalBadges: claimedBadges.length,
                thisMonth: thisMonthBadges,
                recentBadges: claimedBadges.sort((a, b) => new Date(b.dateEarned!).getTime() - new Date(a.dateEarned!).getTime()).slice(0, 10)
            }
        };
        
        setProfileData(finalProfileData);
        setOriginalProfileData(finalProfileData);

        if (!isViewOnly) {
          getAvailableTechnologies(userIdToFetch).then(techs => setAvailableTechnologies(techs.map(t => t.name))).catch(e => console.error("Could not fetch available techs", e));
        }

    } catch (error: any) {
        setLoadingError(error.message || 'An unexpected error occurred.');
        toast.error('Failed to load profile.');
    } finally {
        setIsLoading(false);
    }
  }, [id, isViewOnly]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
      setIsEditing(false);
      setProfileData(originalProfileData);
  };
  
  const handleSave = async () => {
    if (!profileData) return;
    setIsSaving(true);
    try {
      const { id, role, about } = profileData;
      await updateUserProfile(id, { jobRole: role, about });
      setIsEditing(false);
      setOriginalProfileData(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) { toast.error('Failed to update profile.'); } 
    finally { setIsSaving(false); }
  };
  
  const handleAvatarUpload = async (file: File) => {
    if (!profileData) return;
    const toastId = toast.loading('Uploading avatar...');
    try {
      const avatarUrl = await uploadUserAvatar(profileData.id, file);
      const updatedProfile = { ...profileData, avatar: avatarUrl };
      setProfileData(updatedProfile);
      setOriginalProfileData(updatedProfile);
      toast.success('Avatar uploaded successfully', { id: toastId });
    } catch (error) { toast.error('Failed to upload avatar', { id: toastId }); }
  };

  const handleAvatarDelete = async () => {
    if (!profileData) return;
    const toastId = toast.loading('Deleting avatar...');
    try {
      await deleteUserAvatar(profileData.id);
      const updatedProfile = { ...profileData, avatar: undefined };
      setProfileData(updatedProfile);
      setOriginalProfileData(updatedProfile);
      toast.success('Avatar deleted successfully', { id: toastId });
    } catch (error) { toast.error('Failed to delete avatar', { id: toastId }); }
  };
  
  const handleSkillAdd = async (skillName: string) => {
    if (!profileData || isTechOperationInProgress) return;
    setIsTechOperationInProgress(true);
    try {
      const addedTechnology = await addUserTechnology(profileData.id, skillName);
      setProfileData(p => p ? { ...p, skills: [...p.skills, addedTechnology] } : null);
      setOriginalProfileData(p => p ? { ...p, skills: [...p.skills, addedTechnology] } : null);
      toast.success(`Added ${skillName}`);
    } catch (error) { toast.error(`Failed to add ${skillName}`); } 
    finally { setIsTechOperationInProgress(false); }
  };
  
  const handleSkillRemove = async (skillId: string) => {
    if (!profileData || isTechOperationInProgress) return;
    setIsTechOperationInProgress(true);
    try {
      await removeUserTechnology(profileData.id, skillId);
      const updatedSkills = profileData.skills.filter(s => s.id !== skillId);
      setProfileData(p => p ? { ...p, skills: updatedSkills } : null);
      setOriginalProfileData(p => p ? { ...p, skills: updatedSkills } : null);
      toast.success('Technology removed');
    } catch (error) { toast.error('Failed to remove technology'); } 
    finally { setIsTechOperationInProgress(false); }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-96 text-white text-lg">
                <Loader2 className="animate-spin mr-3" size={32}/> Loading Profile...
            </div>
          ) : loadingError || !profileData ? (
            <div className="text-center py-20 text-red-300 bg-red-500/10 rounded-lg">
                <p>{loadingError}</p>
                <button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-red-400 text-white rounded-lg">Retry</button>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                  <h1 className="text-3xl font-bold text-white font-unbounded">Learner Profile</h1>
                  {!isViewOnly && (
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                          {isEditing ? (
                              <>
                                  <button onClick={handleCancel} disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium">Cancel</button>
                                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center font-medium">{isSaving && <Loader2 className="animate-spin mr-2" size={16}/>} Save Changes</button>
                              </>
                          ) : (
                              <>
                                  <button onClick={handleEdit} className="px-5 py-2.5 rounded-lg bg-white/20 text-white hover:bg-white/30 font-medium">Edit Profile</button>
                                  <button onClick={() => navigate(`/cv?userId=${profileData.id}`)} className="px-5 py-2.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-medium">View CV</button>
                              </>
                          )}
                      </div>
                  )}
              </div>
            
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-4 xl:col-span-3 lg:border-r border-gray-200/80 p-6 space-y-6">
                    <ProfileHeader profileData={profileData} isEditing={isEditing} onAvatarUpload={handleAvatarUpload} onAvatarDelete={handleAvatarDelete}/>
                    <ContactInfo profileData={profileData} />
                    <Bio profileData={profileData} isEditing={isEditing} setProfileData={setProfileData} />
                  </div>
                  
                  <div className="lg:col-span-8 xl:col-span-9 p-6 space-y-8">
                    <TechnologyStack profileData={profileData} isEditing={isEditing} onSkillRemove={handleSkillRemove} onSkillAdd={handleSkillAdd} availableTechnologies={availableTechnologies} isTechOperationInProgress={isTechOperationInProgress}/>
                    <RewardsBadges profileData={profileData} />
                    <ProjectsList projects={profileData.projects} />
                    <CertificationsList certifications={profileData.certifications} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LearnerProfile;