import apiClient from "../../apiClient";

export interface UserTechnology {
  id: string;
  name: string;
  addedDate: Date;
}

export interface Technology {
  id: string;
  name: string;
  status: string;
}

// Map to store technology names to IDs
let technologyCache: Map<string, string> = new Map();

/**
 * Get all technologies for a user
 * @param userId - The ID of the user
 * @returns Promise with array of user technologies
 */
export const getUserTechnologies = async (userId: string): Promise<UserTechnology[]> => {
  try {
    const response = await apiClient.get(`/user-technologies/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user technologies:', error);
    // Return empty array instead of throwing to prevent UI disruption
    return [];
  }
};

/**
 * Get available technologies for a user (only admin-created technologies)
 * @param userId - The ID of the user
 * @returns Promise with array of available technologies
 */
export const getAvailableTechnologies = async (userId: string): Promise<Technology[]> => {
  try {
    const response = await apiClient.get(`/user-technologies/${userId}/available`);
    
    // Update the technology cache with the available technologies
    const technologies: Technology[] = response.data;
    technologies.forEach(tech => {
      technologyCache.set(tech.name.toLowerCase(), tech.id);
    });
    
    return technologies;
  } catch (error) {
    console.error('Error fetching available technologies:', error);
    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Add a technology to user with improved error handling
 * @param userId - The ID of the user
 * @param technologyName - The name of the technology to add
 * @returns Promise with the added technology or throws an error
 */
export const addUserTechnology = async (userId: string, technologyName: string): Promise<UserTechnology> => {
  try {
    console.log(`Adding technology: ${technologyName} for user: ${userId}`);
    
    // First, ensure we have a populated technology cache
    if (technologyCache.size === 0) {
      console.log("Technology cache is empty, fetching available technologies");
      await getAvailableTechnologies(userId);
    }
    
    // Get the technology ID from the cache
    const techId = technologyCache.get(technologyName.toLowerCase());
    
    if (!techId) {
      // If we can't find the ID in the cache, fetch available technologies again
      // This handles cases where the cache might be stale
      console.log(`Technology ID not found in cache for: ${technologyName}, refreshing cache`);
      await getAvailableTechnologies(userId);
      
      // Try again after refreshing
      const refreshedTechId = technologyCache.get(technologyName.toLowerCase());
      
      if (!refreshedTechId) {
        throw new Error(`Technology not found: ${technologyName}`);
      }
      
      console.log(`Found technology ID after refresh: ${refreshedTechId}`);
      
      // Use the correct endpoint format with the technology ID in the URL
      const response = await apiClient.post(`/user-technologies/${userId}/${refreshedTechId}`);
      return response.data;
    }
    
    console.log(`Found technology ID: ${techId} for name: ${technologyName}`);
    
    // Use the correct endpoint format with the technology ID in the URL
    const response = await apiClient.post(`/user-technologies/${userId}/${techId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding technology:', error);
    throw new Error(`Failed to add technology: ${extractErrorMessage(error)}`);
  }
};

/**
 * Remove a technology from user with improved error handling
 * @param userId - The ID of the user
 * @param technologyId - The ID of the technology to remove
 * @returns Promise that resolves when technology is removed
 */
export const removeUserTechnology = async (userId: string, technologyId: string): Promise<void> => {
  try {
    await apiClient.delete(`/user-technologies/${userId}/${technologyId}`);
  } catch (error) {
    console.error('Error removing technology:', error);
    throw new Error(`Failed to remove technology: ${extractErrorMessage(error)}`);
  }
};

/**
 * Helper function to extract meaningful error messages
 */
function extractErrorMessage(error: any): string {
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Unknown error occurred';
}