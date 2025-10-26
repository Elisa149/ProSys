# 🚀 Custom Claims Implementation - Setup Guide

## What We've Implemented

Firebase Custom Claims for instant, secure, role-based authentication without Firestore dependency.

---

## 📁 Files Created

1. **`functions/index.js`** - Cloud Functions for setting custom claims
2. **`functions/package.json`** - Functions dependencies
3. **`functions/.eslintrc.js`** - ESLint configuration
4. **`firebase.json`** - Firebase project configuration
5. **`.firebaserc`** - Firebase project ID
6. **Updated `src/contexts/AuthContext.jsx`** - Uses custom claims instead of Firestore

---

## 🎯 How It Works

### **Before (Old Way):**
```
1. User logs in
2. Fetch profile from Firestore ← SLOW, can fail
3. Load permissions from profile
4. Show sidebar
```

###  **After (Custom Claims):**
```
1. User logs in
2. Read claims from JWT token ← INSTANT, always works!
3. Permissions already in token
4. Show sidebar immediately
```

---

## 📋 Setup Steps

### **Step 1: Install Firebase Tools**

```bash
npm install -g firebase-tools
```

### **Step 2: Login to Firebase**

```bash
firebase login
```

### **Step 3: Install Functions Dependencies**

```bash
cd functions
npm install
cd ..
```

### **Step 4: Deploy Firebase Functions**

```bash
firebase deploy --only functions
```

This will deploy:
- `setUserClaims` - Admin function to assign roles
- `onUserCreated` - Auto-set claims when user is created
- `onUserUpdated` - Auto-update claims when user is updated
- `getUserClaims` - Get current user claims (debug)
- `healthCheck` - Health check endpoint

### **Step 5: Set Initial Claims for Existing Users**

You need to call the `setUserClaims` function for existing users.

**Option A: Firebase Console (Manual)**
1. Go to Firebase Console → Functions
2. Find `setUserClaims` function
3. Test it with data:
```json
{
  "uid": "jIO7WMHiQ9WkM2gUfwIhbbiqGL53",
  "roleId": "super_admin",
  "organizationId": "default-org",
  "status": "active"
}
```

**Option B: Using Firebase CLI**
```bash
firebase functions:shell
# Then in the shell:
setUserClaims({uid: 'jIO7WMHiQ9WkM2gUfwIhbbiqGL53', roleId: 'super_admin', organizationId: 'default-org', status: 'active'})
```

**Option C: Create Admin Script (See below)**

---

## 🛠️ Admin Script to Set Claims

Create this file: `scripts/setCustomClaims.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setClaimsForUser(email, roleId, organizationId = 'default-org') {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    const permissions = {
      super_admin: ['system:admin', 'users:read:all', /* ... */],
      org_admin: ['users:read:organization', /* ... */],
      property_manager: ['properties:read:assigned', /* ... */],
      financial_viewer: ['reports:read:organization', /* ... */],
    };
    
    await admin.auth().setCustomUserClaims(user.uid, {
      role: roleId,
      permissions: permissions[roleId] || [],
      organizationId: organizationId,
      status: 'active',
      updatedAt: Date.now(),
    });
    
    console.log(`✅ Claims set for ${email}: ${roleId}`);
  } catch (error) {
    console.error(`❌ Error:`, error);
  }
}

// Set claims for all test users
(async () => {
  await setClaimsForUser('superadmin@propertytest.com', 'super_admin');
  await setClaimsForUser('admin@propertytest.com', 'org_admin');
  await setClaimsForUser('manager@propertytest.com', 'property_manager');
  await setClaimsForUser('finance@propertytest.com', 'financial_viewer');
  
  console.log('✅ All claims set!');
  process.exit(0);
})();
```

Run with:
```bash
node scripts/setCustomClaims.js
```

---

## 🧪 Testing

### **Step 1: Deploy Functions**
```bash
firebase deploy --only functions
```

### **Step 2: Set Claims for Super Admin**

Use Firebase Console or CLI to call `setUserClaims`:
```json
{
  "uid": "jIO7WMHiQ9WkM2gUfwIhbbiqGL53",
  "roleId": "super_admin",
  "organizationId": "default-org",
  "status": "active"
}
```

### **Step 3: Hard Refresh Browser**
```
Ctrl + Shift + R
```

### **Step 4: Login**
```
Email: superadmin@propertytest.com
Password: SuperAdmin123!
```

### **Step 5: Check Console**

You should see:
```
🔐 User claims: {
  role: "super_admin",
  permissions: ["system:admin", "users:read:all", ...],
  organizationId: "default-org",
  status: "active"
}
```

### **Step 6: Verify Sidebar**

Should show all 17 navigation items instantly!

---

## ✅ Benefits

1. **No Firestore Read at Login** - Claims are in the JWT token
2. **Instant Login** - No waiting for database
3. **Always Works** - No security rules issues
4. **Secure** - Claims can only be set server-side
5. **Cached** - Token is valid for 1 hour

---

## 🔄 How Claims Update

### **When Admin Changes Role:**

1. Admin updates user document in Firestore
2. `onUserUpdated` trigger fires
3. Automatically updates custom claims
4. User gets new token on next refresh (or immediate with `getIdToken(true)`)

### **Force Token Refresh:**

```javascript
// In the app
await firebase.auth().currentUser.getIdToken(true);
```

---

## 💰 Pricing

Firebase Functions pricing:
- **Invocations**: 2 million free per month
- **Compute time**: 400,000 GB-seconds free per month
- **Outbound networking**: 5GB free per month

For your use case (setting claims), you'll likely stay in the free tier!

---

## 🐛 Troubleshooting

### **Claims Not Showing?**

1. Check functions are deployed:
```bash
firebase functions:list
```

2. Check function logs:
```bash
firebase functions:log
```

3. Force token refresh:
```javascript
await user.getIdToken(true);
```

### **"Unauthenticated" Error?**

Make sure you're calling `setUserClaims` from an admin account.

### **Old Permissions Still Showing?**

Clear browser cache and hard refresh, or call `getIdToken(true)`.

---

## 🎉 Success Indicators

- ✅ Login is instant (no Firestore read)
- ✅ Console shows claims object
- ✅ Sidebar shows correct items immediately
- ✅ No "permission denied" errors
- ✅ No "indexOf" errors

---

## 📞 Next Steps

1. Deploy functions: `firebase deploy --only functions`
2. Set claims for existing users
3. Test login with each role
4. Verify sidebar shows correct items
5. Celebrate! 🎉

**Status:** ✅ Implementation Complete - Ready to Deploy!



