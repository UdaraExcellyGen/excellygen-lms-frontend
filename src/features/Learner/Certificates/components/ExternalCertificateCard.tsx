// src/features/Learner/Certificates/components/ExternalCertificateCard.tsx - Redesigned Layout
import React from 'react';
import { ExternalLink, Clock, Edit, Trash2, Award, Globe } from 'lucide-react';
import { ExternalCertificateDto, BRAND_COLORS } from '../../../../types/course.types';

interface ExternalCertificateCardProps {
  certificate: ExternalCertificateDto;
  onEdit: (certificate: ExternalCertificateDto) => void;
  onDelete: (id: string) => void;
  onView: (certificate: ExternalCertificateDto) => void;
}

export const ExternalCertificateCard: React.FC<ExternalCertificateCardProps> = ({ 
  certificate, 
  onEdit, 
  onDelete,
  onView 
}) => {
  

  const handleViewCredential = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (certificate.credentialUrl) {
      window.open(certificate.credentialUrl, '_blank');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(certificate);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(certificate.id);
  };

  const handleCardClick = () => {
    onView(certificate);
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
          background: `linear-gradient(135deg, ${BRAND_COLORS.federalBlue} 0%, ${BRAND_COLORS.mediumBlue} 100%)` 
        }}
      >
        {/* Background Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
          <Globe className="h-20 w-20 text-white" />
        </div>
        
        {/* Certificate Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
              style={{ color: 'white' }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              External
            </span>
            
            <div className="flex gap-1">
              <button 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                onClick={handleEdit}
                aria-label="Edit certificate"
                title="Edit certificate"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-red-400/30 rounded-full transition-colors"
                onClick={handleDelete}
                aria-label="Delete certificate"
                title="Delete certificate"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {/* Title - Smaller font for better fit */}
          <h3 className="text-base font-bold text-white mb-2 leading-tight flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {certificate.title}
          </h3>
          
          {/* Issuer and Platform */}
          <div className="flex items-center justify-between">
            <p className="text-blue-100 text-sm font-medium truncate mr-2">{certificate.issuer}</p>
            <span 
              className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ 
                backgroundColor: BRAND_COLORS.paleAzure, 
                color: BRAND_COLORS.federalBlue 
              }}
            >
              {certificate.platform}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Section - Dedicated space */}
      <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex gap-2">
          {certificate.credentialUrl && (
            <button 
              className="flex items-center gap-1 px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-xs flex-1 justify-center"
              style={{ color: BRAND_COLORS.federalBlue }}
              onClick={handleViewCredential}
              aria-label="View original credential"
              title="View original credential"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Original</span>
            </button>
          )}
          
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          {certificate.description && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{certificate.description}</p>
            </div>
          )}

          {/* Footer info */}
          <div className="space-y-2">
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
        </div>

        {/* Bottom section */}
        <div className="pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ 
                  backgroundColor: `${BRAND_COLORS.deepSkyBlue}15`, 
                  color: BRAND_COLORS.federalBlue 
                }}
              >
                ✓ External
              </span>
              {certificate.credentialId && (
                <span 
                  className="text-xs font-mono px-2 py-1 rounded bg-gray-100"
                  style={{ color: BRAND_COLORS.gunmetal }}
                  title={`Credential ID: ${certificate.credentialId}`}
                >
                  ID: {certificate.credentialId.length > 6 ? 
                    `${certificate.credentialId.substring(0, 6)}...` : 
                    certificate.credentialId}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(certificate.completionDate).getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};