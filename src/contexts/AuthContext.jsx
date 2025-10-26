import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/firebaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [needsRoleAssignment, setNeedsRoleAssignment] = useState(false);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user profile in Firestore with pending status
      await userService.createProfile(result.user.uid, {
        email: result.user.email,
        displayName: displayName || result.user.email,
        uid: result.user.uid,
        status: 'pending', // User must be approved by admin
        roleId: null, // No role assigned yet
        organizationId: null, // No organization yet
        permissions: [],
        createdAt: new Date(),
      });
      
      // Sign out immediately after registration
      await signOut(auth);
      
      toast.success('Account created! Please wait for admin approval before logging in.');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  // Sign in with email and password (using Custom Claims)
  const signin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token with custom claims
      const tokenResult = await result.user.getIdTokenResult();
      const claims = tokenResult.claims;
      
      console.log('🔐 User claims:', claims);
      
      // Check if user has role assigned (via custom claims)
      if (!claims.role || claims.status !== 'active') {
        // TEMPORARY WORKAROUND: If no custom claims, try to get role from Firestore
        console.log('⚠️ No custom claims found, checking Firestore profile...');
        
        try {
          const profile = await userService.getProfile(result.user.uid);
          if (profile && profile.roleId && profile.status === 'active') {
            console.log('✅ Found role in Firestore profile:', profile.roleId);
            
            // Set state from Firestore profile (temporary workaround)
            setUserRole(profile.roleId);
            setUserPermissions(profile.permissions || []);
            setOrganizationId(profile.organizationId || null);
            setNeedsRoleAssignment(false);
            
            // Store in localStorage for API service access
            localStorage.setItem('userRole', profile.roleId);
            localStorage.setItem('organizationId', profile.organizationId || '');
            localStorage.setItem('userId', result.user.uid);
            
            toast.success('Signed in successfully!');
            return result;
          }
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
        }
        
        // If no role found in Firestore either, reject signin
        await signOut(auth);
        
        const statusMessage = !claims.role 
          ? 'Your account is awaiting role assignment by an administrator.'
          : claims.status === 'rejected'
          ? 'Your account access has been rejected. Please contact support.'
          : 'Your account is pending approval by an administrator.';
        
        toast.error(statusMessage);
        throw new Error(statusMessage);
      }
      
      // Set state from custom claims (instant, no Firestore read needed!)
      setUserRole(claims.role);
      setUserPermissions(claims.permissions || []);
      setOrganizationId(claims.organizationId || null);
      setNeedsRoleAssignment(false);
      
      // Store in localStorage for API service access
      localStorage.setItem('userRole', claims.role);
      localStorage.setItem('organizationId', claims.organizationId || '');
      localStorage.setItem('userId', result.user.uid);
      
      toast.success('Signed in successfully!');
      return result;
    } catch (error) {
      console.error('Signin error:', error);
      if (error.code === 'auth/configuration-not-found' || error.message.includes('demo')) {
        toast.error('Please configure Firebase to enable authentication');
      } else if (!error.message.includes('awaiting') && !error.message.includes('pending') && !error.message.includes('rejected')) {
        toast.error(error.message || 'Failed to sign in');
      }
      throw error;
    }
  };

  // Sign in with Google (using Custom Claims)
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get ID token with custom claims
      const tokenResult = await result.user.getIdTokenResult();
      const claims = tokenResult.claims;
      
      console.log('🔐 Google signin claims:', claims);
      
      // Check if user has role assigned (via custom claims)
      if (!claims.role || claims.status !== 'active') {
        // TEMPORARY WORKAROUND: If no custom claims, try to get role from Firestore
        console.log('⚠️ No custom claims found for Google signin, checking Firestore profile...');
        
        try {
          const profile = await userService.getProfile(result.user.uid);
          if (profile && profile.roleId && profile.status === 'active') {
            console.log('✅ Found role in Firestore profile:', profile.roleId);
            
            // Set state from Firestore profile (temporary workaround)
            setUserRole(profile.roleId);
            setUserPermissions(profile.permissions || []);
            setOrganizationId(profile.organizationId || null);
            setNeedsRoleAssignment(false);
            
            toast.success('Signed in with Google successfully!');
            return result;
          }
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
        }
        
        // If no role found in Firestore either, reject signin
        await signOut(auth);
        
        const statusMessage = !claims.role 
          ? 'Your account is awaiting role assignment by an administrator.'
          : claims.status === 'rejected'
          ? 'Your account access has been rejected. Please contact support.'
          : 'Your account is pending approval by an administrator.';
        
        toast.error(statusMessage);
        throw new Error(statusMessage);
      }
      
      // Set state from custom claims (instant!)
      setUserRole(claims.role);
      setUserPermissions(claims.permissions || []);
      setOrganizationId(claims.organizationId || null);
      setNeedsRoleAssignment(false);
      
      toast.success('Signed in with Google successfully!');
      return result;
    } catch (error) {
      console.error('Google signin error:', error);
      if (!error.message.includes('awaiting') && !error.message.includes('pending') && !error.message.includes('rejected')) {
        toast.error(error.message || 'Failed to sign in with Google');
      }
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserToken(null);
      setUserProfile(null);
      setUserRole(null);
      setUserPermissions([]);
      setOrganizationId(null);
      setNeedsRoleAssignment(false);
      
      // Clear localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('organizationId');
      localStorage.removeItem('userId');
      
      toast.success('Signed out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Get user token for API requests (not needed for direct Firebase)
  const getToken = async (forceRefresh = false) => {
    if (user) {
      try {
        const token = await user.getIdToken(forceRefresh);
        setUserToken(token);
        return token;
      } catch (error) {
        console.error('Token error:', error);
        return null;
      }
    }
    return null;
  };

  // Fetch user profile with RBAC data
  const fetchUserProfile = async () => {
    try {
      console.log('🔄 AuthContext: Fetching user profile...');
      const profile = await userService.getProfile(user?.uid);
      console.log('📋 AuthContext: Profile data:', profile);
      
      if (!profile) {
        console.log('📋 AuthContext: No profile found, creating new profile...');
        // Create basic profile for new user
        await userService.createProfile(user.uid, {
          email: user.email,
          displayName: user.displayName || user.email,
          uid: user.uid,
        });
        
        // Fetch the newly created profile
        const newProfile = await userService.getProfile(user.uid);
        setUserProfile(newProfile);
        setUserRole(newProfile?.role || null);
        setUserPermissions(newProfile?.permissions || []);
        setOrganizationId(newProfile?.organizationId || null);
        setNeedsRoleAssignment(!newProfile?.organizationId || !newProfile?.role);
        return newProfile;
      }
      
      console.log('🎭 AuthContext: Role data:', profile.role);
      console.log('🔒 AuthContext: Permissions:', profile.permissions);
      
      setUserProfile(profile);
      setUserRole(profile.role || null);
      setUserPermissions(profile.permissions || []);
      setOrganizationId(profile.organizationId || null);
      setNeedsRoleAssignment(!profile.organizationId || !profile.role);
      
      console.log('✅ AuthContext: State updated');
      return profile;
    } catch (error) {
      console.error('❌ AuthContext: Failed to fetch user profile:', error);
      return null;
    }
  };

  // Request access to organization
  const requestAccess = async (organizationId, message) => {
    try {
      // For now, we'll just update the user profile with organization request
      await userService.updateProfile(user.uid, {
        organizationId,
        status: 'pending',
        accessRequestMessage: message,
      });
      
      toast.success('Access request submitted successfully');
      // Refresh profile after request submission
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Failed to request access:', error);
      toast.error('Failed to submit access request. Please try again.');
      return false;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    console.log('🔍 hasAnyPermission called:', {
      requestedPermissions: permissions,
      userPermissions,
      userPermissionsLength: userPermissions?.length,
      result: permissions.some(permission => userPermissions.includes(permission))
    });
    return permissions.some(permission => userPermissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    const result = userRole === roleName;
    console.log('🔍 hasRole called:', {
      requestedRole: roleName,
      userRole,
      result
    });
    return result;
  };

  // Check if user is admin (org admin or super admin)
  const isAdmin = () => {
    const result = hasRole('org_admin') || hasRole('super_admin');
    console.log('🔍 isAdmin called:', {
      userRole,
      hasOrgAdmin: hasRole('org_admin'),
      hasSuperAdmin: hasRole('super_admin'),
      result
    });
    return result;
  };

  // Refresh token when it expires (not needed for direct Firebase)
  const refreshToken = async () => {
    if (user) {
      try {
        console.log('🔄 Refreshing expired token...');
        const token = await user.getIdToken(true); // Force refresh
        setUserToken(token);
        toast.success('Session refreshed successfully');
        return token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        toast.error('Session expired. Please sign in again.');
        await logout();
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // PRIORITY 1: Try to load from localStorage first (instant!)
          const cachedRole = localStorage.getItem('userRole');
          const cachedOrgId = localStorage.getItem('organizationId');
          
          if (cachedRole && cachedOrgId) {
            console.log('⚡ Loading from localStorage cache:', { role: cachedRole, orgId: cachedOrgId });
            setUserRole(cachedRole);
            setOrganizationId(cachedOrgId);
            // We'll validate this with Firestore below
          }
          
          // Get ID token with custom claims
          const tokenResult = await user.getIdTokenResult();
          const token = tokenResult.token;
          const claims = tokenResult.claims;
          
          setUserToken(token);
          
          console.log('👤 Auth state changed - User claims:', claims);
          
          // Load role and permissions from custom claims (instant!)
          if (claims.role && claims.status === 'active') {
            console.log('✅ Using custom claims from token');
            setUserRole(claims.role);
            setUserPermissions(claims.permissions || []);
            setOrganizationId(claims.organizationId || null);
            setNeedsRoleAssignment(false);
            
            // Persist to localStorage
            localStorage.setItem('userRole', claims.role);
            localStorage.setItem('organizationId', claims.organizationId || '');
            localStorage.setItem('userId', user.uid);
            
            // Optional: Also fetch full profile from Firestore in background
            // This keeps profile data (name, etc) up to date without blocking login
            fetchUserProfile().catch(err => {
              console.log('Background profile fetch failed:', err);
            });
          } else {
            // AGGRESSIVE FALLBACK: Always try to get role from Firestore
            console.log('⚠️ No custom claims in auth state change, fetching from Firestore...');
            
            try {
              const profile = await userService.getProfile(user.uid);
              console.log('📋 Firestore profile:', profile);
              
              if (profile && profile.roleId && profile.status === 'active') {
                console.log('✅ Found active role in Firestore profile:', profile.roleId);
                
                // Set state from Firestore profile
                setUserRole(profile.roleId);
                setUserPermissions(profile.permissions || []);
                setOrganizationId(profile.organizationId || null);
                setNeedsRoleAssignment(false);
                
                // Persist to localStorage
                localStorage.setItem('userRole', profile.roleId);
                localStorage.setItem('organizationId', profile.organizationId || '');
                localStorage.setItem('userId', user.uid);
                
                console.log('✅ Auth context updated from Firestore:', { 
                  role: profile.roleId, 
                  org: profile.organizationId 
                });
              } else {
                console.log('⚠️ No active role found in Firestore');
                // No role found - user needs role assignment
                setUserRole(null);
                setUserPermissions([]);
                setOrganizationId(null);
                setNeedsRoleAssignment(true);
              }
            } catch (profileError) {
              console.error('❌ Failed to fetch profile in auth state change:', profileError);
              // If we have cached values, keep using them
              if (cachedRole && cachedOrgId) {
                console.log('⚠️ Using cached values despite Firestore error');
                setUserRole(cachedRole);
                setOrganizationId(cachedOrgId);
                setNeedsRoleAssignment(false);
              } else {
                // No role found - user needs role assignment
                setUserRole(null);
                setUserPermissions([]);
                setOrganizationId(null);
                setNeedsRoleAssignment(true);
              }
            }
          }
          
        } catch (error) {
          console.error('❌ Failed to get token:', error);
        }
      } else {
        setUserToken(null);
        setUserProfile(null);
        setUserRole(null);
        setUserPermissions([]);
        setOrganizationId(null);
        setNeedsRoleAssignment(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auto-refresh token every 50 minutes (tokens expire after 1 hour) - not needed for direct Firebase
  useEffect(() => {
    let interval;
    
    if (user) {
      interval = setInterval(async () => {
        try {
          console.log('🔄 Auto-refreshing token...');
          const token = await user.getIdToken(true); // force refresh
          setUserToken(token);
          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.error('❌ Auto token refresh error:', error);
          toast.error('Session expired. Please sign in again.');
        }
      }, 50 * 60 * 1000); // 50 minutes - more conservative
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user]);

  const value = {
    user,
    userId: user?.uid, // Add userId for convenience
    userToken,
    userProfile,
    userRole,
    userPermissions,
    organizationId,
    needsRoleAssignment,
    signup,
    signin,
    signInWithGoogle,
    logout,
    getToken,
    refreshToken,
    fetchUserProfile,
    requestAccess,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
