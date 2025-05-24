
import axios from 'axios';
import { toast } from 'sonner';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Change this to your Laravel API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage with fallbacks for different key names
    const token = 
      localStorage.getItem('auth_token') || 
      localStorage.getItem('access_token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Your session has expired. Please log in again.');
    } else if (response && response.status === 403) {
      // Forbidden
      toast.error('You do not have permission to perform this action.');
    } else if (response && response.status === 404) {
      // Not found
      toast.error('The requested resource was not found.');
    } else if (response && response.status === 422) {
      // Validation error
      const errors = response.data.errors;
      if (errors) {
        Object.values(errors).forEach((errorMsgs: any) => {
          errorMsgs.forEach((msg: string) => {
            toast.error(msg);
          });
        });
      } else {
        toast.error('Invalid data submitted. Please check your inputs.');
      }
    } else if (response && response.status >= 500) {
      // Server error
      toast.error('A server error occurred. Please try again later.');
    } else {
      // Network error or unknown error
      toast.error('An error occurred. Please check your connection and try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
