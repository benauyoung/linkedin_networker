import axios from 'axios';

// Create axios instance with base URL that works in both development and production
const instance = axios.create({
  baseURL: '/api'
});

export default instance;
