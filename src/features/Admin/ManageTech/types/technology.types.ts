export interface Technology {
    id: string;
    name: string;
    status: string;
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