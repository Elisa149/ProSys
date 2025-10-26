import axios from 'axios';
import toast from 'react-hot-toast';
// Import Firebase services
import { 
  propertyService, 
  paymentService, 
  rentService, 
  tenantService, 
  userService 
} from './firebaseService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance (kept for compatibility but won't be used)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        // Get fresh token from Firebase
        const auth = (await import('../config/firebase')).auth;
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          console.log('🔄 Token expired, attempting refresh...');
          const newToken = await currentUser.getIdToken(true);
          
          // Update token for future requests
          setAuthToken(newToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // No user, redirect to login
          console.log('❌ No user found, redirecting to login');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear token and redirect to login
        setAuthToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get current user info
const getCurrentUserInfo = () => {
  try {
    // Try to get user info from localStorage (set by AuthContext)
    const userRole = localStorage.getItem('userRole') || null;
    const organizationId = localStorage.getItem('organizationId') || null;
    const userId = localStorage.getItem('userId') || 'current-user-id';
    
    return {
      userId,
      userRole,
      organizationId
    };
  } catch (error) {
    console.warn('Could not get current user info:', error);
    return { userId: 'current-user-id', userRole: null, organizationId: null };
  }
};

// API endpoints - REDIRECTED TO FIREBASE SERVICES
export const authAPI = {
  verifyToken: () => Promise.resolve({ data: { valid: true } }),
  getProfile: () => Promise.resolve({ data: {} }),
  updateProfile: (data) => Promise.resolve({ data }),
  requestAccess: (data) => Promise.resolve({ data }),
  getOrganizations: () => Promise.resolve({ data: [] }),
  getOrgRoles: (orgId) => Promise.resolve({ data: [] }),
  getAccessRequests: () => Promise.resolve({ data: [] }),
  respondToRequest: (requestId, data) => Promise.resolve({ data }),
};

export const propertiesAPI = {
  getAll: () => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return propertyService.getAll(userId, userRole, organizationId);
  },
  getById: (id) => propertyService.getById(id),
  create: (data) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return propertyService.create(data, userId, userRole, organizationId);
  },
  update: (id, data) => propertyService.update(id, data),
  delete: (id) => propertyService.delete(id),
  getStats: (id) => propertyService.getStats(id),
};

export const rentAPI = {
  getAll: () => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return rentService.getAll(userId, userRole, organizationId);
  },
  getById: (id) => Promise.resolve({ data: {} }),
  getByProperty: (propertyId) => rentService.getByProperty(propertyId),
  create: (data) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return rentService.create(data, userId, userRole, organizationId);
  },
  update: (id, data) => rentService.update(id, data),
  delete: (id) => rentService.delete(id),
};

export const paymentsAPI = {
  getAll: (params = {}) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return paymentService.getAll(userId, userRole, organizationId, params);
  },
  getById: (id) => paymentService.getById(id),
  create: (data) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return paymentService.create(data, userId, userRole, organizationId);
  },
  update: (id, data) => paymentService.update(id, data),
  delete: (id) => paymentService.delete(id),
  getDashboardSummary: () => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return paymentService.getDashboardSummary(userId, userRole, organizationId);
  },
  getStats: () => Promise.resolve({ data: {} }),
};

export const tenantsAPI = {
  getAll: () => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return tenantService.getAll(userId, userRole, organizationId);
  },
  getById: (id) => Promise.resolve({ data: {} }),
  create: (data) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return tenantService.create(data, userId, userRole, organizationId);
  },
  update: (id, data) => tenantService.update(id, data),
  delete: (id) => tenantService.delete(id),
  getByProperty: (propertyId) => tenantService.getByProperty(propertyId),
};

export const usersAPI = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id) => Promise.resolve({ data: {} }),
  updateProfile: (id, data) => Promise.resolve({ data }),
  updateRole: (id, data) => Promise.resolve({ data }),
  getAdminDashboardStats: () => Promise.resolve({ data: {} }),
};

export const organizationsAPI = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id) => Promise.resolve({ data: {} }),
  create: (data) => Promise.resolve({ data }),
  update: (id, data) => Promise.resolve({ data }),
  delete: (id) => Promise.resolve({ data }),
  getRoles: (id) => Promise.resolve({ data: [] }),
};

export default api;
