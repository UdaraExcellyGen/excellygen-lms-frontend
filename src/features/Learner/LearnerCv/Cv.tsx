// src/features/Learner/LearnerCv/Cv.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import CVHeader from './Components/CVHeader';
import ProfessionalSummary from './Components/ProfessionalSummary';
import ProjectsSection from './Components/ProjectsSection';
import CoursesSection from './Components/CoursesSection';
import SkillsSection from './Components/SkillsSection';
import CVFooter from './Components/CVFooter';

import { getCvData, CvDataResponse } from '../../../api/cvApi';
import { UserData, ProfileProject } from './types/types';
import { learnerProjectApi } from '../../../api/services/learnerProjectService';

const CV: React.FC = () => {
    const [cvData, setCvData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cvRef = useRef<HTMLDivElement>(null);

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

        const fetchCvAndProjects = async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch CV Data (personal info, courses, skills)
                console.log(`CV.tsx: Fetching CV data for userId: ${id}`);
                const backendData: CvDataResponse = await getCvData(id);  // Assuming getCvData now returns only the personal info, courses, and skills

                // 2. Fetch Projects Data from learnerProjectApi
                console.log(`CV.tsx: Fetching project data for userId: ${id}`);
                const projectsData = await learnerProjectApi.getUserProjects(id);


                // 3. Map and Combine the Data
                const mappedProjects: ProfileProject[] = projectsData.map(p => ({
                    title: p.title,
                    description: p.description,
                    technologies: p.technologies,
                    startDate: p.startDate,
                    completionDate: p.endDate,
                    status: p.status,
                }));


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
                    projects: mappedProjects, // Use mapped projects fetched from learnerProjectApi
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
            fetchCvAndProjects(userIdToFetch);
        }
    }, [location.search]);

    const handleDownloadCV = async (): Promise<void> => {
        console.log('Downloading CV...');

        if (!cvData || !cvRef.current) {
            toast.error('CV data not loaded or CV not available for download.');
            return;
        }

        try {
            const element = cvRef.current;
            const downloadButton = element.querySelector('.download-button') as HTMLElement;

            if (downloadButton) {
                downloadButton.style.display = 'none';
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
            });
            const data = canvas.toDataURL('image/png');

            if (downloadButton) {
                downloadButton.style.display = '';
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(data);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`CV_${cvData.personalInfo.name}.pdf`);

            toast.success('CV downloaded successfully!');
        } catch (e: any) {
            console.error("Error downloading CV:", e);
            toast.error('Failed to download CV.  See console for details.');
        }
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
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden" ref={cvRef}>
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