// src/api/services/Course/certificateService.ts
import apiClient from '../../apiClient';
import { CertificateDto, GenerateCertificatePayload } from '../../../types/course.types';

// Get all certificates earned by the current user
export const getUserCertificates = async (): Promise<CertificateDto[]> => {
    const response = await apiClient.get<CertificateDto[]>('/Certificates/user');
    return response.data;
};

// Generate a certificate for a completed course for the current user
export const generateCertificate = async (courseId: number): Promise<CertificateDto> => {
    const payload: GenerateCertificatePayload = { courseId };
    const response = await apiClient.post<CertificateDto>('/Certificates/generate', payload);
    return response.data;
};

// Get a specific certificate by its ID
export const getCertificateById = async (certificateId: number): Promise<CertificateDto> => {
    const response = await apiClient.get<CertificateDto>(`/Certificates/${certificateId}`);
    return response.data;
};