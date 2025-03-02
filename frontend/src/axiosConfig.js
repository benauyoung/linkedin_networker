import axios from 'axios';

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use our API route or fallback to a mock API
    return process.env.REACT_APP_API_URL || '';
  }
  // In development, use the proxy setup
  return 'http://localhost:5000';
};

// Create axios instance with base URL that works in both development and production
const instance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to modify requests before they are sent
instance.interceptors.request.use(
  config => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add interceptor to handle errors
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message || 'Unknown error');
    
    // If the error is a network error, we could be offline or the API is down
    if (error.message === 'Network Error') {
      console.log('Network error detected - API may be unavailable');
    }
    
    // Log additional details for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
    }
    
    return Promise.reject(error);
  }
);

export default instance;
