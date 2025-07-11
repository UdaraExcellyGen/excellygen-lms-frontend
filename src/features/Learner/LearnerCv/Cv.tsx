// src/features/Learner/LearnerCv/Cv.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import ProfessionalSummary from './Components/ProfessionalSummary';
import ProjectsSection from './Components/ProjectsSection';
import CertificationsSection from './Components/CertificationsSection'; // UPDATED: Using CertificationsSection
import CVFooter from './Components/CVFooter';

import { getCvData, CvDataResponse } from '../../../api/cvApi';
import { UserData, ProfileProject, ProfileCertification } from './types/types'; // UPDATED: Import new types
import { learnerProjectApi } from '../../../api/services/learnerProjectService';
import { getUserCertificates } from '../../../api/services/Course/certificateService'; // ADDED: To get certificate data
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
                userIdToFetch = storedUserId;
            } else {
                toast.error('User ID not provided for CV.');
                setError('User ID is missing. Cannot load CV.');
                setLoading(false);
                return;
            }
        }

        const fetchCvData = async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                console.log(`CV.tsx: Fetching data for userId: ${id}`);
                // Fetch all data in parallel
                const [backendData, projectsData, certificatesData] = await Promise.all([
                    getCvData(id),
                    learnerProjectApi.getUserProjects(id),
                    getUserCertificates() // Fetches certificates for the current user
                ]);

                const mappedProjects: ProfileProject[] = projectsData.map(p => ({
                    title: p.title,
                    description: p.description,
                    technologies: p.technologies,
                    startDate: p.startDate,
                    completionDate: p.endDate,
                    status: p.status,
                }));
                
                // Map the fetched certificate data
                const mappedCertifications: ProfileCertification[] = certificatesData.map(c => ({
                    title: c.courseTitle,
                    issuer: 'ExcellyGen Academy', // Or another field from your DTO if available
                    completionDate: c.completionDate,
                }));

                const mappedData: UserData = {
                    personalInfo: backendData.personalInfo,
                    projects: mappedProjects,
                    certifications: mappedCertifications, // Using new certifications data
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
            fetchCvData(userIdToFetch);
        }
    }, [location.search]);

    const handleDownloadCV = async (): Promise<void> => {
        if (!cvData || !cvRef.current) {
            toast.error('CV data not loaded or CV not available for download.');
            return;
        }
        // ... (rest of the download function remains the same)
        try {
            const element = cvRef.current;
            const downloadButton = element.querySelector('.download-button') as HTMLElement;
            if (downloadButton) downloadButton.style.display = 'none';
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            if (downloadButton) downloadButton.style.display = '';
            const data = canvas.toDataURL('image/png');
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
    
    // FIX: This robustly handles the error state before attempting to render
    if (error) {
        return (
            <div className="min-h-screen bg-gray-200 p-6 flex flex-col items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading CV</h2>
                    <p className="text-red-500 mb-6">{error}</p>
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

    // FIX: This guard prevents rendering with null data, solving the crash.
    if (!cvData) {
        // This can be a loading indicator or null, as the main loading/error states are handled above
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-200 p-4">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden" style={{ width: '794px', minHeight: '1123px' }} ref={cvRef}>
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleDownloadCV}
                        className="download-button bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg text-white text-xs"
                    >
                        <Download size={14} />
                        Download CV
                    </button>
                </div>
                <div className="flex" style={{ minHeight: '1123px' }}>
                    <div className="w-1/3 bg-blue-900 text-white p-6">
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
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                                {cvData.personalInfo.name}
                            </h1>
                            <h2 className="text-sm text-blue-200 font-medium">
                                {cvData.personalInfo.position}
                            </h2>
                        </div>
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
                        <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3 bg-blue-800 text-white p-2 text-center">Technical Skills</h3>
                            <div>
                                {cvData.skills.map((skill, index) => (
                                    <div key={index} className="mb-2">
                                        <span className="cv-skill-item text-xs text-blue-100 font-medium">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-2/3 bg-gray-50 p-6 flex flex-col">
                        <ProfessionalSummary summary={cvData.personalInfo.summary} />
                        <ProjectsSection projects={cvData.projects} />
                        {/* UPDATED: Rendering the new certifications section */}
                        <CertificationsSection certifications={cvData.certifications} />
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