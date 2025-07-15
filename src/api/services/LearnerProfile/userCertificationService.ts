import apiClient from '../../apiClient';

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  description: string;
  issueDate: string;
  status: string;
  credentialId: string;
  imageUrl: string;
}

// Fetches INTERNAL certificates
export const getUserCertifications = async (userId: string): Promise<Certification[]> => {
  try {
    const response = await apiClient.get(`/user-certifications/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching internal user certifications for ${userId}:`, error);
    return [];
  }
};

// =================================================================
// NEW FUNCTION to fetch EXTERNAL certificates for a specific user
// =================================================================
export const getExternalUserCertifications = async (userId: string): Promise<Certification[]> => {
    try {
        const response = await apiClient.get(`/user-certifications/${userId}/external`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching external user certifications for ${userId}:`, error);
        return [];
    }
}
// =================================================================

export const getUserCertification = async (userId: string, certificationId: string): Promise<Certification> => {
  try {
    const response = await apiClient.get(`/user-certifications/${userId}/${certificationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user certification ${certificationId}:`, error);
    throw error;
  }
};

export const addUserCertification = async (
  userId: string, 
  certificationData: {
    certificationId: string;
    credentialId?: string;
    issueDate: string;
  }
): Promise<Certification> => {
  try {
    const response = await apiClient.post(`/user-certifications/${userId}`, certificationData);
    return response.data;
  } catch (error) {
    console.error('Error adding certification:', error);
    throw error;
  }
};

export const updateUserCertification = async (
  userId: string,
  certificationId: string,
  updateData: {
    credentialId?: string;
    status?: string;
  }
): Promise<Certification> => {
  try {
    const response = await apiClient.put(`/user-certifications/${userId}/${certificationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating certification:', error);
    throw error;
  }
};

export const deleteUserCertification = async (userId: string, certificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/user-certifications/${userId}/${certificationId}`);
  } catch (error) {
    console.error('Error deleting certification:', error);
    throw error;
  }
};