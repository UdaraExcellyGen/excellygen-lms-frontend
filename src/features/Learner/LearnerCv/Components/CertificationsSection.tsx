// src/features/Learner/LearnerCv/Components/CertificationsSection.tsx

import React from 'react';
import { ProfileCertification } from '../types/types';

interface CertificationsSectionProps {
  certifications: ProfileCertification[];
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications }) => {
  // Return null if there are no certifications to display
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="bg-blue-900 text-white p-2 mb-3">
        <h3 className="text-base font-bold">Certifications</h3>
      </div>
      <div className="bg-white">
        {certifications.map((cert, index) => (
          <div key={index} className="border-l-4 border-blue-900 p-4 mb-3 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm mb-1">{cert.title}</h4>
                <p className="text-blue-900 text-xs font-medium mb-2">{cert.issuer}</p>
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