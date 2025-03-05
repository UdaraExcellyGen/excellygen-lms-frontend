import { ElementType } from 'react';

export interface Badge {
  id: number;
  title: string;
  description: string;
  icon: ElementType;
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  dateEarned?: string;
  category?: string;
}

export interface BadgeStat {
  icon: ElementType;
  label: string;
  value: string | number;
  color: string;
}