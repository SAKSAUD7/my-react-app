import axios from 'axios';

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received');
      return Promise.reject(new Error('No response received from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export const uploadFile = async (endpoint, file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  // Add any additional options to formData
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });

  return response.data;
};

export const uploadMultipleFiles = async (endpoint, files, options = {}) => {
  const formData = new FormData();
  
  // Append each file with a unique field name
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  // Add any additional options to formData
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });

  return response.data;
};

export default api; 