
export interface CourseDetails {
    title: string;
    category: string;
    description: string;
    estimatedTime: string;
    thumbnail: File | null;
    technologies: string[];
  }
  
  export interface Errors { 
    title: boolean;
    category: boolean;
    description: boolean;
    estimatedTime: boolean;
    technologies: boolean;
    thumbnail: boolean;
  }