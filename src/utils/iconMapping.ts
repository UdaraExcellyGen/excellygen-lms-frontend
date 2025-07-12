// utils/iconMapping.ts - Separate file for better performance
import React from 'react';
import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield
} from 'lucide-react';

// Static icon mapping - created once, never recreated
const ICON_MAP: Record<string, React.ElementType> = {
  'code': Code2,
  'target': Target,
  'clipboard': ClipboardList,
  'settings': Settings,
  'palette': Palette,
  'chart': LineChart,
  'cloud': Cloud,
  'shield': Shield
};

// Memoized icon component creation
export const getIconComponent = React.memo<{ iconName: string; size?: number; className?: string }>(
  ({ iconName, size = 30, className = "text-white" }) => {
    const IconComponent = ICON_MAP[iconName.toLowerCase()] || Code2;
    return <IconComponent size={size} className={className} />;
  }
);

getIconComponent.displayName = 'IconComponent';

// Pre-built icon components for common cases (even faster)
export const createIconComponent = (iconName: string) => {
  const IconComponent = ICON_MAP[iconName.toLowerCase()] || Code2;
  return IconComponent;
};