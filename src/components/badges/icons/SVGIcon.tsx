// src/components/badges/icons/SVGIcon.tsx
import React, { useState } from 'react';
import { Trophy } from 'lucide-react';

interface SVGIconProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const SVGIcon: React.FC<SVGIconProps> = ({ src, alt, className = '', style = {} }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback icon if SVG fails to load
  const FallbackIcon = () => (
    <div className={`flex items-center justify-center ${className}`} style={style}>
      <Trophy className="text-gray-400 w-full h-full" />
    </div>
  );

  if (imageError) {
    return <FallbackIcon />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default SVGIcon;