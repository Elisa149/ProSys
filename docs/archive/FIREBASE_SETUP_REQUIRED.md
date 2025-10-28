# 🔥 Firebase Configuration Setup Guide

## ⚠️ **Firebase Not Configured Error**

You're seeing `auth/invalid-credential` because Firebase hasn't been configured yet.

## 🚀 **Quick Setup (3 Steps):**

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or use existing project
3. Enable **Firestore Database** and **Authentication**

### **Step 2: Get Firebase Configuration**

1. In Firebase Console → Project Settings (⚙️ icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app (name: "Property Management System")
5. Copy the `firebaseConfig` object

### **Step 3: Create .env File**

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
   ```

3. **Restart the dev server**:
   ```bash
   # Press Ctrl+C to stop current server
   yarn dev
   ```

## 📋 **Enable Authentication Providers:**

In Firebase Console → Authentication → Sign-in method:
- ✅ Enable **Email/Password**
- ✅ Enable **Google** (optional)

## 🔒 **Add Firestore Security Rules:**

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /properties/{propertyId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    match /rent/{rentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## ✅ **Verification:**

After setup, you should be able to:
1. Register a new account
2. Login with email/password
3. No more `auth/invalid-credential` errors

## 📚 **Detailed Documentation:**

See `docs/FIREBASE_DIRECT_SETUP.md` for complete setup instructions.

---

**Need help?** Check the [Firebase Documentation](https://firebase.google.com/docs/web/setup)

