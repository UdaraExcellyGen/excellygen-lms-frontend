// utils/iconMapping.ts - No JSX version
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

// Interface for props
interface IconComponentProps {
  iconName: string;
  size?: number;
  className?: string;
}

// Memoized icon component creation using React.createElement
export const getIconComponent = React.memo<IconComponentProps>(
  ({ iconName, size = 30, className = "text-white" }) => {
    const IconComponent = ICON_MAP[iconName.toLowerCase()] || Code2;
    return React.createElement(IconComponent, { size, className });
  }
);

getIconComponent.displayName = 'IconComponent';

// Pre-built icon components for common cases (even faster)
export const createIconComponent = (iconName: string): React.ElementType => {
  const IconComponent = ICON_MAP[iconName.toLowerCase()] || Code2;
  return IconComponent;
};