// src/features/Learner/Certificates/components/CertificateCard.tsx
import React from 'react';
// FIXED: Added Clock import
import { Download, Award, Clock } from 'lucide-react'; 
import { CertificateDto } from '../../../../types/course.types'; // Use backend CertificateDto

interface CertificateCardProps {
  certificate: CertificateDto; // Expects CertificateDto
  onDelete: (id: number) => void; // Added for delete functionality if backend supports
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onDelete }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Assuming certificate.certificateFileUrl is a direct download link
    if (certificate.certificateFileUrl) {
      window.open(certificate.certificateFileUrl, '_blank');
    } else {
      console.warn("Certificate file URL is missing.");
      alert("Certificate file not available for download.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      <div className="relative h-48 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] p-6 flex flex-col justify-between">
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-20 w-20 text-white/20" />
        </div>
        <div className="relative flex-grow">
          <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
          <p className="text-[#D68BF9] mt-1">{certificate.courseTitle}</p>
        </div>
        <div className="relative flex justify-end gap-2 mt-auto">
            <button 
                className="p-2 text-white hover:text-[#D68BF9] rounded-full transition-colors bg-white/20 hover:bg-white/30"
                onClick={handleDownload}
                aria-label="Download certificate"
            >
                <Download className="h-5 w-5" />
            </button>
            {/* Enable delete if needed, for now it's just a placeholder for the delete modal trigger */}
            {/* <button 
                className="p-2 text-white hover:text-red-400 rounded-full transition-colors bg-white/20 hover:bg-red-400/30"
                onClick={() => onDelete(certificate.id)}
                aria-label="Delete certificate"
            >
                <Trash2 className="h-5 w-5" />
            </button> */}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm bg-green-50 text-green-600`}>
            Completed
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-500 mt-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {/* Error was here */}
            <span>Completed on {new Date(certificate.completionDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Issued to: {certificate.userName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};