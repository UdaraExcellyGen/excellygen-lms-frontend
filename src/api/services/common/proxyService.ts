// src/api/services/common/proxyService.ts

import apiClient from '../../apiClient';

/**
 * Fetches an image through the backend proxy.
 * This is necessary to bypass browser CORS restrictions for rendering images on a canvas.
 * @param imageUrl The full URL of the image to proxy (e.g., a Firebase Storage URL).
 * @returns A Promise that resolves with the image data as a Blob.
 */
export const getProxiedImageBlob = async (imageUrl: string): Promise<Blob> => {
  try {
    const response = await apiClient.get('/imageproxy/proxy', {
      params: {
        url: imageUrl,
      },
      // This is the crucial part: it tells our client to expect binary data, not JSON.
      responseType: 'blob', 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image via proxy:', error);
    throw error;
  }
};