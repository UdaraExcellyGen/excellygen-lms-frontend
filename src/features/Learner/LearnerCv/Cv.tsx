// src/features/Learner/LearnerCv/Cv.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import CVHeader from './Components/CVHeader';
import ProfessionalSummary from './Components/ProfessionalSummary';
import ProjectsSection from './Components/ProjectsSection';
import CoursesSection from './Components/CoursesSection';
import SkillsSection from './Components/SkillsSection';
import CVFooter from './Components/CVFooter';

import { getCvData, CvDataResponse } from '../../../api/cvApi'; // Adjusted path
import { UserData } from './types/types'; 

const CV: React.FC = () => {
  const [cvData, setCvData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userIdFromQuery = queryParams.get('userId');
    let userIdToFetch = userIdFromQuery;

    if (!userIdToFetch) {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            console.warn("CV.tsx: userId not found in query params, using userId from localStorage as a fallback.");
            userIdToFetch = storedUserId;
        } else {
            toast.error('User ID not provided for CV.');
            setError('User ID is missing. Cannot load CV.');
            setLoading(false);
            return;
        }
    }

    const fetchCv = async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log(`CV.tsx: Fetching CV data for userId: ${id}`);
        const backendData: CvDataResponse = await getCvData(id);
        
        const mappedData: UserData = {
            personalInfo: {
                name: backendData.personalInfo.name,
                position: backendData.personalInfo.position,
                email: backendData.personalInfo.email,
                phone: backendData.personalInfo.phone,
                department: backendData.personalInfo.department,
                photo: backendData.personalInfo.photo,
                summary: backendData.personalInfo.summary,
            },
            projects: backendData.projects.map(p => ({
                title: p.title,
                description: p.description,
                technologies: p.technologies,
                startDate: p.startDate,
                completionDate: p.completionDate,
                status: p.status,
            })),
            courses: backendData.courses.map(c => ({
                title: c.title,
                provider: c.provider,
                completionDate: c.completionDate,
                duration: c.duration,
                certificate: c.certificate,
            })),
            skills: backendData.skills,
        };
        setCvData(mappedData);
        console.log('CV.tsx: CV Data loaded and mapped:', mappedData);
      } catch (err: any) {
        console.error("CV.tsx: Failed to fetch CV data:", err);
        const errorMessage = err.message || 'Failed to load CV data. Please try again later.';
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userIdToFetch) {
        fetchCv(userIdToFetch);
    }
  }, [location.search]); 

  const handleDownloadCV = (): void => {
    console.log('Downloading CV...');
    toast.info('CV download functionality is not yet implemented.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B0A3F] to-[#52007C] p-6 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading CV...</div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B0A3F] to-[#52007C] p-6 flex flex-col items-center justify-center">
        <div className="text-center bg-white/10 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading CV</h2>
          <p className="text-red-200 mb-6">{error || 'An unexpected error occurred and CV data could not be loaded.'}</p>
          <button
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B0A3F] to-[#52007C] p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <CVHeader 
          personalInfo={cvData.personalInfo} 
          onDownloadCV={handleDownloadCV} 
        />
        <div className="p-8 space-y-8">
          <ProfessionalSummary summary={cvData.personalInfo.summary} />
          <ProjectsSection projects={cvData.projects} />
          <CoursesSection courses={cvData.courses} />
          <SkillsSection skills={cvData.skills} />
        </div>
        <CVFooter />
      </div>
    </div>
  );
};

export default CV;