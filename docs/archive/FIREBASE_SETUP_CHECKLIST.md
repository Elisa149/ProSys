# 🔥 Firebase Setup Checklist - fam-rent-sys

## ✅ **Current Status:**

- [x] Firebase project exists: `fam-rent-sys`
- [x] Environment variables configured in `.env`
- [ ] **Authentication enabled** (needs verification)
- [ ] **Firestore Database created** (needs verification)
- [ ] **Security Rules added** (needs verification)

---

## 🚀 **Complete These Steps:**

### **Step 1: Enable Authentication** ⚠️ **REQUIRED**

1. Go to: https://console.firebase.google.com/project/fam-rent-sys/authentication
2. Click **"Get started"** (if not already done)
3. Go to **"Sign-in method"** tab
4. Enable these providers:
   - ✅ **Email/Password** → Click → Toggle "Enable" → Save
   - ✅ **Google** (optional) → Click → Toggle "Enable" → Save

### **Step 2: Create Firestore Database** ⚠️ **REQUIRED**

1. Go to: https://console.firebase.google.com/project/fam-rent-sys/firestore
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (closest to you)
5. Click **"Enable"**

### **Step 3: Add Security Rules** ⚠️ **REQUIRED**

1. In Firestore → Click **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties collection
    match /properties/{propertyId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Rent collection
    match /rent/{rentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    
    // Tenants collection
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

### **Step 4: Restart Development Server** ⚠️ **REQUIRED**

After completing the above steps:

1. **Stop the current server**: Press `Ctrl+C` in the terminal
2. **Start again**: Run `yarn dev`
3. **Open browser**: http://localhost:5173

---

## 🧪 **Test Your Setup:**

### **Option 1: Register New Account**
1. Go to http://localhost:5173/register
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Should successfully create account

### **Option 2: Use Test Accounts**
After Firebase is set up, you can create these test accounts in Firebase Console:

```
Email: admin@propertytest.com
Password: TestAdmin123!
```

---

## ❌ **Common Errors & Solutions:**

### **Error: `auth/invalid-credential`**
- ✅ **Solution**: Enable Email/Password authentication in Firebase Console
- ✅ **Verify**: Go to Authentication → Sign-in method → Email/Password should be "Enabled"

### **Error: `permission-denied`**
- ✅ **Solution**: Add Firestore security rules (Step 3 above)
- ✅ **Verify**: Go to Firestore → Rules → Should see the rules above

### **Error: `Firebase: Error (auth/configuration-not-found)`**
- ✅ **Solution**: Create Firestore database (Step 2 above)
- ✅ **Verify**: Go to Firestore → Should see "Cloud Firestore" dashboard

---

## 📱 **Quick Links:**

- **Firebase Console**: https://console.firebase.google.com/project/fam-rent-sys
- **Authentication**: https://console.firebase.google.com/project/fam-rent-sys/authentication
- **Firestore**: https://console.firebase.google.com/project/fam-rent-sys/firestore
- **Project Settings**: https://console.firebase.google.com/project/fam-rent-sys/settings/general

---

## ✅ **After Setup:**

Once all steps are complete:
1. ✅ You can register new users
2. ✅ You can login with email/password
3. ✅ You can create properties, tenants, payments
4. ✅ All data is saved to Firebase Firestore
5. ✅ Real-time updates work automatically

---

**Need Help?** Check `docs/FIREBASE_DIRECT_SETUP.md` for detailed instructions!

