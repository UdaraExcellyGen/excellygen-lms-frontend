import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import { mockLearners } from '../../../data/mockLearners'; // Import mock data

// Import your existing components
import ProfileHeader from './components/ProfileHeader';
import ContactInfo from './components/ContactInfo';
import Bio from './components/Bio';
import RewardsBadges from './components/RewardsBadges';
import TechnologyStack from './components/TechnologyStack';
import ProjectsList from './components/ProjectsList';
import CertificationsList from './components/CertificationsList';

// Import your initial profile data
import { initialProfileData } from './data/initialProfileData';


const LearnerProfile = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [profileData, setProfileData] = useState(initialProfileData);

  // Load profile data based on ID parameter
  useEffect(() => {
    console.log("ID Parameter:", id); // Debug log
    
    if (id) {
      // This is someone else's profile - view only mode
      const foundLearner = mockLearners.find(learner => learner.id === id);
      if (foundLearner) {
        console.log("Found learner:", foundLearner); // Debug log
        setProfileData(foundLearner);
        setIsViewOnly(true);
      } else {
        console.log("Learner not found for ID:", id); // Debug log
      }
    } else {
      // This is the user's own profile - editable mode
      setIsViewOnly(false);
      setProfileData(initialProfileData);
    }
  }, [id]);

  // Event handlers
  const handleEdit = () => {
    if (!isViewOnly) setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Profile Header */}
          <ProfileHeader 
            profileData={profileData}
            isEditing={isEditing}
            setProfileData={setProfileData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            isViewOnly={isViewOnly}
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