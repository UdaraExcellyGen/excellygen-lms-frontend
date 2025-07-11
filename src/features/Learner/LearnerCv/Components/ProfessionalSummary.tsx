import React from 'react';

interface ProfessionalSummaryProps {
  summary: string;
}

const ProfessionalSummary: React.FC<ProfessionalSummaryProps> = ({ summary }) => {
  return (
    <section className="mb-4">
      <div className="bg-blue-900 text-white p-2 mb-3">
        <h3 className="text-base font-bold">Professional Summary</h3>
      </div>
      <div className="bg-white p-4 border-l-4 border-blue-900">
        <p className="text-gray-700 leading-relaxed text-xs">
          {summary}
        </p>
      </div>
    </section>
  );
};

export default ProfessionalSummary;