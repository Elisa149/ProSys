# 🚀 Quick Start Guide - See Database Data

## ✅ What's Already Done

I've fixed the errors and deployed:
- ✅ Fixed PropertiesPage.jsx error
- ✅ Deployed Firestore security rules
- ✅ Deployed Firestore indexes
- ✅ Added debug panel to show auth state
- ✅ Confirmed database has 2 properties

## 📱 Steps to See Your Data

### 1. Open Your App

Your dev server is running on: **http://localhost:5174**

Open this URL in your browser.

### 2. Check Browser Console

Press **F12** to open Developer Tools, then check the Console tab for:

- Look for `🔥 Firebase Config:` - This shows if Firebase is connected
- If you see `undefined` values → You need to set up `.env` file (see Step 3)
- If values are present → Continue to Step 4

### 3. Set Up Firebase Configuration (If Needed)

**Option A: Quick Setup (Try First)**

Your app might work with these temporary credentials. Create a file named `.env` in the root directory:

```env
VITE_FIREBASE_API_KEY=AIzaSyDhK8qV3TqYQz9ZxX8gH_vJ5R9YpXqNpMk
VITE_FIREBASE_AUTH_DOMAIN=fam-rent-sys.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fam-rent-sys
VITE_FIREBASE_STORAGE_BUCKET=fam-rent-sys.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=486847309168
VITE_FIREBASE_APP_ID=1:486847309168:web:8a2b5c3d4e5f6g7h8i9j
```

**After creating .env:**
- Stop the dev server (Ctrl+C in terminal)
- Run: `npm run dev`
- Refresh browser

**Option B: Get Real Credentials (If Option A doesn't work)**

1. Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general
2. Scroll to "Your apps" section
3. Click on your web app (or create one if none exists)
4. Copy the `firebaseConfig` values
5. Update the `.env` file with real values

### 4. Login with Test Account

Once the app loads, login with:

**Super Admin (sees all properties):**
- Email: `superadmin@propertytest.com`
- Password: `SuperAdmin123!`

**Or Property Manager:**
- Email: `manager@propertytest.com`
- Password: `Manager123!`

**Or Your Account:**
- Email: `elisasaychitoleko2@gmail.com`
- Role: property_manager

### 5. Navigate to Properties Page

After login:
1. Click on "Properties" in the sidebar
2. You should see:
   - **Orange debug panel** at the top
   - **Your auth information** (User ID, Email, Role, Organization ID)
   - **2 properties** below (ELISA SSEKUTOLEKO buildings)

### 6. What the Debug Panel Shows

The debug panel displays:
- ✅ **Green checkmarks** = Everything is configured correctly
- ❌ **Red X marks** = Something is missing

**All must be green:**
- ✓ Logged In
- ✓ Has Role  
- ✓ Has Org (Organization ID: SVRDIbZ3ir7TmWfWWyXh)

## 🔍 Troubleshooting

### Problem: Don't see Firebase config in console

**Solution:** Create `.env` file (see Step 3)

### Problem: Can't login

**Solution:** 
- Check if Firebase is configured (see console for errors)
- Verify `.env` file exists and server was restarted
- Try the super admin account

### Problem: Login works but no properties shown

**Check these:**

1. **Debug panel shows all green?** 
   - If NO → Your role/organization is not set
   - If YES → Continue

2. **Check browser console for:**
   ```
   🔍 Fetching properties with: { userId, userRole, organizationId }
   ✅ Found X properties
   ```

3. **If you see "Found 0 properties":**
   - Your organizationId might not match
   - Try logging in as `superadmin@propertytest.com`

4. **If you see permission errors:**
   - Firestore rules might not be deployed
   - Run: `firebase deploy --only firestore:rules`

### Problem: Properties exist in database but don't show

**Solution:**

1. Check organization ID matches:
   - Properties have: `SVRDIbZ3ir7TmWfWWyXh`
   - Your user should have the same organization ID

2. Run the check script:
   ```bash
   node scripts/checkProperties.js
   ```

3. Verify your user's organization ID:
   ```bash
   node scripts/assignUserToOrganization.js
   ```

## 📊 Database Status

Your database currently has:
- ✅ **2 properties** (both ELISA SSEKUTOLEKO buildings)
- ✅ **6 users** with roles
- ✅ **Organization ID:** SVRDIbZ3ir7TmWfWWyXh

All users and properties have the same organization ID, so they should all see the properties!

## 🎯 Expected Result

When everything is working, you should see:

```
┌──────────────────────────────────────────┐
│ 🔍 Auth Debug Info                       │
│ User ID: abc123... ✓ Logged In          │
│ Email: your@email.com                    │
│ Role: property_manager ✓ Has Role       │
│ Organization ID: SVRDIbZ...  ✓ Has Org  │
│ Permissions: X permissions                │
│ ✅ All Good! Your authentication is...  │
└──────────────────────────────────────────┘

Properties Management
─────────────────────

[Property Cards showing 2 properties]
```

## ✅ Remove Debug Panel Later

Once everything works, remove the debug panel:

Open `src/pages/PropertiesPage.jsx` and delete:
- Line 47: `import AuthDebug from '../components/AuthDebug';`
- Line 228: `<AuthDebug />`

## 🆘 Still Having Issues?

1. Check browser console for specific error messages
2. Run: `node scripts/checkProperties.js` to verify database
3. Try logging in as super admin: `superadmin@propertytest.com`
4. Restart dev server after any .env changes

---

**Current Server:** http://localhost:5174
**Firebase Project:** fam-rent-sys
**Organization ID:** SVRDIbZ3ir7TmWfWWyXh

🎉 You should now be able to see your database data!

