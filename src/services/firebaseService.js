import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Role permissions mapping (same as in Cloud Functions)
const ROLE_PERMISSIONS = {
  super_admin: [
    'system:admin',
    'system:config',
    'organizations:read:all',
    'organizations:write:all',
    'organizations:delete:all',
    'users:read:all',
    'users:write:all',
    'users:delete:all',
    'roles:read:all',
    'roles:write:all',
    'roles:delete:all',
    'properties:read:all',
    'properties:write:all',
    'properties:delete:all',
    'tenants:read:all',
    'tenants:write:all',
    'tenants:delete:all',
    'payments:read:all',
    'payments:write:all',
    'payments:create:all',
    'payments:delete:all',
    'reports:read:all',
    'reports:write:all',
    'assignments:read:all',
    'assignments:write:all',
    'rent:read:all',
    'rent:write:all',
    'rent:create:all',
    'invoices:read:all',
    'invoices:write:all',
    'invoices:create:all',
    'analytics:read:all',
  ],
  
  org_admin: [
    'users:read:organization',
    'users:write:organization',
    'users:delete:organization',
    'properties:read:organization',
    'properties:write:organization',
    'properties:delete:organization',
    'tenants:read:organization',
    'tenants:write:organization',
    'tenants:delete:organization',
    'payments:read:organization',
    'payments:write:organization',
    'payments:create:organization',
    'payments:delete:organization',
    'invoices:read:organization',
    'invoices:write:organization',
    'reports:read:organization',
    'reports:write:organization',
    'organization:settings:write',
    'assignments:read:organization',
    'assignments:write:organization',
  ],
  
  property_manager: [
    'properties:read:assigned',
    'properties:write:assigned',
    'properties:create:organization',
    'tenants:read:assigned',
    'tenants:write:assigned',
    'tenants:delete:assigned',
    'payments:read:assigned',
    'payments:write:assigned',
    'payments:create:assigned',
    'invoices:read:assigned',
    'invoices:write:assigned',
    'reports:read:assigned',
    'rent:read:assigned',
    'rent:write:assigned',
    'rent:create:assigned',
  ],
  
  financial_viewer: [
    'reports:read:organization',
    'properties:read:organization',
    'payments:read:organization',
    'invoices:read:organization',
    'analytics:read:organization',
  ],
};

// Helper function to handle Firebase errors
const handleFirebaseError = (error, operation = 'operation') => {
  console.error(`Firebase ${operation} error:`, error);
  // Safely extract error message
  const message = error?.message || error?.toString() || `Failed to ${operation}`;
  // Only show toast if message is a valid string
  if (message && typeof message === 'string') {
    toast.error(message);
  } else {
    toast.error(`Failed to ${operation}`);
  }
  throw error;
};

// Helper function to convert Firestore timestamp to JavaScript Date
const convertTimestamp = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper function to prepare data for Firestore (convert dates to timestamps)
const prepareDataForFirestore = (data) => {
  const prepared = { ...data };
  
  // Convert Date objects to Firestore timestamps
  Object.keys(prepared).forEach(key => {
    if (prepared[key] instanceof Date) {
      prepared[key] = serverTimestamp();
    }
  });
  
  return prepared;
};

