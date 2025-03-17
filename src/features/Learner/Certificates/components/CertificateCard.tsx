import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, Star, Clock } from 'lucide-react';
import { CertificateCardProps } from '../../../../../../../../Certificates/Certificates/types/certificates';

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-600';
      case 'In Progress':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (certificate.status === 'Completed') {
      navigate(`/certificate/${certificate.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] p-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-20 w-20 text-white/20" />
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
          <p className="text-[#D68BF9] mt-1">{certificate.issuer}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(certificate.status)}`}>
              {certificate.status}
            </span>
            {certificate.grade && (
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{certificate.grade}</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {certificate.status === 'Completed' && (
              <button 
                className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-lg transition-colors"
                onClick={handleDownload}
                aria-label="Download certificate"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {certificate.status === 'Completed' ? (
              <span>Completed on {certificate.completionDate}</span>
            ) : (
              <span>Expected completion: {certificate.expectedCompletion}</span>
            )}
          </div>
          {certificate.skills && (
            <div className="flex flex-wrap gap-2 mt-3">
              {certificate.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-[#F6E6FF] text-[#52007C] text-xs rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};