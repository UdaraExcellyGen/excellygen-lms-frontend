// src/features/Learner/Certificates/CertificateViewer.tsx - Professional Full-Page Certificate Viewer
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Download, ArrowLeft, Award, Calendar, BookOpen, Code, CheckCircle, ExternalLink, Globe, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CombinedCertificateDto, CertificateDto, ExternalCertificateDto, BRAND_COLORS } from '../../../types/course.types';
import { getLearnerCourseDetails } from '../../../api/services/Course/learnerCourseService';

interface CertificateViewerProps {
  certificate: CombinedCertificateDto;
  onBack: () => void;
  // Optional props for internal certificates
  technologies?: string[];
  subtopics?: string[];
  quizScore?: string;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ 
  certificate, 
  onBack, 
  technologies: propTechnologies = [], 
  subtopics: propSubtopics = [],
  quizScore: propQuizScore = "N/A"
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [actualTechnologies, setActualTechnologies] = useState<string[]>([]);
  const [actualSubtopics, setActualSubtopics] = useState<string[]>([]);
  const [actualQuizScore, setActualQuizScore] = useState<string>("N/A");
  
  // Use ref to track if data has been fetched to prevent loops
  const hasFetchedData = useRef(false);

  // Memoize certificate data to prevent unnecessary re-renders
  const certificateInfo = useMemo(() => {
    const isInternal = certificate.type === 'internal';
    const internalCert = certificate as CertificateDto;
    const externalCert = certificate as ExternalCertificateDto;
    
    return {
      isInternal,
      courseId: isInternal ? internalCert.courseId : null,
      title: isInternal ? internalCert.courseTitle : externalCert.title,
      userName: isInternal ? internalCert.userName : externalCert.userName,
      completionDate: isInternal ? internalCert.completionDate : externalCert.completionDate,
      issuerInfo: isInternal ? 'ExcellyGen Learning Management System' : externalCert.issuer,
      platformInfo: isInternal ? 'ExcellyGen LMS' : externalCert.platform,
      internalCert,
      externalCert
    };
  }, [certificate]);