// ==================== USER MANAGEMENT ====================

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          // Ensure permissions is always an array (fix for missing permissions field)
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          createdAt: convertTimestamp(data.createdAt),
          lastLoginAt: convertTimestamp(data.lastLoginAt),
          invitedAt: convertTimestamp(data.invitedAt),
          joinedAt: convertTimestamp(data.joinedAt),
        };
      }
      return null;
    } catch (error) {
      // Don't use toast here to avoid indexOf error
      console.error('Firebase get user profile error:', error);
      return null; // Return null instead of throwing
    }
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(userRef, updateData);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update user profile');
    }
  },

  // Create user profile (for new registrations)
  createProfile: async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const profileData = {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        status: userData.status || 'pending',
        roleId: userData.roleId || null,
        organizationId: userData.organizationId || null,
        permissions: userData.permissions || [],
      };
      await setDoc(userRef, profileData);
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'create user profile');
    }
  },

  // Get all users in organization
  getUsersByOrganization: async (organizationId) => {
    try {
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', organizationId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        lastLoginAt: convertTimestamp(doc.data().lastLoginAt),
      }));
    } catch (error) {
      handleFirebaseError(error, 'get organization users');
    }
  },

  // Update user role
  updateUserRole: async (userId, roleId, permissions = []) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        roleId,
        permissions,
        updatedAt: serverTimestamp(),
      });
      toast.success('User role updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update user role');
    }
  },

  // Get all users (for admin role assignment)
  getAllUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        lastLoginAt: convertTimestamp(doc.data().lastLoginAt),
        // Ensure permissions is always an array
        permissions: Array.isArray(doc.data().permissions) ? doc.data().permissions : [],
      }));
    } catch (error) {
      handleFirebaseError(error, 'get all users');
    }
  },

  // Get users by status (pending, active, rejected)
  getUsersByStatus: async (status) => {
    try {
      const q = query(
        collection(db, 'users'),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        lastLoginAt: convertTimestamp(doc.data().lastLoginAt),
        permissions: Array.isArray(doc.data().permissions) ? doc.data().permissions : [],
      }));
    } catch (error) {
      handleFirebaseError(error, 'get users by status');
    }
  },

  // Update user status (approve/reject)
  updateUserStatus: async (userId, status, roleId = null, organizationId = null) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        status,
        updatedAt: serverTimestamp(),
      };

      // If approving, set role and organization
      if (status === 'active' && roleId) {
        updateData.roleId = roleId;
        updateData.organizationId = organizationId;
        
        // Get permissions for the role
        const permissions = ROLE_PERMISSIONS[roleId] || [];
        updateData.permissions = permissions;
      }

      await updateDoc(userRef, updateData);
      
      const action = status === 'active' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated';
      toast.success(`User ${action} successfully`);
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update user status');
    }
  },

  // Get admin dashboard statistics
  getAdminDashboardStats: async (organizationId) => {
    try {
      // Fetch all properties
      const propertiesSnapshot = await getDocs(query(
        collection(db, 'properties'),
        where('organizationId', '==', organizationId)
      ));
      const properties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all payments
      const paymentsSnapshot = await getDocs(query(
        collection(db, 'payments'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      ));
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));

      // Fetch users by status
      const pendingUsers = await getDocs(query(
        collection(db, 'users'),
        where('status', '==', 'pending')
      ));

      // Fetch active users
      const activeUsersSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('status', '==', 'active')
      ));

      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      // Calculate this month's revenue
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const thisMonthPayments = payments.filter(payment => {
        const paymentDate = payment.createdAt;
        return paymentDate && paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
      });
      const thisMonthRevenue = thisMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Calculate last month's revenue for growth
      const lastMonthPayments = payments.filter(payment => {
        const paymentDate = payment.createdAt;
        const lastMonth = thisMonth > 0 ? thisMonth - 1 : 11;
        const lastMonthYear = thisMonth > 0 ? thisYear : thisYear - 1;
        return paymentDate && paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
      });
      const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const monthlyGrowth = lastMonthRevenue > 0 
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
        : 0;

      // Calculate collection rate
      const totalProperties = properties.length;
      const collectionRate = payments.length > 0 ? 85 : 0; // Simplified
      const occupancyRate = properties.length > 0 ? 75 : 0; // Simplified

      // Get pending approvals
      const pendingApprovals = pendingUsers.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, 5);

      // Get top properties
      const topProperties = properties.slice(0, 5).map(property => ({
        name: property.name,
        revenue: property.buildingDetails || property.landDetails ? 5000 : 0,
        occupancy: 80,
        trend: 'up'
      }));

      // Get recent activities (last 5 payments)
      const recentActivities = payments.slice(0, 5).map(payment => ({
        id: payment.id,
        message: `Payment of ${payment.amount} received from ${payment.tenantName || 'Unknown'}`,
        type: 'payment',
        status: 'success',
        time: payment.createdAt
      }));

      return {
        stats: {
          totalRevenue,
          monthlyGrowth,
          totalProperties,
          activeUsers: activeUsersSnapshot.docs.length,
          pendingApprovals: pendingUsers.docs.length,
          collectionRate,
          occupancyRate
        },
        recentActivities,
        pendingApprovals,
        topProperties
      };
    } catch (error) {
      handleFirebaseError(error, 'get admin dashboard stats');
      throw error;
    }
  },

  // Get system-wide dashboard statistics (super admin)
  getSystemDashboardStats: async () => {
    try {
      // Fetch all properties (no org filter)
      const propertiesSnapshot = await getDocs(
        query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        )
      );
      const properties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all payments (no org filter)
      const paymentsSnapshot = await getDocs(
        query(
          collection(db, 'payments'),
          orderBy('createdAt', 'desc')
        )
      );
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));

      // Fetch users by status
      const pendingUsers = await getDocs(query(
        collection(db, 'users'),
        where('status', '==', 'pending')
      ));
      const activeUsersSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('status', '==', 'active')
      ));

      // Calculate totals
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const thisMonthPayments = payments.filter(p => p.createdAt && p.createdAt.getMonth() === thisMonth && p.createdAt.getFullYear() === thisYear);
      const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const lastMonth = thisMonth > 0 ? thisMonth - 1 : 11;
      const lastMonthYear = thisMonth > 0 ? thisYear : thisYear - 1;
      const lastMonthPayments = payments.filter(p => p.createdAt && p.createdAt.getMonth() === lastMonth && p.createdAt.getFullYear() === lastMonthYear);
      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const monthlyGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      // Simplified placeholders for rates
      const collectionRate = payments.length > 0 ? 85 : 0;
      const occupancyRate = properties.length > 0 ? 75 : 0;

      // Top properties (simple placeholder ranking)
      const topProperties = properties.slice(0, 5).map(property => ({
        name: property.name,
        revenue: property.buildingDetails || property.landDetails ? 5000 : 0,
        occupancy: 80,
        trend: 'up'
      }));

      // Recent activities (last 5 payments)
      const recentActivities = payments.slice(0, 5).map(payment => ({
        id: payment.id,
        message: `Payment of ${payment.amount} received from ${payment.tenantName || 'Unknown'}`,
        type: 'payment',
        status: 'success',
        time: payment.createdAt
      }));

      return {
        stats: {
          totalRevenue,
          monthlyGrowth,
          totalProperties: properties.length,
          activeUsers: activeUsersSnapshot.docs.length,
          pendingApprovals: pendingUsers.docs.length,
          collectionRate,
          occupancyRate
        },
        recentActivities,
        pendingApprovals: pendingUsers.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() })),
        topProperties
      };
    } catch (error) {
      handleFirebaseError(error, 'get system dashboard stats');
      throw error;
    }
  },
};

