import { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeatureCardProps extends Feature {
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface HeroSectionProps {
  onGetStarted: () => void;
}