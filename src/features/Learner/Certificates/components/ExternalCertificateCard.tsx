import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Download, Clock, Edit, Trash2 } from 'lucide-react';
import { ExternalCertificateCardProps } from '../../../../../../../../Certificates/Certificates/types/certificates';

export const ExternalCertificateCard: React.FC<ExternalCertificateCardProps> = ({ 
  certificate, 
  onEdit, 
  onDelete 
}) => {
  const navigate = useNavigate();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/certificate/external-${certificate.id}`);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-[#1A237E] to-[#3949AB] p-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <ExternalLink className="h-20 w-20 text-white/20" />
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
          <p className="text-blue-200 mt-1">{certificate.issuer}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {certificate.platform}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button 
            onClick={() => onEdit(certificate)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Edit certificate"
          >
            <Edit className="h-4 w-4 text-white" />
          </button>
          <button 
            onClick={() => onDelete(certificate.id)}
            className="p-1.5 bg-white/20 hover:bg-red-400/30 rounded-full transition-colors"
            aria-label="Delete certificate"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Completed on {certificate.completionDate}</span>
          </div>
          <div className="flex space-x-2">
            <a 
              href={certificate.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
              aria-label="Download certificate"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};