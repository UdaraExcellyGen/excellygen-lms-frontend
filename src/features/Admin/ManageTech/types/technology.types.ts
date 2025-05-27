// Path: src/features/Admin/ManageTech/types/technology.types.ts

export interface Technology {
  id: string;
  name: string;
  status: string;
  creatorType: string; // 'admin' or 'project_manager'
  creatorId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TechFormValues {
  name: string;
}

export type FilterStatus = 'all' | 'active' | 'inactive';

export interface TechFilters {
  searchTerm: string;
  filterStatus: FilterStatus;
}