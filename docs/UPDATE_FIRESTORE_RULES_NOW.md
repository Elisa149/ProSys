# 🚨 CRITICAL: Update Firestore Security Rules NOW

## ⚠️ **Your App Cannot Work Without This Step**

The error "Missing or insufficient permissions" means your Firestore security rules are blocking all access.

---

## 🔥 **STEP-BY-STEP: Update Firebase Rules**

### **Step 1: Go to Firebase Console**
https://console.firebase.google.com/project/fam-rent-sys/firestore/rules

### **Step 2: Replace ALL Rules with This:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile (needed for login check)
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties - users can only access their own properties
    match /properties/{propertyId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Rent records - users can only access rent for their properties
    match /rent/{rentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    
    // Payments - users can only access payments for their properties
    match /payments/{paymentId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    
    // Tenants - users can only access tenants for their properties
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### **Step 3: Click "Publish"**

---

## ✅ **After Publishing Rules:**

1. **Hard refresh browser**: `Ctrl + Shift + R`
2. **Or test in incognito mode**
3. **Try logging in again**

---

## 🎯 **What These Rules Do:**

- ✅ Allow users to read their OWN profile (needed for role checking)
- ✅ Allow users to access their OWN properties
- ✅ Allow users to access their OWN payments
- ✅ Allow users to access their OWN rent records
- ✅ Allow users to access their OWN tenants
- ❌ Block access to OTHER users' data

---

## 🔍 **How to Verify Rules Are Applied:**

After publishing:
1. Go to: https://console.firebase.google.com/project/fam-rent-sys/firestore/rules
2. You should see the rules above
3. Status should show: "Last published: [recent timestamp]"

---

## 🚨 **THIS IS BLOCKING YOUR ENTIRE APP**

Until you update these rules:
- ❌ Cannot read user profiles
- ❌ Cannot access properties
- ❌ Cannot see payments
- ❌ Cannot view dashboard
- ❌ Login checks won't work

**UPDATE THE RULES NOW!** 🔥


