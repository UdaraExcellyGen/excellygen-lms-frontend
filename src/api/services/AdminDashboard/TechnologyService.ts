import apiClient from "../../apiClient";// Changed from 'api' to 'apiClient'

export interface Technology {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface CreateTechnologyRequest {
  name: string;
}

interface UpdateTechnologyRequest {
  name: string;
}

const TechnologyService = {
  /**
   * Get all technologies
   */
  getAllTechnologies: async (): Promise<Technology[]> => {
    const response = await apiClient.get('/technologies');
    return response.data;
  },

  /**
   * Get technology by ID
   */
  getTechnologyById: async (id: string): Promise<Technology> => {
    const response = await apiClient.get(`/technologies/${id}`);
    return response.data;
  },

  /**
   * Create new technology
   */
  createTechnology: async (data: CreateTechnologyRequest): Promise<Technology> => {
    const response = await apiClient.post('/technologies', data);
    return response.data;
  },

  /**
   * Update existing technology
   */
  updateTechnology: async (id: string, data: UpdateTechnologyRequest): Promise<Technology> => {
    const response = await apiClient.put(`/technologies/${id}`, data);
    return response.data;
  },

  /**
   * Delete technology
   */
  deleteTechnology: async (id: string): Promise<void> => {
    await apiClient.delete(`/technologies/${id}`);
  },

  /**
   * Toggle technology status between active and inactive
   */
  toggleTechnologyStatus: async (id: string): Promise<Technology> => {
    const response = await apiClient.patch(`/technologies/${id}/toggle-status`);
    return response.data;
  }
};

export default TechnologyService;