// ==================== PROPERTY MANAGEMENT ====================

export const propertyService = {
  // Get all properties for user (role-based access)
  getAll: async (userId, userRole = null, organizationId = null) => {
    try {
      console.log('🔍 Fetching properties with:', { userId, userRole, organizationId });
      console.log('🔍 Type checks:', { 
        userIdType: typeof userId, 
        userRoleType: typeof userRole, 
        organizationIdType: typeof organizationId 
      });
      
      let q;
      
      // If no role or organization, try to get all properties without filters
      if (!userRole && !organizationId && !userId) {
        console.log('⚠️ No auth data provided - fetching all properties');
        q = query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        );
      }
      // Super admin can see all properties
      else if (userRole === 'super_admin') {
        console.log('📊 Query: Super admin - all properties');
        q = query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        );
      }
      // Org admin can see properties in their organization
      else if (userRole === 'org_admin' && organizationId) {
        console.log('📊 Query: Org admin - organizationId:', organizationId);
        q = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Property manager can see properties in their organization
      else if (userRole === 'property_manager' && organizationId) {
        console.log('📊 Query: Property manager - organizationId:', organizationId);
        q = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Financial viewer can see properties in their organization
      else if (userRole === 'financial_viewer' && organizationId) {
        console.log('📊 Query: Financial viewer - organizationId:', organizationId);
        q = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // If we have organizationId but no specific role match, use it
      else if (organizationId) {
        console.log('📊 Query: Using organizationId:', organizationId);
        q = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Fallback to user's properties (for backward compatibility)
      else if (userId) {
        console.log('📊 Query: Fallback - userId:', userId);
        q = query(
          collection(db, 'properties'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      // Last resort - get all properties
      else {
        console.log('📊 Query: Last resort - all properties (no filters)');
        q = query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        );
      }
      
      console.log('📊 Executing query...');
      const snapshot = await getDocs(q);
      console.log(`📊 Query returned ${snapshot.size} documents`);
      
      const properties = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`📄 Property: ${doc.id}`, { 
          name: data.name, 
          organizationId: data.organizationId,
          userId: data.userId 
        });
        return {
          id: doc.id,
          ...data,
          establishmentDate: convertTimestamp(data.establishmentDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
      
      console.log(`✅ Found ${properties.length} properties`);
      return properties;
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      handleFirebaseError(error, 'get properties');
      return []; // Return empty array instead of throwing
    }
  },

  // Get property by ID
  getById: async (propertyId) => {
    try {
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        const data = propertyDoc.data();
        return {
          id: propertyDoc.id,
          ...data,
          establishmentDate: convertTimestamp(data.establishmentDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      handleFirebaseError(error, 'get property');
    }
  },

  // Create new property
  create: async (propertyData, userId, userRole = null, organizationId = null) => {
    try {
      const data = prepareDataForFirestore({
        ...propertyData,
        userId,
        organizationId: organizationId || propertyData.organizationId,
        assignedManagers: propertyData.assignedManagers || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const docRef = await addDoc(collection(db, 'properties'), data);
      toast.success('Property created successfully');
      return { id: docRef.id, success: true };
    } catch (error) {
      handleFirebaseError(error, 'create property');
    }
  },

  // Update property
  update: async (propertyId, data) => {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(propertyRef, updateData);
      toast.success('Property updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update property');
    }
  },

  // Delete property
  delete: async (propertyId) => {
    try {
      await deleteDoc(doc(db, 'properties', propertyId));
      toast.success('Property deleted successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'delete property');
    }
  },

  // Get property statistics
  getStats: async (propertyId) => {
    try {
      // Get rent records for this property
      const rentQuery = query(
        collection(db, 'rent'),
        where('propertyId', '==', propertyId)
      );
      const rentSnapshot = await getDocs(rentQuery);
      
      // Get payments for this property
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('propertyId', '==', propertyId)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      const totalRent = rentSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().monthlyRent || 0);
      }, 0);
      
      const totalPayments = paymentsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().amount || 0);
      }, 0);
      
      return {
        totalRent,
        totalPayments,
        collectionRate: totalRent > 0 ? (totalPayments / totalRent) * 100 : 0,
        rentRecords: rentSnapshot.docs.length,
        paymentRecords: paymentsSnapshot.docs.length,
      };
    } catch (error) {
      handleFirebaseError(error, 'get property stats');
    }
  },
};

// ==================== RENT MANAGEMENT ====================

export const rentService = {
  // Get all rent records (role-based access with aggressive fallbacks)
  getAll: async (userId, userRole = null, organizationId = null) => {
    try {
      console.log('🔍 rentService.getAll called with:', { userId, userRole, organizationId });
      
      let q;
      let fallbackAttempt = 0;
      
      // Super admin can see all rent records
      if (userRole === 'super_admin') {
        console.log('📊 Query strategy: Super admin - all records');
        q = query(
          collection(db, 'rent'),
          orderBy('createdAt', 'desc')
        );
      }
      // Org admin can see rent records in their organization
      else if (userRole === 'org_admin' && organizationId) {
        console.log('📊 Query strategy: Org admin - organizationId:', organizationId);
        q = query(
          collection(db, 'rent'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Property manager can see rent records in their organization
      else if (userRole === 'property_manager' && organizationId) {
        console.log('📊 Query strategy: Property manager - organizationId:', organizationId);
        q = query(
          collection(db, 'rent'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Financial viewer can see rent records in their organization
      else if (userRole === 'financial_viewer' && organizationId) {
        console.log('📊 Query strategy: Financial viewer - organizationId:', organizationId);
        q = query(
          collection(db, 'rent'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // AGGRESSIVE FALLBACK: If we have organizationId but no specific role match
      else if (organizationId) {
        console.log('📊 Query strategy: Fallback with organizationId:', organizationId);
        fallbackAttempt = 1;
        q = query(
          collection(db, 'rent'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // AGGRESSIVE FALLBACK: Try with userId
      else if (userId) {
        console.log('📊 Query strategy: Fallback with userId:', userId);
        fallbackAttempt = 2;
        q = query(
          collection(db, 'rent'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      // LAST RESORT: Get all rent records (let Firestore rules handle access)
      else {
        console.log('📊 Query strategy: Last resort - all records (Firestore rules will filter)');
        fallbackAttempt = 3;
        q = query(
          collection(db, 'rent'),
          orderBy('createdAt', 'desc')
        );
      }
      
      console.log('📊 Executing rent query...');
      const snapshot = await getDocs(q);
      console.log(`📊 Rent query returned ${snapshot.size} documents (fallbackAttempt: ${fallbackAttempt})`);
      
      const records = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`📄 Rent record: ${doc.id}`, { 
          tenant: data.tenantName,
          property: data.propertyName,
          amount: data.monthlyRent,
          organizationId: data.organizationId 
        });
        return {
          id: doc.id,
          ...data,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          leaseStart: convertTimestamp(data.leaseStart),
          leaseEnd: convertTimestamp(data.leaseEnd),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
      
      console.log(`✅ Returning ${records.length} rent records`);
      return records;
    } catch (error) {
      console.error('❌ Error fetching rent records:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // DON'T throw - return empty array instead
      return [];
    }
  },

  // Get rent records by property
  getByProperty: async (propertyId) => {
    try {
      const q = query(
        collection(db, 'rent'),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          leaseStart: convertTimestamp(data.leaseStart),
          leaseEnd: convertTimestamp(data.leaseEnd),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
    } catch (error) {
      handleFirebaseError(error, 'get rent records by property');
    }
  },

  // Create rent record
  create: async (rentData, userId, userRole = null, organizationId = null) => {
    try {
      const data = prepareDataForFirestore({
        ...rentData,
        userId,
        organizationId: organizationId || rentData.organizationId,
        propertyManagerIds: rentData.propertyManagerIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const docRef = await addDoc(collection(db, 'rent'), data);
      toast.success('Rent record created successfully');
      return { id: docRef.id, success: true };
    } catch (error) {
      handleFirebaseError(error, 'create rent record');
    }
  },

  // Update rent record
  update: async (rentId, data) => {
    try {
      const rentRef = doc(db, 'rent', rentId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(rentRef, updateData);
      toast.success('Rent record updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update rent record');
    }
  },

  // Delete rent record
  delete: async (rentId) => {
    try {
      await deleteDoc(doc(db, 'rent', rentId));
      toast.success('Rent record deleted successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'delete rent record');
    }
  },
};

// ==================== PAYMENT MANAGEMENT ====================

// Helper function to generate or update invoice based on payment
const generateOrUpdateInvoice = async (paymentData, paymentId, userId, organizationId) => {
  try {
    const { rentId, amount, propertyId, tenantName, propertyName } = paymentData;
    
    // Check if an invoice already exists for this rent record
    const q = query(
      collection(db, 'invoices'),
      where('rentId', '==', rentId),
      orderBy('invoiceDate', 'desc')
    );
    const existingInvoices = await getDocs(q);
    const invoices = existingInvoices.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    let invoiceToUpdate = invoices.find(inv => 
      inv.status === 'pending' || inv.status === 'partially_paid'
    );
    
    if (!invoiceToUpdate) {
      // Get rent record to get monthly amount
      const rentRecord = await getDoc(doc(db, 'rent', rentId));
      const rentData = rentRecord.data();
      
      // Create new invoice
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        rentId: rentId,
        propertyId: propertyId,
        propertyName: propertyName,
        tenantName: tenantName,
        invoiceDate: serverTimestamp(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount: rentData.monthlyRent || amount,
        amountPaid: amount,
        amountDue: (rentData.monthlyRent || amount) - amount,
        status: amount >= (rentData.monthlyRent || amount) ? 'paid' : amount > 0 ? 'partially_paid' : 'pending',
        paymentIds: [paymentId],
        description: `Monthly rent for ${propertyName}`,
        userId: userId,
        organizationId: organizationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'invoices'), invoiceData);
    } else {
      // Update existing invoice with new payment
      const invoiceRef = doc(db, 'invoices', invoiceToUpdate.id);
      const updatedAmountPaid = (invoiceToUpdate.amountPaid || 0) + amount;
      const updatedAmountDue = invoiceToUpdate.totalAmount - updatedAmountPaid;
      const newStatus = updatedAmountDue <= 0 ? 'paid' : updatedAmountPaid > 0 ? 'partially_paid' : 'pending';
      
      await updateDoc(invoiceRef, {
        amountPaid: updatedAmountPaid,
        amountDue: updatedAmountDue,
        status: newStatus,
        paymentIds: [...(invoiceToUpdate.paymentIds || []), paymentId],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error generating/updating invoice:', error);
    throw error;
  }
};

// ==================== INVOICE MANAGEMENT ====================

export const invoiceService = {
  // Get all invoices (role-based access)
  getAll: async (userId, userRole = null, organizationId = null) => {
    try {
      let q;
      
      // Temporary: Query without orderBy until index is built
      if (userRole === 'super_admin') {
        q = query(collection(db, 'invoices'));
      } else if (userRole === 'org_admin' && organizationId) {
        q = query(
          collection(db, 'invoices'),
          where('organizationId', '==', organizationId)
        );
      } else if (userRole === 'property_manager' && organizationId) {
        q = query(
          collection(db, 'invoices'),
          where('organizationId', '==', organizationId)
        );
      } else {
        q = query(collection(db, 'invoices'), where('userId', '==', userId));
      }
      
      const snapshot = await getDocs(q);
      
      // Sort by createdAt in descending order after fetching
      // This is a temporary workaround until the Firestore index is built
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const dateA = a.data().createdAt?.toDate?.() || new Date(a.data().createdAt);
        const dateB = b.data().createdAt?.toDate?.() || new Date(b.data().createdAt);
        return dateB - dateA;
      });
      
      return sortedDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestamp(doc.data().dueDate),
        invoiceDate: convertTimestamp(doc.data().invoiceDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
    } catch (error) {
      handleFirebaseError(error, 'get invoices');
      return [];
    }
  },

  // Get invoice by ID
  getById: async (invoiceId) => {
    try {
      const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        return {
          id: invoiceDoc.id,
          ...data,
          dueDate: convertTimestamp(data.dueDate),
          invoiceDate: convertTimestamp(data.invoiceDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      handleFirebaseError(error, 'get invoice');
    }
  },

  // Get invoices by rent record (for a specific space/tenant)
  getByRentId: async (rentId) => {
    try {
      // Temporary: Query without orderBy until index is built
      const q = query(
        collection(db, 'invoices'),
        where('rentId', '==', rentId)
      );
      const snapshot = await getDocs(q);
      
      // Sort by invoiceDate in descending order after fetching
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const dateA = a.data().invoiceDate?.toDate?.() || new Date(a.data().invoiceDate);
        const dateB = b.data().invoiceDate?.toDate?.() || new Date(b.data().invoiceDate);
        return dateB - dateA;
      });
      
      return sortedDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestamp(doc.data().dueDate),
        invoiceDate: convertTimestamp(doc.data().invoiceDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
    } catch (error) {
      handleFirebaseError(error, 'get invoices by rent');
      return [];
    }
  },

  // Create invoice
  create: async (invoiceData, userId, userRole = null, organizationId = null) => {
    try {
      const data = {
        ...invoiceData,
        userId,
        organizationId: organizationId || invoiceData.organizationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Remove undefined values to avoid Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, 'invoices'), cleanData);
      toast.success('Invoice created successfully');
      return { id: docRef.id, success: true };
    } catch (error) {
      handleFirebaseError(error, 'create invoice');
    }
  },

  // Update invoice (e.g., when payment is received)
  update: async (invoiceId, data) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(invoiceRef, updateData);
      toast.success('Invoice updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update invoice');
    }
  },

  // Delete invoice
  delete: async (invoiceId) => {
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
      toast.success('Invoice deleted successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'delete invoice');
    }
  },

  // Auto-generate monthly invoices for active rent agreements
  generateMonthlyInvoices: async (userId, userRole = null, organizationId = null) => {
    try {
      console.log('📅 Generating monthly invoices...');
      
      // Get all active rent records
      const activeRents = await rentService.getAll(userId, userRole, organizationId);
      
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const generatedInvoices = [];
      
      for (const rent of activeRents) {
        if (rent.status !== 'active') continue;
        
        // Check if invoice already exists for this month
        const existingInvoices = await invoiceService.getByRentId(rent.id);
        const hasCurrentMonthInvoice = existingInvoices.some(inv => {
          const invDate = new Date(inv.invoiceDate);
          return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
        });
        
        if (hasCurrentMonthInvoice) {
          console.log(`⏭️  Skipping ${rent.tenantName} - invoice already exists for current month`);
          continue;
        }
        
        // Generate invoice number
        const invoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${rent.id.slice(-4)}`;
        
        // Calculate due date (typically end of month or custom day)
        const dueDate = new Date(currentYear, currentMonth + 1, rent.paymentDueDate || 1);
        
        // Create invoice
        const invoiceData = {
          invoiceNumber,
          rentId: rent.id,
          propertyId: rent.propertyId || null,
          propertyName: rent.propertyName || 'Unknown Property',
          spaceName: rent.spaceName || null,
          tenantId: rent.tenantId || null,
          tenantName: rent.tenantName || 'Unknown Tenant',
          invoiceDate: new Date(),
          dueDate: dueDate,
          totalAmount: rent.monthlyRent || 0,
          amountPaid: 0,
          amountDue: rent.monthlyRent || 0,
          status: 'pending',
          paymentIds: [],
          description: `Monthly rent for ${rent.propertyName || 'Unknown Property'}${rent.spaceName ? ` - ${rent.spaceName}` : ''}`,
          userId: userId,
          organizationId: organizationId || rent.organizationId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Remove undefined values to avoid Firestore errors
        const cleanInvoiceData = Object.fromEntries(
          Object.entries(invoiceData).filter(([_, value]) => value !== undefined)
        );
        
        const result = await invoiceService.create(cleanInvoiceData, userId, userRole, organizationId);
        if (result) {
          generatedInvoices.push({ ...invoiceData, id: result.id });
        }
      }
      
      if (generatedInvoices.length > 0) {
        toast.success(`Generated ${generatedInvoices.length} monthly invoices`);
      }
      
      return generatedInvoices;
    } catch (error) {
      console.error('Error generating monthly invoices:', error);
      handleFirebaseError(error, 'generate monthly invoices');
      return [];
    }
  },

  // Get invoice status summary
  getStatusSummary: async (userId, userRole = null, organizationId = null) => {
    try {
      const invoices = await invoiceService.getAll(userId, userRole, organizationId);
      
      return {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        partiallyPaid: invoices.filter(inv => inv.status === 'partially_paid').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < new Date()).length,
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        totalPaid: invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0),
        totalDue: invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0),
      };
    } catch (error) {
      console.error('Error getting invoice status summary:', error);
      return null;
    }
  },
};

// ==================== PAYMENT MANAGEMENT ====================

export const paymentService = {
  // Get all payments (role-based access with aggressive fallbacks)
  getAll: async (userId, userRole = null, organizationId = null, filters = {}) => {
    try {
      console.log('🔍 paymentService.getAll called with:', { userId, userRole, organizationId });
      
      let q;
      
      // Super admin can see all payments
      if (userRole === 'super_admin') {
        console.log('📊 Payment query: Super admin - all payments');
        q = query(
          collection(db, 'payments'),
          orderBy('paymentDate', 'desc')
        );
      }
      // Org admin can see payments in their organization
      else if (userRole === 'org_admin' && organizationId) {
        console.log('📊 Payment query: Org admin - organizationId:', organizationId);
        q = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('paymentDate', 'desc')
        );
      }
      // Property manager can see payments in their organization
      else if (userRole === 'property_manager' && organizationId) {
        console.log('📊 Payment query: Property manager - organizationId:', organizationId);
        q = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('paymentDate', 'desc')
        );
      }
      // Financial viewer can see payments in their organization
      else if (userRole === 'financial_viewer' && organizationId) {
        console.log('📊 Payment query: Financial viewer - organizationId:', organizationId);
        q = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('paymentDate', 'desc')
        );
      }
      // AGGRESSIVE FALLBACK: If we have organizationId
      else if (organizationId) {
        console.log('📊 Payment query: Fallback with organizationId:', organizationId);
        q = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('paymentDate', 'desc')
        );
      }
      // AGGRESSIVE FALLBACK: Try with userId
      else if (userId) {
        console.log('📊 Payment query: Fallback with userId:', userId);
        q = query(
          collection(db, 'payments'),
          where('userId', '==', userId),
          orderBy('paymentDate', 'desc')
        );
      }
      // LAST RESORT: Get all payments
      else {
        console.log('📊 Payment query: Last resort - all payments');
        q = query(
          collection(db, 'payments'),
          orderBy('paymentDate', 'desc')
        );
      }
      
      // Apply additional filters
      if (filters.propertyId) {
        q = query(q, where('propertyId', '==', filters.propertyId));
      }
      if (filters.month) {
        q = query(q, where('month', '==', filters.month));
      }
      if (filters.year) {
        q = query(q, where('year', '==', filters.year));
      }
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      console.log(`📊 Payment query returned ${snapshot.size} documents`);
      
      const payments = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`💳 Payment: ${doc.id}`, { 
          amount: data.amount,
          date: data.paymentDate,
          organizationId: data.organizationId 
        });
        return {
          id: doc.id,
          ...data,
          paymentDate: convertTimestamp(data.paymentDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
      
      console.log(`✅ Returning ${payments.length} payments`);
      return payments;
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      // DON'T throw - return empty array instead
      return [];
    }
  },

  // Get payment by ID
  getById: async (paymentId) => {
    try {
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      if (paymentDoc.exists()) {
        const data = paymentDoc.data();
        return {
          id: paymentDoc.id,
          ...data,
          paymentDate: convertTimestamp(data.paymentDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      handleFirebaseError(error, 'get payment');
    }
  },

  // Create payment and update associated invoice
  create: async (paymentData, userId, userRole = null, organizationId = null) => {
    try {
      const data = prepareDataForFirestore({
        ...paymentData,
        userId,
        organizationId: organizationId || paymentData.organizationId,
        propertyManagerIds: paymentData.propertyManagerIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const docRef = await addDoc(collection(db, 'payments'), data);
      
      // If there's an associated invoice, update it
      if (paymentData.invoiceId) {
        try {
          const invoice = await invoiceService.getById(paymentData.invoiceId);
          if (invoice) {
            const updatedAmountPaid = (invoice.amountPaid || 0) + paymentData.amount;
            const updatedAmountDue = invoice.totalAmount - updatedAmountPaid;
            const newStatus = updatedAmountDue <= 0 ? 'paid' : updatedAmountPaid > 0 ? 'partially_paid' : 'pending';
            
            await invoiceService.update(paymentData.invoiceId, {
              amountPaid: updatedAmountPaid,
              amountDue: updatedAmountDue,
              status: newStatus,
              paymentIds: [...(invoice.paymentIds || []), docRef.id],
              updatedAt: new Date(),
            });
          }
        } catch (invoiceError) {
          console.error('Invoice update failed:', invoiceError);
          // Don't fail the payment if invoice update fails
        }
      }
      
      toast.success('Payment recorded successfully');
      return { id: docRef.id, success: true };
    } catch (error) {
      handleFirebaseError(error, 'create payment');
    }
  },

  // Update payment
  update: async (paymentId, data) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(paymentRef, updateData);
      toast.success('Payment updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update payment');
    }
  },

  // Delete payment
  delete: async (paymentId) => {
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
      toast.success('Payment deleted successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'delete payment');
    }
  },

  // Get dashboard summary - Comprehensive data from properties and payments
  getDashboardSummary: async (userId, userRole = null, organizationId = null) => {
    try {
      console.log('📊 Fetching dashboard summary with:', { userId, userRole, organizationId });
      
      // Build query based on RBAC
      let propertiesQuery;
      if (userRole === 'super_admin') {
        // Super admin sees all
        propertiesQuery = query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'org_admin' && organizationId) {
        // Org admin sees organization properties
        propertiesQuery = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'property_manager' && organizationId) {
        // Property manager sees organization properties
        propertiesQuery = query(
          collection(db, 'properties'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Default: user's properties
        propertiesQuery = query(
          collection(db, 'properties'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const properties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📊 Fetched ${properties.length} properties`);

      // Calculate total properties and spaces
      const totalProperties = properties.length;
      const totalSpaces = properties.reduce((total, property) => {
        if (property.type === 'building' && property.buildingDetails?.floors) {
          return total + property.buildingDetails.floors.reduce((floorTotal, floor) => {
            return floorTotal + (floor.spaces?.length || 0);
          }, 0);
        }
        if (property.type === 'land' && property.landDetails?.squatters) {
          return total + property.landDetails.squatters.length;
        }
        return total;
      }, 0);

      // Fetch all payments based on RBAC
      let paymentsQuery;
      if (userRole === 'super_admin') {
        // Super admin sees all payments
        paymentsQuery = query(
          collection(db, 'payments'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'org_admin' && organizationId) {
        // Org admin sees organization payments
        paymentsQuery = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'property_manager' && organizationId) {
        // Property manager sees organization payments
        paymentsQuery = query(
          collection(db, 'payments'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Default: user's payments
        paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));
      
      console.log(`📊 Fetched ${payments.length} payments`);

      // Get current date info
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      // Calculate expected monthly rent from properties
      const expectedMonthlyRent = properties.reduce((total, property) => {
        if (property.type === 'building' && property.buildingDetails?.floors) {
          return total + property.buildingDetails.floors.reduce((floorTotal, floor) => {
            return floorTotal + (floor.spaces?.reduce((spaceTotal, space) => 
              spaceTotal + (space.monthlyRent || 0), 0) || 0);
          }, 0);
        }
        if (property.type === 'land' && property.landDetails?.squatters) {
          return total + property.landDetails.squatters.reduce((squatterTotal, squatter) => 
            squatterTotal + (squatter.monthlyPayment || 0), 0);
        }
        return total;
      }, 0);

      // Filter payments by month
      const filterPaymentsByMonth = (payments, month, year) => {
        return payments.filter(payment => {
          const paymentDate = payment.createdAt;
          return paymentDate && paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
        });
      };

      const thisMonthPayments = filterPaymentsByMonth(payments, thisMonth, thisYear);
      const lastMonthPayments = thisMonth > 0 
        ? filterPaymentsByMonth(payments, thisMonth - 1, thisYear)
        : filterPaymentsByMonth(payments, 11, thisYear - 1);

      // Calculate amounts
      const thisMonthCollected = thisMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const lastMonthCollected = lastMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      // Calculate collection rates
      const thisMonthCollectionRate = expectedMonthlyRent > 0 
        ? Math.round((thisMonthCollected / expectedMonthlyRent) * 100) 
        : 0;
      const lastMonthCollectionRate = expectedMonthlyRent > 0 
        ? Math.round((lastMonthCollected / expectedMonthlyRent) * 100) 
        : 0;

      // Get recent payments with property and tenant info
      const recentPayments = payments.slice(0, 5).map(payment => {
        const property = properties.find(p => p.id === payment.propertyId);
        return {
          id: payment.id,
          amount: payment.amount || 0,
          paymentDate: payment.createdAt,
          propertyName: property?.name || 'Unknown Property',
          tenantName: payment.tenantName || 'Unknown Tenant',
          paymentMethod: payment.paymentMethod || 'cash'
        };
      });

      // Base summary
      const baseSummary = {
        totalProperties,
        totalSpaces,
        thisMonth: {
          collected: thisMonthCollected,
          expected: expectedMonthlyRent,
          payments: thisMonthPayments.length,
          collectionRate: thisMonthCollectionRate
        },
        lastMonth: {
          collected: lastMonthCollected,
          expected: expectedMonthlyRent,
          payments: lastMonthPayments.length,
          collectionRate: lastMonthCollectionRate
        },
        recentPayments
      };

      // If super admin, compute detailed system-wide matrix
      if (userRole === 'super_admin') {
        // Total users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Total organizations (derive from properties and users organizationId)
        const orgIdsFromProps = new Set(properties.map(p => p.organizationId).filter(Boolean));
        const orgIdsFromUsers = new Set(usersSnapshot.docs.map(d => d.data().organizationId).filter(Boolean));
        const mergedOrgIds = new Set([...orgIdsFromProps, ...orgIdsFromUsers]);
        const totalOrganizations = mergedOrgIds.size;

        // Payment method breakdown
        const paymentMethodCounts = payments.reduce((acc, p) => {
          const method = p.paymentMethod || 'cash';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {});

        // Aggregate by organization
        const orgAggregation = {};
        payments.forEach(p => {
          const orgId = p.organizationId || 'unknown';
          if (!orgAggregation[orgId]) {
            orgAggregation[orgId] = {
              organizationId: orgId,
              payments: 0,
              collected: 0
            };
          }
          orgAggregation[orgId].payments += 1;
          orgAggregation[orgId].collected += (p.amount || 0);
        });
        // Convert to array and pick top 5
        const topOrganizations = Object.values(orgAggregation)
          .sort((a, b) => b.collected - a.collected)
          .slice(0, 5);

        // Overdue invoices and aging buckets
        const allInvoices = await invoiceService.getAll(userId, userRole, organizationId);
        const today = new Date();
        const overdueInvoices = allInvoices.filter(inv => inv.status !== 'paid' && inv.dueDate && new Date(inv.dueDate) < today);
        const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        overdueInvoices.forEach(inv => {
          const due = new Date(inv.dueDate);
          const days = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          if (days <= 30) aging['0-30'] += 1;
          else if (days <= 60) aging['31-60'] += 1;
          else if (days <= 90) aging['61-90'] += 1;
          else aging['90+'] += 1;
        });

        // System-wide collection KPI this month
        const systemThisMonthCollected = thisMonthCollected;
        const systemThisMonthExpected = expectedMonthlyRent;
        const systemThisMonthPayments = thisMonthPayments.length;
        const systemCollectionRate = thisMonthCollectionRate;

        return {
          ...baseSummary,
          totalOrganizations,
          totalUsers,
          paymentMethodCounts,
          topOrganizations,
          overdue: {
            count: overdueInvoices.length,
            aging
          },
          systemThisMonthCollected,
          systemThisMonthExpected,
          systemThisMonthPayments,
          systemCollectionRate,
        };
      }

      return baseSummary;
    } catch (error) {
      handleFirebaseError(error, 'get dashboard summary');
      throw error;
    }
  },
};

// ==================== TENANT MANAGEMENT ====================

export const tenantService = {
  // Get all tenants (role-based access)
  getAll: async (userId, userRole = null, organizationId = null) => {
    try {
      let q;
      
      // Super admin can see all tenants
      if (userRole === 'super_admin') {
        q = query(
          collection(db, 'tenants'),
          orderBy('createdAt', 'desc')
        );
      }
      // Org admin can see tenants in their organization
      else if (userRole === 'org_admin' && organizationId) {
        q = query(
          collection(db, 'tenants'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Property manager can see tenants for assigned properties
      else if (userRole === 'property_manager') {
        q = query(
          collection(db, 'tenants'),
          where('propertyManagerIds', 'array-contains', userId),
          orderBy('createdAt', 'desc')
        );
      }
      // Financial viewer can see tenants in their organization
      else if (userRole === 'financial_viewer' && organizationId) {
        q = query(
          collection(db, 'tenants'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }
      // Fallback to user's tenants (for backward compatibility)
      else {
        q = query(
          collection(db, 'tenants'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
    } catch (error) {
      handleFirebaseError(error, 'get tenants');
    }
  },

  // Get tenants by property
  getByProperty: async (propertyId) => {
    try {
      const q = query(
        collection(db, 'tenants'),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
    } catch (error) {
      handleFirebaseError(error, 'get tenants by property');
    }
  },

  // Create tenant
  create: async (tenantData, userId, userRole = null, organizationId = null) => {
    try {
      const data = prepareDataForFirestore({
        ...tenantData,
        userId,
        organizationId: organizationId || tenantData.organizationId,
        propertyManagerIds: tenantData.propertyManagerIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const docRef = await addDoc(collection(db, 'tenants'), data);
      toast.success('Tenant created successfully');
      return { id: docRef.id, success: true };
    } catch (error) {
      handleFirebaseError(error, 'create tenant');
    }
  },

  // Update tenant
  update: async (tenantId, data) => {
    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(tenantRef, updateData);
      toast.success('Tenant updated successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'update tenant');
    }
  },

  // Delete tenant
  delete: async (tenantId) => {
    try {
      await deleteDoc(doc(db, 'tenants', tenantId));
      toast.success('Tenant deleted successfully');
      return { success: true };
    } catch (error) {
      handleFirebaseError(error, 'delete tenant');
    }
  },
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const realtimeService = {
  // Subscribe to properties changes
  subscribeToProperties: (userId, callback) => {
    const q = query(
      collection(db, 'properties'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        establishmentDate: convertTimestamp(doc.data().establishmentDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
      callback(properties);
    });
  },

  // Subscribe to payments changes
  subscribeToPayments: (userId, callback) => {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('paymentDate', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: convertTimestamp(doc.data().paymentDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
      callback(payments);
    });
  },

  // Subscribe to rent records changes
  subscribeToRentRecords: (userId, callback) => {
    const q = query(
      collection(db, 'rent'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const rentRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: convertTimestamp(doc.data().startDate),
        endDate: convertTimestamp(doc.data().endDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
      callback(rentRecords);
    });
  },
};

export default {
  userService,
  propertyService,
  rentService,
  paymentService,
  tenantService,
  invoiceService,
  realtimeService,
};
