import React from 'react';
import { User } from 'lucide-react';

interface ProfessionalSummaryProps {
  summary: string;
}

const ProfessionalSummary: React.FC<ProfessionalSummaryProps> = ({ summary }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Professional Summary</h3>
      </div>
      <p className="text-gray-600 leading-relaxed bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
        {summary}
      </p>
    </section>
  );
};

export default ProfessionalSummary;