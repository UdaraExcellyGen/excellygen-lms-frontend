export interface Certificate {
    id: number;
    title: string;
    issuer: string;
    status: 'Completed' | 'In Progress';
    completionDate?: string;
    expectedCompletion?: string;
    grade?: string;
    skills?: string[];
    progress?: number;
}

export interface ExternalCertificate {
    id: number;
    title: string;
    issuer: string;
    completionDate: string;
    url: string;
    platform: string;
}