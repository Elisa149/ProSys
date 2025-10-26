# 🔧 Troubleshooting Login Errors

## Error: `Cannot read properties of undefined (reading 'indexOf')`

This error typically occurs when trying to fetch a user profile that doesn't exist in Firestore.

### Root Causes

1. **User exists in Firebase Authentication but NOT in Firestore `users` collection**
2. **User document exists but is missing required fields**
3. **Error handling is trying to parse an undefined error message**

---

## 🔍 Diagnostic Steps

### Step 1: Check Firebase Authentication Console

1. Go to Firebase Console → Authentication → Users
2. Verify the user exists: `superadmin@propertytest.com`
3. Note the User UID

### Step 2: Check Firestore Users Collection

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Look for a document with ID matching the User UID from Step 1

### Step 3: Verify User Document Structure

The user document should look like this:

```javascript
{
  uid: "jIO7WMHiQ9WkM2gUfwIhbbiqGL53",
  email: "superadmin@propertytest.com",
  displayName: "Super Admin",
  roleId: "super_admin",
  status: "active",
  permissions: [
    "users:read:all",
    "users:write:all",
    "properties:read:organization",
    "properties:write:organization",
    // ... more permissions
  ],
  organizationId: "org_001",
  createdAt: <Timestamp>,
  lastLoginAt: <Timestamp>
}
```

---

## 🛠️ Solutions

### Solution 1: Create Missing User Document

If the user exists in Authentication but NOT in Firestore:

1. Go to Firestore Database → `users` collection
2. Click "Add Document"
3. Set Document ID to the User UID (e.g., `jIO7WMHiQ9WkM2gUfwIhbbiqGL53`)
4. Add these fields:

```
Field: uid
Type: string
Value: jIO7WMHiQ9WkM2gUfwIhbbiqGL53

Field: email
Type: string
Value: superadmin@propertytest.com

Field: displayName
Type: string
Value: Super Admin

Field: roleId
Type: string
Value: super_admin

Field: status
Type: string  
Value: active

Field: permissions
Type: array
Values: (click "Add item" for each)
  - users:read:all
  - users:write:all
  - users:delete:all
  - properties:read:organization
  - properties:write:organization
  - properties:delete:organization
  - tenants:read:organization
  - tenants:write:organization
  - tenants:delete:organization
  - payments:read:organization
  - payments:write:organization
  - payments:create:organization
  - reports:read:organization
  - system:admin

Field: organizationId
Type: string
Value: org_001

Field: createdAt
Type: timestamp
Value: (current timestamp)

Field: lastLoginAt
Type: timestamp
Value: (current timestamp)
```

### Solution 2: Fix Existing User Document

If the user document exists but is incomplete:

1. Open the user document in Firestore
2. Ensure these fields exist:
   - `roleId`: "super_admin"
   - `status`: "active"
   - `permissions`: (array of permission strings)
   - `organizationId`: "org_001"

### Solution 3: Use Firebase Console to Set Password

If you're getting "invalid-credential" error:

1. Go to Firebase Console → Authentication → Users
2. Find the user: `superadmin@propertytest.com`
3. Click the three dots menu → "Reset password"
4. Set a new password: `SuperAdmin123!`
5. Try logging in again

---

## 📋 Complete Super Admin Setup

### Firebase Authentication
```
Email: superadmin@propertytest.com
Password: SuperAdmin123!
```

### Firestore Document (`users/[UID]`)
```javascript
{
  "uid": "jIO7WMHiQ9WkM2gUfwIhbbiqGL53",
  "email": "superadmin@propertytest.com",
  "displayName": "Super Admin",
  "roleId": "super_admin",
  "status": "active",
  "permissions": [
    "users:read:all",
    "users:write:all",
    "users:delete:all",
    "properties:read:organization",
    "properties:write:organization",
    "properties:delete:organization",
    "tenants:read:organization",
    "tenants:write:organization",
    "tenants:delete:organization",
    "payments:read:organization",
    "payments:write:organization",
    "payments:create:organization",
    "reports:read:organization",
    "system:admin"
  ],
  "organizationId": "org_001",
  "createdAt": "2025-10-24T12:00:00.000Z",
  "lastLoginAt": "2025-10-24T12:00:00.000Z"
}
```

---

## 🚀 Quick Fix Commands

If you want to test locally without proper setup:

### Option 1: Allow Registration to Create Profile

The system should automatically create a profile when a user logs in for the first time. The error suggests this is failing.

### Option 2: Manually Create in Firestore

See Solution 1 above.

---

## 🔍 Additional Debugging

### Check Firebase Config

Verify `src/config/firebase.js` has correct credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC7IltHmisfPRC55eVFZxX8aF_niT7Jf8A",
  authDomain: "fam-rent-sys.firebaseapp.com",
  projectId: "fam-rent-sys",
  storageBucket: "fam-rent-sys.firebasestorage.app",
  messagingSenderId: "143878786305",
  appId: "1:143878786305:web:08d8dc1f49063e3dc45f00",
  measurementId: "G-YN5JX52XS9"
};
```

### Check Firestore Security Rules

Make sure these rules are published:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Enable Console Logging

The AuthContext already has logging. Check browser console for:
- 🔄 "AuthContext: Fetching user profile..."
- 📋 "AuthContext: Profile data:"
- ❌ Any error messages

---

## ⚠️ Common Mistakes

1. **Wrong Password**: Passwords are case-sensitive
2. **UID Mismatch**: Firestore document ID must match Firebase Auth UID
3. **Missing `status: 'active'`**: User will be blocked if status is 'pending'
4. **Missing `roleId`**: User will be blocked if no role assigned
5. **Empty `permissions` array**: User won't have any access

---

## 📞 Still Having Issues?

### Check Browser Console

Look for these specific errors:
- `Firebase get user profile error` - Firestore read failed
- `Failed to fetch user profile` - Network or permission issue
- `auth/invalid-credential` - Wrong email/password
- `Missing or insufficient permissions` - Firestore rules issue

### Check Network Tab

1. Open DevTools → Network
2. Filter by "firestore"
3. Look for failed requests
4. Check response for error details

---

## ✅ Verification Steps

After fixing:

1. Clear browser cache and cookies
2. Refresh the page
3. Try logging in with: `superadmin@propertytest.com` / `SuperAdmin123!`
4. Check console for successful auth
5. Verify sidebar shows 17 navigation items
6. Check role badge shows "Super Admin"

---

**If none of these solutions work, the issue might be with Firebase project permissions or network connectivity.**



