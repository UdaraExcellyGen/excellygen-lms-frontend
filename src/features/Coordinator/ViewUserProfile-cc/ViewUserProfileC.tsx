import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

// Re-use components from LearnerProfile for a consistent UI
import ProfileHeader from '../../Learner/LearnerProfile/components/ProfileHeader';
import ContactInfo from '../../Learner/LearnerProfile/components/ContactInfo';
import Bio from '../../Learner/LearnerProfile/components/Bio';
import RewardsBadges from '../../Learner/LearnerProfile/components/RewardsBadges';
import TechnologyStack from '../../Learner/LearnerProfile/components/TechnologyStack';
import ProjectsList from '../../Learner/LearnerProfile/components/ProjectsList';
import CertificationsList from '../../Learner/LearnerProfile/components/CertificationsList';

// Re-use the main data type from LearnerProfile
import { ProfileData } from '../../Learner/LearnerProfile/types';

// Import all necessary API services
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import { getBadgesForUser } from '../../../api/services/Learner/badgesAndRewardsService';
import { getUserTechnologies } from '../../../api/services/LearnerProfile/userTechnologyService';
import { getUserProjects } from '../../../api/services/LearnerProfile/userProjectService';
import { getCertificatesForUser, getExternalCertificatesForUser } from '../../../api/services/Course/certificateService';

const ViewUserProfileC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);

    if (!id) {
      toast.error('User ID not found.');
      setLoadingError('User ID is missing from the URL.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all profile data in parallel for performance
      const [
        profileResult,
        badgesResult,
        projectsResult,
        internalCertsResult,
        externalCertsResult,
        techResult
      ] = await Promise.allSettled([
        getUserProfile(id),
        getBadgesForUser(id),
        getUserProjects(id),
        getCertificatesForUser(id),
        getExternalCertificatesForUser(id),
        getUserTechnologies(id)
      ]);

      // The core profile information is essential.
      if (profileResult.status === 'rejected' || !profileResult.value) {
        throw new Error('Could not load essential profile information for this user.');
      }
      const baseProfile = profileResult.value;

      // Safely process other data, with empty arrays as fallbacks
      const badges = badgesResult.status === 'fulfilled' ? badgesResult.value : [];
      const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
      const internalCerts = internalCertsResult.status === 'fulfilled' ? (internalCertsResult.value as any[]) : [];
      const externalCerts = externalCertsResult.status === 'fulfilled' ? (externalCertsResult.value as any[]) : [];
      const skills = techResult.status === 'fulfilled' ? techResult.value : [];
      
      const claimedBadges = badges.filter(b => b.isClaimed);

      // Combine all fetched data into a single object for the UI
      const finalProfileData: ProfileData = {
        id: baseProfile.id,
        name: baseProfile.name,
        email: baseProfile.email,
        phone: baseProfile.phone,
        department: baseProfile.department,
        role: baseProfile.jobRole,
        about: baseProfile.about,
        avatar: baseProfile.avatar,
        roles: baseProfile.roles,
        skills,
        projects,
        certifications: [
            ...internalCerts.map(c => ({ id: c.id.toString(), name: c.courseTitle, issuingOrganization: 'ExcellyGen LMS', issueDate: new Date(c.completionDate).toLocaleDateString(), status: 'Completed', imageUrl: c.imageUrl, description: c.description })),
            ...externalCerts.map(c => ({ id: c.id, name: c.title, issuingOrganization: c.issuer, issueDate: new Date(c.completionDate).toLocaleDateString(), status: 'Completed', imageUrl: c.imageUrl, description: c.description }))
        ],
        rewards: {
            totalBadges: claimedBadges.length,
            thisMonth: claimedBadges.filter(b => b.dateEarned && new Date(b.dateEarned).getMonth() === new Date().getMonth()).length,
            recentBadges: claimedBadges.sort((a, b) => new Date(b.dateEarned!).getTime() - new Date(a.dateEarned!).getTime()).slice(0, 10)
        }
      };
      
      setProfileData(finalProfileData);
    } catch (error: any) {
      setLoadingError(error.message || 'An unexpected error occurred while loading the profile.');
      toast.error(error.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 font-nunito">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button
                onClick={() => navigate(-1)} // Go back to the previous page
                className="inline-flex items-center text-white/80 hover:text-white transition-colors group font-semibold"
            >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Learner List Page
            </button>
            
            {/* --- THIS IS THE NEW BUTTON --- */}
            {!isLoading && profileData && (
                 <button 
                    onClick={() => navigate(`/cv?userId=${profileData.id}`)} 
                    className="px-5 py-2.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-medium shadow-md transition-all hover:shadow-lg"
                >
                    View CV
                </button>
            )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-96 text-white text-lg">
            <Loader2 className="animate-spin mr-3" size={32}/> Loading Profile...
          </div>
        ) : loadingError || !profileData ? (
          <div className="text-center py-20 text-red-300 bg-red-500/10 rounded-lg">
            <p className="font-semibold text-xl">Error Loading Profile</p>
            <p className="mt-2">{loadingError}</p>
            <button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors">Retry</button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white font-unbounded mb-8">
              {profileData.name}'s Profile
            </h1>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-4 xl:col-span-3 lg:border-r border-gray-200/80 p-6 space-y-6">
                  <ProfileHeader profileData={profileData} isEditing={false} onAvatarUpload={() => {}} onAvatarDelete={() => {}} />
                  <ContactInfo profileData={profileData} />
                  <Bio profileData={profileData} isEditing={false} setProfileData={() => {}} />
                </div>
                <div className="lg:col-span-8 xl:col-span-9 p-6 space-y-8">
                  <TechnologyStack profileData={profileData} isEditing={false} onSkillRemove={() => {}} onSkillAdd={() => {}} availableTechnologies={[]} isTechOperationInProgress={false}/>
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
  );
};

export default ViewUserProfileC;