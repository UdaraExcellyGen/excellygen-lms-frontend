// src/components/Sidebar/ViewLearnerProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { mockLearners } from '../../data/mockLearners';
// Assuming ProfileData from LearnerProfile/types is the correct one,
// as this component views profiles that should match that structure.
import { ProfileData } from '../../features/Learner/LearnerProfile/types/index';
import { FileText, Mail, Phone, Briefcase, Award } from 'lucide-react';

const ViewLearnerProfile: React.FC = () => {
  const { id: routeProfileId } = useParams<{ id: string }>(); // Renamed to avoid conflict with profile.id
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log("Loading profile for ID:", routeProfileId);
    setLoading(true);
    
    // Find learner by ID from mock data
    // In a real app, this would be an API call:
    // const fetchedProfile = await getUserProfile(routeProfileId); // Example API call
    // setProfile(fetchedProfile);
    const learner = mockLearners.find(l => l.id === routeProfileId);
    
    if (learner) {
      console.log("Found learner:", learner.name);
      // Ensure the 'learner' object matches the 'ProfileData' structure.
      // If mockLearners have a different structure, you might need to map fields.
      // For this example, we'll cast it, assuming it's compatible enough.
      setProfile(learner as unknown as ProfileData); 
    } else {
      console.error("Learner not found for ID:", routeProfileId);
      setProfile(null); // Ensure profile is null if not found
    }
    
    setLoading(false);
  }, [routeProfileId]);

  // Handler for the "View CV" button
  const handleViewCv = () => {
    if (profile && profile.id) {
      navigate(`/cv?userId=${profile.id}`);
    } else {
      // This case should ideally not be hit if the button is only shown when a profile is loaded.
      console.error("Cannot navigate to CV: Profile data or ID is not available.");
      // Optionally, inform the user with a toast message if appropriate.
      // import { toast } from 'react-hot-toast';
      // toast.error("Could not load CV, profile information is missing.");
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!profile) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-[#1B0A3F] mb-4">Profile Not Found</h2>
            <p className="text-gray-500 mb-6">The learner profile you're looking for could not be found.</p>
            <button
              onClick={() => navigate('/search-results')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Back to Search Results
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Filter completed items - ensure 'projects' and 'certifications' exist on profile
  const completedProjects = profile.projects?.filter(p => p.status === 'Completed') || [];
  const completedCertifications = profile.certifications?.filter(c => c.status === 'Completed') || [];
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between border-b gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center shadow-lg">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B0A3F] mb-1">{profile.name}</h1>
                {/* Use profile.role (primary role) or profile.jobRole (specific job title) */}
                <p className="text-lg text-[#52007C]">{profile.role || profile.jobRole}</p>
                {profile.id && <p className="text-sm text-gray-500 mt-1">ID: {profile.id}</p>}
              </div>
            </div>
            <div>
              {/* MODIFIED onClick HANDLER FOR CV BUTTON */}
              <button
                onClick={handleViewCv} 
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-lg inline-flex items-center gap-2 hover:from-[#52007C] hover:to-[#A030D6] transition-colors shadow-md"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">CV</span>
              </button>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="p-4 md:p-8 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#BF4BF6]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-[#1B0A3F] font-medium truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-[#BF4BF6]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-[#1B0A3F] font-medium truncate">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-[#BF4BF6]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="text-[#1B0A3F] font-medium truncate">{profile.department}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <div className="p-4 sm:p-8 border-b">
            <h2 className="text-xl font-semibold text-[#1B0A3F] mb-3">About</h2>
            {/* Ensure profile.bio exists, or provide a fallback */}
            <p className="text-[#1B0A3F] leading-relaxed">{profile.about || 'No bio available.'}</p>
          </div>
          
          {/* Skills */}
          <div className="p-4 sm:p-8 border-b bg-white">
            <h2 className="text-xl font-semibold text-[#1B0A3F] mb-6">Technology Stack</h2>
            <div className="flex flex-wrap gap-3">
              {(profile.skills && profile.skills.length > 0) ? (
                profile.skills.map((skill) => (
                  <div
                    key={skill.name} // Assuming skill has a unique 'name' or 'id'
                    className="bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No technologies added to this profile.</p>
              )}
            </div>
          </div>
          
          {/* Projects */}
          <div className="p-4 sm:p-8 border-b">
            <h2 className="text-xl font-semibold text-[#1B0A3F] mb-6">Projects</h2>
            <div className="grid gap-6">
              {completedProjects.length === 0 ? (
                <p className="text-gray-500 text-sm">No completed projects found.</p>
              ) : (
                completedProjects.map((project, index) => (
                  <div key={project.id || index} className="bg-[#F6E6FF] rounded-xl p-4 sm:p-6"> {/* Use project.id if available */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                      <div>
                        <h3 className="text-lg font-medium text-[#1B0A3F]">{project.name}</h3>
                        <p className="text-[#52007C] text-sm mt-1">{project.role}</p>
                      </div>
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 bg-[#52007C] text-white">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[#1B0A3F] mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-[#52007C]">
                      <span>{project.startDate}</span>
                      {project.endDate && (
                        <>
                          <span> - </span>
                          <span>{project.endDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Certifications */}
          <div className="p-4 sm:p-8">
            <h2 className="text-xl font-semibold text-[#1B0A3F] mb-4 md:mb-6">Certifications</h2>
            <div className="grid gap-3 md:gap-4">
              {completedCertifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No completed certifications found.</p>
              ) : (
                completedCertifications.map((cert) => (
                  <div key={cert.id || cert.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#F6E6FF] rounded-lg"> {/* Use cert.id if available */}
                    <div className="h-12 w-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-[#BF4BF6]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#1B0A3F] font-medium mb-1">{cert.name}</h3>
                      <p className="text-sm text-[#52007C]">Issued: {cert.issueDate}</p>
                    </div>
                    <span className="mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-medium bg-[#52007C] text-white">
                      {cert.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Back button */}
          <div className="p-4 sm:p-8 border-t">
            <button
              onClick={() => navigate('/search-results')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Back to Search Results
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewLearnerProfile;