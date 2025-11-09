import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check if this is an admin request
      const isAdminRequest = config.url?.includes('/admin/');

      // Use admin token for admin requests, regular token for others
      const token = isAdminRequest
        ? localStorage.getItem('admin-token')
        : localStorage.getItem('accessToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized/Forbidden - clear token and redirect to login
      if (typeof window !== 'undefined') {
        const isAdminRequest = error.config?.url?.includes('/admin/');

        if (isAdminRequest) {
          // Admin request - redirect to admin login
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
          localStorage.removeItem('admin-auth-storage');
          window.location.href = '/admin/login';
        } else {
          // Regular request - redirect to user login
          localStorage.removeItem('accessToken');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
