# 🔒 Role-Based Authentication Flow

## 📋 **Overview**

This system implements a **strict role-based authentication** where users CANNOT access the system until an administrator assigns them a role and approves their account.

---

## 🔄 **Complete Authentication Flow**

### **Step 1: User Registration**

1. User visits `/register`
2. Fills in:
   - Email
   - Password
   - Display Name
3. Clicks "Sign Up"
4. System creates:
   - Firebase Authentication account
   - Firestore user profile with:
     ```javascript
     {
       email: "user@example.com",
       displayName: "User Name",
       status: "pending",        // ⚠️ Blocked from login
       roleId: null,             // ⚠️ No role assigned
       organizationId: null,     // ⚠️ No organization
       permissions: [],
       createdAt: timestamp
     }
     ```
5. **User is immediately signed out**
6. Message shown: "Account created! Please wait for admin approval before logging in."

### **Step 2: User Attempts Login (BLOCKED)**

1. User tries to login
2. Firebase authenticates credentials ✅
3. System checks Firestore profile:
   ```javascript
   if (!profile.roleId || profile.status === 'pending') {
     // Sign out immediately
     await signOut(auth);
     // Show error message
     throw Error('Your account is awaiting role assignment by an administrator.');
   }
   ```
4. **Login is blocked** ❌
5. User sees error message
6. User remains logged out

### **Step 3: Administrator Assigns Role**

1. Admin logs in (must have `users:update:organization` permission)
2. Navigates to **User Management** page
3. Sees list of pending users
4. For each user, admin can:
   - Assign a role (Super Admin, Org Admin, Property Manager, Financial Viewer)
   - Assign to an organization
   - Set status to `active`
5. Admin saves changes:
   ```javascript
   {
     roleId: "role-id-here",
     organizationId: "org-id-here",
     status: "active",           // ✅ Now allowed to login
     permissions: [...],          // Inherited from role
     approvedBy: "admin-uid",
     approvedAt: timestamp
   }
   ```

### **Step 4: User Can Now Login**

1. User tries to login again
2. Firebase authenticates credentials ✅
3. System checks Firestore profile:
   ```javascript
   if (profile.roleId && profile.status === 'active') {
     // Allow login ✅
     return result;
   }
   ```
4. **Login succeeds** ✅
5. User is redirected to dashboard
6. Navigation and permissions based on assigned role

---

## 🚫 **Login Blocking Conditions**

Users are **blocked from logging in** if ANY of these conditions are true:

| Condition | Status | Message |
|-----------|--------|---------|
| `roleId === null` | ❌ Blocked | "Your account is awaiting role assignment by an administrator." |
| `status === 'pending'` | ❌ Blocked | "Your account is pending approval by an administrator." |
| `status === 'rejected'` | ❌ Blocked | "Your account access has been rejected. Please contact support." |
| `status !== 'active'` | ❌ Blocked | "Your account is not active. Please contact support." |
| `roleId && status === 'active'` | ✅ Allowed | User can login |

---

## 👥 **User Statuses**

### **`pending`** (Default for new users)
- User has registered but not yet approved
- Cannot login
- Waiting for admin to assign role

### **`active`** (Approved users)
- User has been approved by admin
- Has assigned role and organization
- Can login and access system

### **`rejected`** (Denied users)
- Admin has rejected the user's access
- Cannot login
- Must contact support

### **`inactive`** (Suspended users)
- Previously active but now suspended
- Cannot login
- May be reactivated by admin

---

## 🎯 **Implementation Details**

### **Files Modified:**

1. **`src/contexts/AuthContext.jsx`**
   - `signup()` - Creates user with `pending` status, signs out immediately
   - `signin()` - Checks role and status before allowing login
   - `signInWithGoogle()` - Same checks as email/password login

2. **`src/services/firebaseService.js`**
   - `createProfile()` - Uses `setDoc` to create new user profile
   - Includes all required fields (status, roleId, organizationId, permissions)

### **Key Functions:**

```javascript
// Sign up - Creates pending user
const signup = async (email, password, displayName) => {
  // Create Firebase Auth account
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create Firestore profile with pending status
  await userService.createProfile(result.user.uid, {
    status: 'pending',
    roleId: null,
    organizationId: null,
    permissions: []
  });
  
  // Sign out immediately
  await signOut(auth);
};

// Sign in - Checks role and status
const signin = async (email, password) => {
  // Authenticate with Firebase
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // Get user profile
  const profile = await userService.getProfile(result.user.uid);
  
  // Block if no role or not active
  if (!profile.roleId || profile.status !== 'active') {
    await signOut(auth);
    throw new Error('Account awaiting approval');
  }
  
  // Allow login
  return result;
};
```

---

## 📊 **Admin User Management**

Admins can manage users through the **User Management** page:

### **View Pending Users:**
```javascript
// Get all users in organization
const users = await userService.getUsersByOrganization(organizationId);

// Filter pending users
const pendingUsers = users.filter(user => 
  user.status === 'pending' || !user.roleId
);
```

### **Approve User:**
```javascript
await userService.updateUserRole(userId, roleId, permissions);
await userService.updateProfile(userId, {
  status: 'active',
  organizationId: organizationId,
  approvedBy: adminUserId,
  approvedAt: new Date()
});
```

### **Reject User:**
```javascript
await userService.updateProfile(userId, {
  status: 'rejected',
  rejectedBy: adminUserId,
  rejectedAt: new Date(),
  rejectionReason: 'Reason here'
});
```

---

## ✅ **Benefits of This Approach**

1. **🔒 Security**: No unauthorized access to the system
2. **👮 Control**: Admins have full control over who can access
3. **📋 Audit Trail**: Track who approved/rejected users
4. **🎯 Role-Based**: Proper role assignment before access
5. **🚫 Prevention**: Blocks access at login, not after

---

## 🧪 **Testing the Flow**

### **Test 1: New User Registration**
```
1. Go to /register
2. Create account: test@example.com / Test123!
3. Should see: "Account created! Please wait for admin approval"
4. Try to login → Should be blocked
5. Message: "Your account is awaiting role assignment"
```

### **Test 2: Admin Approval**
```
1. Login as admin (admin@propertytest.com)
2. Go to User Management
3. Find pending user
4. Assign role and set status to 'active'
5. Save changes
```

### **Test 3: User Can Now Login**
```
1. Login as test@example.com
2. Should succeed ✅
3. Dashboard loads with appropriate permissions
```

---

## 🔧 **Firestore Security Rules**

Make sure your Firestore rules allow users to read their own profile:

```javascript
match /users/{userId} {
  // Users can read their own profile (to check status)
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Only admins can write
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.hasAny([
      'users:update:organization'
    ]);
}
```

---

## 📚 **Related Documentation**

- `docs/RBAC_SYSTEM_DESIGN.md` - Complete RBAC system design
- `docs/TEST_ACCOUNTS_CREDENTIALS.md` - Test account credentials
- `docs/MANUAL_ROLE_ASSIGNMENT_WORKFLOW.md` - Manual role assignment guide

---

**This ensures that ONLY approved users with assigned roles can access the Property Management System!** 🔒✅


