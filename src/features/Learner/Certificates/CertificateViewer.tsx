// src/features/Learner/Certificates/components/CertificateViewer.tsx
import React, { useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CertificateDto } from '../../../../src/types/course.types';

interface CertificateViewerProps {
  certificate: CertificateDto;
  onClose: () => void;
  technologies?: string[];
  subtopics?: string[];
  quizScore?: string;
  isOpen: boolean;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ 
  certificate, 
  onClose, 
  technologies = [], 
  subtopics = [],
  quizScore = "N/A",
  isOpen 
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#1B0A3F'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Certificate_${certificate.courseTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        
        {/* Download button */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="absolute -top-10 right-12 text-white hover:text-gray-300 flex items-center"
        >
          <Download size={24} className="mr-1" />
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        
        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="bg-gradient-to-br from-[#1B0A3F] to-[#34137C] text-white p-10 border-8 border-[#BF4BF6]/30 rounded-lg shadow-2xl"
        >
          <div className="border-2 border-[#D68BF9]/30 p-8 rounded-lg">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-[#D68BF9] mb-2">Certificate of Completion</div>
              <div className="text-xl text-gray-300">ExcellyGen Learning Management System</div>
            </div>
            
            <div className="text-center mb-8">
              <div className="text-lg text-gray-300 mb-2">This certifies that</div>
              <div className="text-3xl font-semibold mb-2">{certificate.userName}</div>
              <div className="text-lg text-gray-300 mb-2">has successfully completed the course</div>
              <div className="text-4xl font-bold text-[#D68BF9] mb-4">{certificate.courseTitle}</div>
              <div className="text-lg text-gray-300">on {formattedDate}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Technologies */}
              <div className="bg-[#34137C]/50 p-4 rounded-lg">
                <h3 className="text-[#D68BF9] text-lg font-semibold mb-3">Technologies Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.length > 0 ? (
                    technologies.map((tech, index) => (
                      <span key={index} className="bg-[#BF4BF6]/20 px-2 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No technologies specified</span>
                  )}
                </div>
              </div>
              
              {/* Quiz Score */}
              <div className="bg-[#34137C]/50 p-4 rounded-lg">
                <h3 className="text-[#D68BF9] text-lg font-semibold mb-3">Assessment Result</h3>
                <div className="flex items-center justify-center h-full">
                  <div className="text-3xl font-bold">{quizScore}</div>
                </div>
              </div>
            </div>
            
            {/* Subtopics */}
            <div className="bg-[#34137C]/50 p-4 rounded-lg mb-8">
              <h3 className="text-[#D68BF9] text-lg font-semibold mb-3">Content Covered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subtopics.length > 0 ? (
                  subtopics.map((topic, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-[#D68BF9] rounded-full mr-2"></div>
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">No specific topics listed</span>
                )}
              </div>
            </div>
            
            <div className="border-t border-[#D68BF9]/30 pt-6 flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold">ExcellyGen LMS</div>
                <div className="text-sm text-gray-400">Certificate ID: {certificate.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">To verify this certificate visit:</div>
                <div className="text-sm text-[#D68BF9]">https://excellygen-lms.com/verify/{certificate.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;