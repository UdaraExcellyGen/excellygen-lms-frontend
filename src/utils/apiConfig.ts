import axios from 'axios';

// Create a configured axios instance for API calls
export const createApiClient = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5177/api';
  
  const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  const errorDetails = {
    message: 'An error occurred while processing your request.',
    details: null
  };

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorDetails.message = error.response.data?.message || 'Server error';
    errorDetails.details = {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers
    };
  } else if (error.request) {
    // The request was made but no response was received
    errorDetails.message = 'No response from server. Please check your connection.';
    errorDetails.details = { request: error.request };
  } else {
    // Something happened in setting up the request that triggered an Error
    errorDetails.message = error.message;
  }

  throw errorDetails;
};