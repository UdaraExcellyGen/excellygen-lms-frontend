// src/api/services/Course/certificateService.ts - Updated with ExcellyGen Brand Support
import apiClient from '../../apiClient';
import { 
  CertificateDto, 
  ExternalCertificateDto, 
  CombinedCertificateDto,
  GenerateCertificatePayload, 
  AddExternalCertificatePayload 
} from '../../../types/course.types';

// === INTERNAL CERTIFICATES (from LMS courses) ===

// Get all internal certificates earned by the current user
export const getUserCertificates = async (): Promise<CertificateDto[]> => {
    const response = await apiClient.get<CertificateDto[]>('/Certificates/user');
    // Add type to each certificate
    return response.data.map(cert => ({ ...cert, type: 'internal' as const }));
};

// Generate a certificate for a completed course for the current user
export const generateCertificate = async (courseId: number): Promise<CertificateDto> => {
    const payload: GenerateCertificatePayload = { courseId };
    const response = await apiClient.post<CertificateDto>('/Certificates/generate', payload);
    return { ...response.data, type: 'internal' as const };
};

// Get a specific internal certificate by its ID
export const getCertificateById = async (certificateId: number): Promise<CertificateDto> => {
    const response = await apiClient.get<CertificateDto>(`/Certificates/${certificateId}`);
    return { ...response.data, type: 'internal' as const };
};

// === EXTERNAL CERTIFICATES (from other platforms) ===

// Get all external certificates for the current user
export const getExternalCertificates = async (): Promise<ExternalCertificateDto[]> => {
    try {
        const response = await apiClient.get<ExternalCertificateDto[]>('/ExternalCertificates/user');
        // Add type to each certificate
        return response.data.map(cert => ({ ...cert, type: 'external' as const }));
    } catch (error) {
        console.error('Error fetching external certificates:', error);
        // Return empty array if endpoint doesn't exist yet
        return [];
    }
};

// Add a new external certificate
export const addExternalCertificate = async (certificateData: AddExternalCertificatePayload): Promise<ExternalCertificateDto> => {
    const response = await apiClient.post<ExternalCertificateDto>('/ExternalCertificates', certificateData);
    return { ...response.data, type: 'external' as const };
};

// Update an external certificate
export const updateExternalCertificate = async (
    certificateId: string, 
    updateData: Partial<AddExternalCertificatePayload>
): Promise<ExternalCertificateDto> => {
    const response = await apiClient.put<ExternalCertificateDto>(`/ExternalCertificates/${certificateId}`, updateData);
    return { ...response.data, type: 'external' as const };
};

// Delete an external certificate
export const deleteExternalCertificate = async (certificateId: string): Promise<void> => {
    await apiClient.delete(`/ExternalCertificates/${certificateId}`);
};

// Get a specific external certificate by its ID
export const getExternalCertificateById = async (certificateId: string): Promise<ExternalCertificateDto> => {
    const response = await apiClient.get<ExternalCertificateDto>(`/ExternalCertificates/${certificateId}`);
    return { ...response.data, type: 'external' as const };
};

// === COMBINED FUNCTIONALITY ===

// Get all certificates (both internal and external) for the current user
export const getAllCertificates = async (): Promise<CombinedCertificateDto[]> => {
    try {
        const [internalCerts, externalCerts] = await Promise.allSettled([
            getUserCertificates(),
            getExternalCertificates()
        ]);

        const internal = internalCerts.status === 'fulfilled' ? internalCerts.value : [];
        const external = externalCerts.status === 'fulfilled' ? externalCerts.value : [];

        return [...internal, ...external];
    } catch (error) {
        console.error('Error fetching all certificates:', error);
        throw error;
    }
};

// Platform options for external certificates
export const CERTIFICATE_PLATFORMS = [
    'Udemy',
    'Coursera',
    'edX',
    'LinkedIn Learning',
    'Pluralsight',
    'Khan Academy',
    'FreeCodeCamp',
    'Codecademy',
    'Google Cloud Skills Boost',
    'AWS Training',
    'Microsoft Learn',
    'IBM SkillsBuild',
    'Other'
] as const;

export type CertificatePlatform = typeof CERTIFICATE_PLATFORMS[number];