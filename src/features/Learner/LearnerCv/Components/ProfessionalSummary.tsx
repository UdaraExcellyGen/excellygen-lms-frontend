import React from 'react';

interface ProfessionalSummaryProps {
  summary: string;
}

const ProfessionalSummary: React.FC<ProfessionalSummaryProps> = ({ summary }) => {
  return (
    <section className="mb-4">
      {/* UPDATED: Header background and border color */}
      <div className="bg-[#2a135b] text-white p-2 mb-3">
        <h3 className="text-base font-bold">Professional Summary</h3>
      </div>
      <div className="bg-white p-4 border-l-4 border-[#1B0A3F]">
        <p className="text-gray-700 leading-relaxed text-xs">
          {summary}
        </p>
      </div>
    </section>
  );
};

export default ProfessionalSummary;