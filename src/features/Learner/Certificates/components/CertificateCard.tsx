// src/features/Learner/Certificates/components/CertificateCard.tsx - Redesigned Layout
import React from 'react';
import { Award, Clock, Eye } from 'lucide-react';
import { CertificateDto, BRAND_COLORS } from '../../../../types/course.types';

interface CertificateCardProps {
  certificate: CertificateDto;
  onDelete: (id: number) => void;
  onView?: (certificate: CertificateDto) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  onDelete, 
  onView 
}) => {
  const handleViewCertificate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(certificate);
    }
  };

  const handleCardClick = () => {
    if (onView) {
      onView(certificate);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer font-nunito group"
      style={{ height: '420px' }} // Slightly increased height for better button space
      onClick={handleCardClick}
    >
      {/* Header - Reduced height for more space */}
      <div 
        className="relative h-40 p-5 flex flex-col justify-between text-white overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.indigo} 0%, ${BRAND_COLORS.phlox} 100%)` 
        }}
      >
        {/* Background Award Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
          <Award className="h-20 w-20 text-white" />
        </div>
        
        {/* Certificate Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="mb-3">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
              style={{ color: 'white' }}
            >
              <Award className="w-3 h-3 mr-1" />
              Internal
            </span>
          </div>
          
          {/* Title - Smaller font for better fit */}
          <h3 className="text-base font-bold text-white mb-2 leading-tight flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {certificate.title}
          </h3>
          
          <p className="text-blue-100 text-sm font-medium truncate">{certificate.courseTitle}</p>
        </div>
      </div>

      {/* Action Buttons Section - Dedicated space */}
      <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-indigo-50">
        <button 
          className="flex items-center gap-1 px-3 py-2 text-white rounded-lg transition-all duration-200 font-medium text-xs w-full justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.phlox})`
          }}
          onClick={handleViewCertificate}
          aria-label="View certificate"
          title="View professional certificate"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Certificate</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Completed on {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Award className="h-4 w-4" />
            <span className="text-sm">Issued to: {certificate.userName}</span>
          </div>
        </div>

        {/* Professional Badge - Always at bottom */}
        <div className="pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center justify-between">
            <span 
              className="px-2 py-1 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: `${BRAND_COLORS.phlox}15`, 
                color: BRAND_COLORS.frenchViolet 
              }}
            >
              ✓ Verified
            </span>
            <span className="text-xs text-gray-500">
              ExcellyGen LMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};