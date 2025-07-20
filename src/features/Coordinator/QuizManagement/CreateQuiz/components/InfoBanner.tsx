// src/features/Coordinator/QuizManagement/components/InfoBanner.tsx
import React from 'react';
import { Info } from 'lucide-react';

interface InfoBannerProps {
  // 'children' allows you to pass any JSX (text, other components)
  // directly inside the component's tags.
  children: React.ReactNode;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ children }) => (
  // The outer div defines the banner's appearance: yellow background,
  // a prominent left border, padding, margin, and rounded corners.
  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
    <div className="flex items-start">
      {/* The Info icon provides a visual cue for the message type. */}
      <Info className="text-yellow-500 mr-2 flex-shrink-0" size={20} />

      {/* The <p> tag renders whatever content is passed into the component. */}
      <p className="text-yellow-800 text-sm">
        {children}
      </p>
    </div>
  </div>
);