import React from 'react';
import { Award } from 'lucide-react';
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
    <div className="p-4 sm:p-8">
      <h2 className="text-xl font-semibold text-[#1B0A3F] mb-4 md:mb-6">Certifications</h2>
      <div className="grid gap-3 md:gap-4">
        {completedCertifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed certifications found.</p>
        ) : (
          completedCertifications.map((cert) => (
            <div key={cert.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#F6E6FF] rounded-lg transform transition-transform hover:scale-102">
              <div className="h-12 w-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                {cert.imageUrl ? (
                  <img 
                    src={cert.imageUrl} 
                    alt={cert.name} 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Award className="h-6 w-6 text-[#BF4BF6]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[#1B0A3F] font-medium mb-1">{cert.name}</h3>
                <p className="text-sm text-[#52007C]">
                  {cert.issuingOrganization && `${cert.issuingOrganization} | `}
                  Issued: {cert.issueDate}
                </p>
                {cert.description && (
                  <p className="text-sm text-gray-600 mt-1">{cert.description}</p>
                )}
              </div>
              <span className="mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-medium bg-[#52007C] text-white">
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