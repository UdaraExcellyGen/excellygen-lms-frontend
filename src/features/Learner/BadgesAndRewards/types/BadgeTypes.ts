import React from 'react';

export interface Badge {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  dateEarned?: string;
  category?: string;
}

export interface ConfirmClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  badge: Badge | null;
}