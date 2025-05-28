import React from 'react';
import { Award, Calendar } from 'lucide-react';
import { ProfileData } from '../types';

interface CertificationsListProps {
  profileData: ProfileData;
  viewOnly?: boolean;
}

const CertificationsList: React.FC<CertificationsListProps> = ({
  profileData,
  viewOnly = false
}) => {
  // Only show completed certifications
  const completedCertifications = profileData.certifications.filter(cert => cert.status === 'Completed');

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#1B0A3F] mb-6">Certifications</h2>
      <div className="grid gap-4">
        {completedCertifications.length === 0 ? (
          <p className="text-[#52007C] p-4 bg-white/70 backdrop-blur-md rounded-xl border border-[#BF4BF6]/10 shadow-sm">No completed certifications found.</p>
        ) : (
          completedCertifications.map((cert) => (
            <div 
              key={cert.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#52007C] to-[#BF4BF6] shadow-lg flex items-center justify-center flex-shrink-0">
                {cert.imageUrl ? (
                  <img 
                    src={cert.imageUrl} 
                    alt={cert.name} 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Award className="h-7 w-7 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[#1B0A3F] font-medium text-lg mb-1">{cert.name}</h3>
                <p className="text-sm text-[#52007C] flex items-center">
                  {cert.issuingOrganization && (
                    <>
                      <span className="font-medium">{cert.issuingOrganization}</span>
                      <span className="mx-2">•</span>
                    </>
                  )}
                  <Calendar className="h-3.5 w-3.5 mr-1 text-[#BF4BF6]" />
                  {cert.issueDate}
                </p>
                {cert.description && (
                  <p className="text-sm text-gray-600 mt-2 bg-[#F6E6FF]/30 p-2 rounded-lg">{cert.description}</p>
                )}
              </div>
              <span className="sm:ml-2 mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#52007C] to-[#BF4BF6] text-white shadow-sm">
                {cert.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CertificationsList;