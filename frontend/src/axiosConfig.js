import axios from 'axios';

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use the relative path since Vercel will handle routing
    return '/api';
  }
  // In development, use the proxy setup
  return '';
};

// Create axios instance with base URL that works in both development and production
const instance = axios.create({
  baseURL: getBaseUrl()
});

// Add interceptor to handle errors
instance.interceptors.response.use(
  response => response,
  error => {
    // Log the error for debugging
    console.error('API Error:', error);
    
    // Return a rejected promise but prevent app from crashing
    return Promise.reject(error);
  }
);

export default instance;