  // Fetch course data once when component mounts
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedData.current) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      hasFetchedData.current = true;

      if (!certificateInfo.isInternal || !certificateInfo.courseId) {
        // For external certificates, set defaults
        setActualTechnologies(propTechnologies.length > 0 ? [...propTechnologies] : ['External Skills']);
        setActualSubtopics(propSubtopics.length > 0 ? [...propSubtopics] : ['External Course Content']);
        setActualQuizScore(propQuizScore || 'Completed');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching course details for courseId:', certificateInfo.courseId);
        const course = await getLearnerCourseDetails(certificateInfo.courseId);
        console.log('Course data received:', course);
        setCourseData(course);
        
        // Extract technologies with better fallback
        const techNames = course.technologies?.map((tech: any) => tech.name || tech.technologyName || tech) || [];
        console.log('Technologies extracted:', techNames);
        setActualTechnologies(techNames.length > 0 ? techNames : ['Programming', 'Software Development']);
        
        // Extract lesson names as subtopics with better fallback
        const lessonNames = course.lessons?.map((lesson: any) => 
          lesson.lessonName || lesson.title || lesson.name || lesson
        ) || [];
        console.log('Lessons extracted:', lessonNames);
        setActualSubtopics(lessonNames.length > 0 ? lessonNames : ['Course Introduction', 'Core Concepts', 'Practical Application', 'Final Assessment']);
        
        // Calculate quiz score
        const progressScore = course.progressPercentage || 0;
        const completedLessonsWithQuiz = course.lessons?.filter((lesson: any) => 
          lesson.hasQuiz && lesson.isQuizCompleted
        ) || [];
        
        if (progressScore === 100) {
          setActualQuizScore('100%');
        } else if (completedLessonsWithQuiz.length > 0) {
          setActualQuizScore(`${progressScore}%`);
        } else {
          setActualQuizScore('Completed');
        }
      } catch (error) {
        console.error('Error fetching course data for certificate:', error);
        // Provide meaningful fallback data
        setActualTechnologies(['Programming', 'Software Development']);
        setActualSubtopics(['Course Introduction', 'Core Concepts', 'Practical Application', 'Final Assessment']);
        setActualQuizScore('Completed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - only run once on mount

  // Reset fetch flag when certificate changes
  useEffect(() => {
    hasFetchedData.current = false;
  }, [certificate.id]);

  const handleDownloadPdf = useCallback(async () => {
    if (!certificateRef.current) {
      console.error('Certificate reference not found');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // Force layout recalculation and wait for all elements to render
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 1500); // Longer wait for complex layouts
        });
      });
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        height: 700,
        windowWidth: 1000,
        windowHeight: 700,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        ignoreElements: (element) => {
          // Skip elements that might cause alignment issues
          return element.classList?.contains('no-print') || false;
        }
      });
      
      console.log('Canvas created successfully');
      
      // Create high quality image data
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to maintain exact aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth, finalHeight, imgX, imgY;
      
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas is wider than PDF
        finalWidth = pdfWidth * 0.95; // 95% of page width for margins
        finalHeight = finalWidth / canvasAspectRatio;
        imgX = (pdfWidth - finalWidth) / 2;
        imgY = (pdfHeight - finalHeight) / 2;
      } else {
        // Canvas is taller than PDF
        finalHeight = pdfHeight * 0.95; // 95% of page height for margins
        finalWidth = finalHeight * canvasAspectRatio;
        imgX = (pdfWidth - finalWidth) / 2;
        imgY = (pdfHeight - finalHeight) / 2;
      }
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight, undefined, 'FAST');
      
      const fileName = certificateInfo.isInternal 
        ? `ExcellyGen_Certificate_${certificateInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : `ExcellyGen_Certificate_${certificateInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [certificateInfo.isInternal, certificateInfo.title]);

  const formattedDate = useMemo(() => {
    return new Date(certificateInfo.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [certificateInfo.completionDate]);

  return (
    <div 
      className="min-h-screen font-nunito"
      style={{ 
        background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)` 
      }}
    >
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Certificates</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">Certificate Verification</h1>
              <p className="text-sm text-gray-600">ExcellyGen Learning Management System</p>
            </div>
            
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span className="font-medium">
                {isDownloading ? 'Generating PDF...' : isLoading ? 'Loading...' : 'Download Certificate'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Certificate Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading certificate data...</p>
              </div>
            </div>
          )}

          {/* Professional Certificate Design - ORIGINAL LAYOUT */}
          {!isLoading && (
            <div 
              ref={certificateRef}
              className="bg-white shadow-2xl border border-gray-200 mx-auto relative overflow-hidden"
              style={{ 
                width: '1000px', 
                height: '700px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {/* Certificate Content */}
              <div className="relative h-full flex">
                {/* Left Side Content */}
                <div className="flex-1 p-12 pr-6">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ 
                          background: certificateInfo.isInternal 
                            ? `linear-gradient(135deg, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.phlox})`
                            : `linear-gradient(135deg, ${BRAND_COLORS.federalBlue}, ${BRAND_COLORS.mediumBlue})`
                        }}
                      >
                        {certificateInfo.isInternal ? (
                          <Award className="w-6 h-6 text-white" />
                        ) : (
                          <Globe className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">ExcellyGen</h1>
                        <p className="text-sm text-gray-600">Learning Management System</p>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{certificateInfo.userName}</h2>
                    {/* ONLY CHANGE: Added dotted line under name */}
                    <div 
                      className="w-64 mb-4"
                      style={{
                        borderBottom: '2px dotted #9CA3AF',
                        height: '1px'
                      }}
                    ></div>
                    <p className="text-lg text-gray-600 mb-3">has successfully completed</p>
                    <h3 className="text-2xl font-semibold mb-6" style={{ color: certificateInfo.isInternal ? BRAND_COLORS.indigo : BRAND_COLORS.federalBlue }}>
                      {certificateInfo.title}
                    </h3>
                    <p className="text-gray-600">
                      an online {certificateInfo.isInternal ? 'course' : 'certification'} authorized by {certificateInfo.issuerInfo} and offered through {certificateInfo.platformInfo}
                    </p>
                  </div>

                  {/* Skills and Technologies Section - PLAIN TEXT FOR PDF */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5" style={{ color: certificateInfo.isInternal ? BRAND_COLORS.frenchViolet : BRAND_COLORS.federalBlue }} />
                      Skills & Technologies Covered
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {actualTechnologies.map((tech, index) => (
                        <span 
                          key={index} 
                          className="text-sm font-medium"
                          style={{ 
                            color: certificateInfo.isInternal ? BRAND_COLORS.russianViolet : BRAND_COLORS.federalBlue
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Course Content Section - PDF OPTIMIZED */}
                  {actualSubtopics.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" style={{ color: certificateInfo.isInternal ? BRAND_COLORS.frenchViolet : BRAND_COLORS.federalBlue }} />
                        Course Content Covered
                      </h4>
                      <div style={{ paddingTop: '4px' }}>
                        {actualSubtopics.slice(0, 4).map((topic, index) => (
                          <div 
                            key={index} 
                            style={{ 
                              marginBottom: '8px',
                              position: 'relative',
                              paddingLeft: '18px',
                              height: '20px'
                            }}
                          >
                            <div 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '3px',
                                backgroundColor: certificateInfo.isInternal ? BRAND_COLORS.phlox : BRAND_COLORS.federalBlue,
                                position: 'absolute',
                                left: '0px',
                                top: '7px'
                              }}
                            ></div>
                            <span 
                              style={{ 
                                fontSize: '14px', 
                                color: '#374151', 
                                lineHeight: '20px',
                                display: 'block',
                                paddingTop: '0px',
                                marginTop: '-3px'
                              }}
                            >
                              {topic}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Information */}
                  <div className="mt-auto pt-6">
                  </div>
                </div>

                {/* Right Side - ORIGINAL Arrow Design */}
                <div className="relative w-80">
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: certificateInfo.isInternal 
                        ? `linear-gradient(135deg, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.persianIndigo})`
                        : `linear-gradient(135deg, ${BRAND_COLORS.federalBlue}, ${BRAND_COLORS.mediumBlue})`,
                      clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)'
                    }}
                  ></div>
                  
                  {/* Content in the arrow shape */}
                  <div className="relative h-full flex flex-col justify-center items-center text-white p-8 pl-16">
                    <div className="text-center mb-8">
                      <div 
                        className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center mb-4 mx-auto"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">COURSE</h3>
                      <h3 className="text-xl font-bold">CERTIFICATE</h3>
                    </div>

                    {/* Assessment Performance */}
                    <div className="text-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-full border-3 border-white flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold mb-1">ASSESSMENT</h4>
                      <h4 className="text-sm font-semibold mb-2">PERFORMANCE</h4>
                      <p className="text-2xl font-bold">{actualQuizScore}</p>
                    </div>

                    {/* Platform Badge */}
                    <div className="text-center">
                      <div 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '32px',
                          border: '2px solid rgba(255,255,255,0.4)',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          margin: '0 auto 12px auto',
                          lineHeight: '60px',
                          textAlign: 'center'
                        }}
                      >
                        <span 
                          style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            color: 'white',
                            verticalAlign: 'middle',
                            display: 'inline-block',
                            lineHeight: 'normal'
                          }}
                        >
                          EG
                        </span>
                      </div>
                      <p className="text-xs opacity-90">VERIFIED BY</p>
                      <p className="text-sm font-semibold">EXCELLYGEN</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Line */}
              <div className="absolute bottom-6 left-12 right-12 flex justify-between items-end">
                <div className="text-left">
                  <div 
                    className="w-32 h-0.5 mb-2"
                    style={{ backgroundColor: certificateInfo.isInternal ? BRAND_COLORS.phlox : BRAND_COLORS.federalBlue }}
                  ></div>
                  <p className="text-xs text-gray-600">Authorized Signature</p>
                  <p className="text-xs font-semibold text-gray-800">ExcellyGen Learning Team</p>
                  <p className="text-xs text-gray-600 mt-1">Completed on {formattedDate}</p>
                </div>
                
                {/* Certificate ID - White text */}
                <div className="text-right">
                  <p className="text-xs text-white">Certificate ID</p>
                  <p 
                    className="font-mono text-sm font-bold text-white"
                  >
                    {certificateInfo.isInternal ? `EG-${certificateInfo.internalCert.id}` : `EG-EXT-${certificateInfo.externalCert.id}`}
                  </p>
                  <p className="text-xs text-white mt-1">Verify at: excellygen.com/verify</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Below Certificate */}
          {!isLoading && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                This certificate represents the successful completion of coursework and demonstrates proficiency in the listed skills and technologies.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                © 2025 ExcellyGen Learning Management System. All rights reserved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;