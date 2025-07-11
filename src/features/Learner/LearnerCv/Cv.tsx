// src/features/Learner/LearnerCv/Cv.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import ProfessionalSummary from './Components/ProfessionalSummary';
import ProjectsSection from './Components/ProjectsSection';
import CoursesSection from './Components/CoursesSection';
import SkillsSection from './Components/SkillsSection';
import CVFooter from './Components/CVFooter';

import { getCvData, CvDataResponse } from '../../../api/cvApi';
import { UserData, ProfileProject } from './types/types';
import { learnerProjectApi } from '../../../api/services/learnerProjectService';
import { Download } from 'lucide-react';

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
                console.log(`CV.tsx: Fetching CV data for userId: ${id}`);
                const backendData: CvDataResponse = await getCvData(id);

                console.log(`CV.tsx: Fetching project data for userId: ${id}`);
                const projectsData = await learnerProjectApi.getUserProjects(id);

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
                    projects: mappedProjects,
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
            toast.error('Failed to download CV. See console for details.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-200 p-6 flex items-center justify-center">
                <div className="text-gray-600 text-xl animate-pulse">Loading CV...</div>
            </div>
        );
    }

    if (error || !cvData) {
        return (
            <div className="min-h-screen bg-gray-200 p-6 flex flex-col items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading CV</h2>
                    <p className="text-red-500 mb-6">{error || 'An unexpected error occurred and CV data could not be loaded.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 p-4">
            {/* A4 size container: 210mm x 297mm = 794px x 1123px at 96dpi */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden" style={{ width: '794px', minHeight: '1123px' }} ref={cvRef}>
                
                {/* Download Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleDownloadCV}
                        className="download-button bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg text-white text-xs"
                    >
                        <Download size={14} />
                        Download CV
                    </button>
                </div>

                {/* Main Flex Container */}
                <div className="flex" style={{ minHeight: '1123px' }}>
                    
                    {/* Left Sidebar - Dark Blue */}
                    <div className="w-1/3 bg-blue-900 text-white p-6">
                        {/* Profile Photo */}
                        <div className="mb-6">
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mx-auto">
                                {cvData.personalInfo.photo ? (
                                    <img 
                                        src={cvData.personalInfo.photo} 
                                        alt={cvData.personalInfo.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400 text-2xl font-bold">
                                            {cvData.personalInfo.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                                {cvData.personalInfo.name}
                            </h1>
                            <h2 className="text-sm text-blue-200 font-medium">
                                {cvData.personalInfo.position}
                            </h2>
                        </div>

                        {/* Contact Section */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3 bg-blue-800 text-white p-2 text-center">Contact</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-bold text-white mb-1">Phone</p>
                                    <p className="text-xs text-blue-100">{cvData.personalInfo.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white mb-1">Email</p>
                                    <p className="text-xs text-blue-100 break-all">{cvData.personalInfo.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white mb-1">Department</p>
                                    <p className="text-xs text-blue-100">{cvData.personalInfo.department}</p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Skills */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3 bg-blue-800 text-white p-2 text-center">Technical Skills</h3>
                            <div>
                                {cvData.skills.map((skill, index) => (
                                    <div key={index} className="mb-2">
                                        <span className="cv-skill-item text-xs text-blue-100 font-medium">
                                            {skill}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="w-2/3 bg-gray-50 p-6 flex flex-col">
                        <ProfessionalSummary summary={cvData.personalInfo.summary} />
                        <ProjectsSection projects={cvData.projects} />
                        <CoursesSection courses={cvData.courses} />
                        
                        {/* Footer at bottom */}
                        <div className="mt-auto">
                            <CVFooter />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CV;