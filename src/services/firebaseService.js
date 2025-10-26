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
    'reports:read:assigned',
    'rent:read:assigned',
    'rent:write:assigned',
    'rent:create:assigned',
  ],
  
  financial_viewer: [
    'reports:read:organization',
    'properties:read:organization',
    'payments:read:organization',
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
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: convertTimestamp(doc.data().startDate),
        endDate: convertTimestamp(doc.data().endDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      }));
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

  // Create payment
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

  // Get dashboard summary
  getDashboardSummary: async (userId) => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const payments = snapshot.docs.map(doc => doc.data());
      
      const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const thisMonth = new Date().getMonth() + 1;
      const thisYear = new Date().getFullYear();
      
      const thisMonthPayments = payments.filter(payment => 
        payment.month === thisMonth && payment.year === thisYear
      );
      
      const thisMonthAmount = thisMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      return {
        totalPayments: payments.length,
        totalAmount,
        thisMonthPayments: thisMonthPayments.length,
        thisMonthAmount,
        recentPayments: payments.slice(0, 5), // Last 5 payments
      };
    } catch (error) {
      handleFirebaseError(error, 'get dashboard summary');
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
  realtimeService,
};
