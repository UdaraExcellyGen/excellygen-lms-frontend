import React from 'react';
import { Certification } from '../types';
import { Award, Calendar } from 'lucide-react';

const CertificationsList: React.FC<{ certifications: Certification[] }> = ({ certifications }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">Certifications & Credentials</h3>
      <div className="space-y-4">
        {certifications.length > 0 ? (
          certifications.map(cert => (
            <div key={cert.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
                <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={22} className="text-indigo-600"/>
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{cert.name}</h4>
                    <p className="text-sm text-gray-500">{cert.issuingOrganization}</p>
                    <p className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar size={12} className="mr-1.5"/>
                        Issued {cert.issueDate}
                    </p>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Award size={32} className="mx-auto mb-2"/>
            <p>No certifications have been added.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationsList;