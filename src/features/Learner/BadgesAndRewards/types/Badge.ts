// src/features/Learner/BadgesAndRewards/types/Badge.ts
import { ElementType } from 'react';

export interface Badge {
  id: number;
  title: string;
  description: string;
  iconPath: string;
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  dateEarned?: string;
  category: string;
  color: string; // Brand color for the badge
}

export interface BadgeStat {
  icon: ElementType;
  label: string;
  value: string | number;
  gradient: string;
}