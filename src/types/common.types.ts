// src/types/common.types.ts

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  userId?: string;
  actionUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterState {
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
}