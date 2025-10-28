import axios from 'axios';
import toast from 'react-hot-toast';
// Import Firebase services
import { 
  propertyService, 
  paymentService, 
  rentService, 
  tenantService, 
  userService,
  invoiceService
} from './firebaseService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// NOTE: Axios instance retained only for potential future HTTP calls.
// Current app uses Firebase services directly.
const api = axios.create({ baseURL: API_BASE_URL });

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

// Minimal request interceptor to attach token when present
api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// Minimal response interceptor
api.interceptors.response.use((r) => r, (error) => {
  const message = error.response?.data?.error || error.message || 'An error occurred';
  if (error.response?.status !== 401) toast.error(message);
  return Promise.reject(error);
});

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

export const invoicesAPI = {
  getAll: () => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return invoiceService.getAll(userId, userRole, organizationId);
  },
  getById: (id) => invoiceService.getById(id),
  getByRentId: (rentId) => invoiceService.getByRentId(rentId),
  create: (data) => {
    const { userId, userRole, organizationId } = getCurrentUserInfo();
    return invoiceService.create(data, userId, userRole, organizationId);
  },
  update: (id, data) => invoiceService.update(id, data),
  delete: (id) => invoiceService.delete(id),
};

export const usersAPI = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id) => Promise.resolve({ data: {} }),
  updateProfile: (id, data) => Promise.resolve({ data }),
  updateRole: (id, data) => Promise.resolve({ data }),
  getAdminDashboardStats: async () => {
    const { organizationId, userRole } = getCurrentUserInfo();
    // If super admin, pull system-wide stats
    if (userRole === 'super_admin') {
      const stats = await userService.getSystemDashboardStats();
      return { data: stats };
    }
    if (!organizationId) {
      throw new Error('Organization ID is required for admin dashboard stats');
    }
    const stats = await userService.getAdminDashboardStats(organizationId);
    return { data: stats };
  },
};

export const organizationsAPI = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id) => Promise.resolve({ data: {} }),
  create: (data) => Promise.resolve({ data }),
  update: (id, data) => Promise.resolve({ data }),
  delete: (id) => Promise.resolve({ data: {} }),
  getRoles: (id) => Promise.resolve({ data: [] }),
};

export default api;
