import axios from 'axios';

// Get the base URL depending on the environment
const getBaseUrl = () => {
  // For vercel.app deployment
  if (window.location.hostname.includes('vercel.app')) {
    // Use relative path directly on Vercel
    return '';
  }
  
  // For local development 
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Default case - use the environment variable if defined
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fall back to an empty string (same-origin requests)
  return '';
};

const instance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    
    // Create a more user-friendly error message
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      if (error.response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your network connection.';
    }
    
    // Attach the user-friendly message to the error
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export default instance;
