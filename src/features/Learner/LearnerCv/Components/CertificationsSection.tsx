import React from 'react';
import { ProfileCertification } from '../types/types';

interface CertificationsSectionProps {
  certifications: ProfileCertification[];
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className="mb-4">
      {/* UPDATED: Header background, border, and text color */}
      <div className="bg-[#2a135b] text-white p-2 mb-3">
        <h3 className="text-base font-bold">Certifications</h3>
      </div>
      <div className="bg-white">
        {certifications.map((cert, index) => (
          <div key={index} className="border-l-4 border-[#1B0A3F] p-4 mb-3 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm mb-1">{cert.title}</h4>
                <p className="text-[#1B0A3F] text-xs font-medium mb-2">{cert.issuer}</p>
                <div className="text-xs text-gray-600">
                  <p><span className="font-bold">Completed:</span> {new Date(cert.completionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificationsSection;