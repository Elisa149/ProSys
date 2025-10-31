/**
 * Firebase Cloud Functions for Property Management System
 * Handles Custom Claims for Role-Based Access Control
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Role permissions mapping
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
    'assignments:read:organization',
    'assignments:write:organization',
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

/**
 * Callable Function: Set Custom Claims for a User
 * Called by admins to assign roles and permissions
 */
exports.setUserClaims = functions.https.onCall(async (data, context) => {
  // Check if request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to call this function.',
    );
  }

  // Check if caller has admin privileges
  const callerToken = context.auth.token;
  if (!callerToken.role || (callerToken.role !== 'super_admin' && callerToken.role !== 'org_admin')) {
    throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can set user claims.',
    );
  }

  const {uid, roleId, organizationId, status} = data;

  // Validate input
  if (!uid || !roleId) {
    throw new functions.https.HttpsError(
        'invalid-argument',
        'uid and roleId are required.',
    );
  }

  // Get permissions for the role
  const permissions = ROLE_PERMISSIONS[roleId] || [];

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: roleId,
      permissions: permissions,
      organizationId: organizationId || null,
      status: status || 'active',
      updatedAt: Date.now(),
    });

    // Also update Firestore document
    await admin.firestore().collection('users').doc(uid).update({
      roleId: roleId,
      permissions: permissions,
      organizationId: organizationId || null,
      status: status || 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Custom claims set for user ${uid}: role=${roleId}`);

    return {
      success: true,
      message: `Successfully assigned role: ${roleId}`,
      uid: uid,
      role: roleId,
      permissionsCount: permissions.length,
    };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError(
        'internal',
        'Failed to set custom claims: ' + error.message,
    );
  }
});

/**
 * Firestore Trigger: Auto-set claims when user document is created
 */
exports.onUserCreated = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
      const userData = snap.data();
      const userId = context.params.userId;

      console.log(`New user document created: ${userId}`);

      // Only set claims if user has a role and is active
      if (userData.roleId && userData.status === 'active') {
        const permissions = ROLE_PERMISSIONS[userData.roleId] || [];

        try {
          await admin.auth().setCustomUserClaims(userId, {
            role: userData.roleId,
            permissions: permissions,
            organizationId: userData.organizationId || null,
            status: userData.status,
            updatedAt: Date.now(),
          });

          console.log(`Auto-assigned claims for new user ${userId}: role=${userData.roleId}`);
        } catch (error) {
          console.error(`Error setting claims for new user ${userId}:`, error);
        }
      } else {
        console.log(`User ${userId} created but no role assigned yet.`);
      }
    });

/**
 * Firestore Trigger: Auto-update claims when user document is updated
 */
exports.onUserUpdated = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const oldData = change.before.data();
      const userId = context.params.userId;

      // Check if role or status changed
      if (newData.roleId !== oldData.roleId ||
        newData.status !== oldData.status ||
        newData.organizationId !== oldData.organizationId) {
        console.log(`User ${userId} updated: role=${newData.roleId}, status=${newData.status}`);

        // Get permissions for the role
        const permissions = ROLE_PERMISSIONS[newData.roleId] || [];

        try {
          await admin.auth().setCustomUserClaims(userId, {
            role: newData.roleId,
            permissions: permissions,
            organizationId: newData.organizationId || null,
            status: newData.status,
            updatedAt: Date.now(),
          });

          console.log(`Auto-updated claims for user ${userId}`);
        } catch (error) {
          console.error(`Error updating claims for user ${userId}:`, error);
        }
      }
    });

/**
 * Callable Function: Get Current User Claims
 * Useful for debugging and verification
 */
exports.getUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.',
    );
  }

  try {
    const user = await admin.auth().getUser(context.auth.uid);
    return {
      uid: user.uid,
      email: user.email,
      customClaims: user.customClaims || {},
    };
  } catch (error) {
    throw new functions.https.HttpsError(
        'internal',
        'Failed to get user claims: ' + error.message,
    );
  }
});

/**
 * Callable Function: Refresh Token (force user to get new token with updated claims)
 */
exports.refreshUserToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.',
    );
  }

  // Just return success - client will call getIdToken(true) to force refresh
  return {
    success: true,
    message: 'Token refresh initiated. Please call getIdToken(true) on the client.',
  };
});

/**
 * HTTP Function: Health Check
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Property Management System Cloud Functions are running',
  });
});






