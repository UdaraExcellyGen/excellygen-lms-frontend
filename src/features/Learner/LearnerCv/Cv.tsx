import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

// Component Imports
import ProfessionalSummary from './Components/ProfessionalSummary';
import ProjectsSection from './Components/ProjectsSection';
import CertificationsSection from './Components/CertificationsSection';
import CVFooter from './Components/CVFooter';

// Type Imports
import { UserData, ProfileProject, ProfileCertification } from './types/types';

// Service Imports
import { getUserProfile } from '../../../api/services/LearnerProfile/userProfileService';
import { getUserProjects } from '../../../api/services/LearnerProfile/userProjectService';
import { getCertificatesForUser, getExternalCertificatesForUser } from '../../../api/services/Course/certificateService';
import { getUserTechnologies } from '../../../api/services/LearnerProfile/userTechnologyService';
// FIX: Importing the new proxy service
import { getProxiedImageBlob } from '../../../api/services/common/proxyService';

const CV: React.FC = () => {
    const [cvData, setCvData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cvRef = useRef<HTMLDivElement>(null);
    const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate(); 

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userIdToFetch = queryParams.get('userId');

        if (!userIdToFetch) {
            toast.error('User ID not provided for CV.');
            setError('User ID is missing. Cannot load CV.');
            setLoading(false);
            return;
        }

        const fetchCvData = async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                const [
                    profileData, projectsData, internalCertsData,
                    externalCertsData, technologiesData
                ] = await Promise.all([
                    getUserProfile(id), getUserProjects(id), getCertificatesForUser(id),
                    getExternalCertificatesForUser(id), getUserTechnologies(id)
                ]);

                const mappedProjects: ProfileProject[] = projectsData.map(p => ({
                    title: p.name, description: p.description, technologies: p.technologies,
                    startDate: p.startDate, completionDate: p.endDate, status: p.status,
                }));

                const mappedCertifications: ProfileCertification[] = [
                    ...internalCertsData.map((c: any) => ({
                        title: c.courseTitle, issuer: 'ExcellyGen LMS', completionDate: c.completionDate,
                    })),
                    ...externalCertsData.map((c: any) => ({
                        title: c.title, issuer: c.issuer, completionDate: c.completionDate,
                    }))
                ];

                const finalCvData: UserData = {
                    personalInfo: {
                        name: profileData.name, email: profileData.email, phone: profileData.phone,
                        department: profileData.department, position: profileData.jobRole || 'Learner',
                        summary: profileData.about || 'No summary available.', photo: profileData.avatar,
                    },
                    projects: mappedProjects, certifications: mappedCertifications, skills: technologiesData.map(t => t.name),
                };

                setCvData(finalCvData);

                if (finalCvData.personalInfo.photo) {
                    try {
                        // FIX: Using the new, authenticated proxy service instead of global fetch
                        const blob = await getProxiedImageBlob(finalCvData.personalInfo.photo);
                        setAvatarBlobUrl(URL.createObjectURL(blob));
                    } catch (e) {
                        console.error("Failed to fetch avatar for canvas:", e);
                    }
                }

            } catch (err: any) {
                console.error("CV.tsx: Failed to fetch CV data:", err);
                setError(err.message || 'Failed to load CV data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCvData(userIdToFetch);
        
        return () => {
            if (avatarBlobUrl) {
                URL.revokeObjectURL(avatarBlobUrl);
            }
        };
    }, [location.search]);

    const handleDownloadCV = async (): Promise<void> => {
        if (!cvData || !cvRef.current) return;
        const toastId = toast.loading('Generating PDF...');
        try {
            const element = cvRef.current;
            const downloadButton = element.querySelector('.download-button') as HTMLElement;
            if (downloadButton) downloadButton.style.display = 'none';
            
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
            
            if (downloadButton) downloadButton.style.display = '';
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`CV_${cvData.personalInfo.name.replace(/ /g, '_')}.pdf`);
            
            toast.success('CV downloaded successfully!', { id: toastId });
        } catch (e: any) {
            console.error("Error downloading CV:", e);
            toast.error('Failed to download CV.', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f3f9] p-6 flex items-center justify-center">
                <div className="text-gray-600 text-xl flex items-center">
                    <Loader2 className="animate-spin mr-3"/> Loading CV...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f5f3f9] p-6 flex flex-col items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading CV</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#2a135b] hover:bg-[#4F2B9A] text-white rounded-lg transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!cvData) return null;

    return (
        <div className="min-h-screen bg-[#f5f3f9] p-4 flex justify-center">
            <div className="relative">
                 <button onClick={handleDownloadCV} className="download-button absolute top-4 right-4 z-10 bg-[#2a135b] hover:bg-[#4F2B9A] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg text-white text-xs">
                    <Download size={14} />
                    Download CV
                </button>
                <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden" style={{ width: '794px', minHeight: '1123px' }} ref={cvRef}>
                    <div className="flex" style={{ minHeight: '1123px' }}>
                        <div className="w-1/3 bg-[#2a135b] text-white p-6">
                            <div className="mb-6">
                                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mx-auto">
                                    {cvData.personalInfo.photo ? (
                                        <img 
                                            src={avatarBlobUrl || cvData.personalInfo.photo} 
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
                                <h2 className="text-sm text-gray-300 font-medium">
                                    {cvData.personalInfo.position}
                                </h2>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-bold mb-3 bg-[#4F2B9A] text-white p-2 text-center">Contact</h3>
                                <div className="space-y-3">
                                    <div><p className="text-xs font-bold text-white mb-1">Phone</p><p className="text-xs text-gray-300">{cvData.personalInfo.phone}</p></div>
                                    <div><p className="text-xs font-bold text-white mb-1">Email</p><p className="text-xs text-gray-300 break-all">{cvData.personalInfo.email}</p></div>
                                    <div><p className="text-xs font-bold text-white mb-1">Department</p><p className="text-xs text-gray-300">{cvData.personalInfo.department}</p></div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-bold mb-3 bg-[#4F2B9A] text-white p-2 text-center">Technical Skills</h3>
                                <div>
                                    {cvData.skills.map((skill, index) => (
                                        <div key={index} className="mb-2"><span className="cv-skill-item text-xs text-gray-300 font-medium">{skill}</span></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-2/3 bg-gray-50 p-6 flex flex-col">
                            <ProfessionalSummary summary={cvData.personalInfo.summary} />
                            <ProjectsSection projects={cvData.projects} />
                            <CertificationsSection certifications={cvData.certifications} />
                            <div className="mt-auto"><CVFooter /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CV;