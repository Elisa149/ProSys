# Quick Environment Variables Setup for Vercel

## Step-by-Step Guide

### 1. Get Your Firebase Config

1. Go to https://console.firebase.google.com
2. Select your project
3. Click the ⚙️ gear icon → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click on your **web app** (or create one if needed)
6. Copy the `firebaseConfig` values

### 2. Add Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add"** for each variable below:

#### Required Variables:

| Vercel Variable Name | Value (from Firebase Console) |
|---------------------|-------------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` value |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` value |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` value |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` value |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` value |
| `VITE_FIREBASE_APP_ID` | `appId` value |
| `VITE_FIREBASE_MEASUREMENT_ID` | `measurementId` value (optional) |

**IMPORTANT**: Select **ALL** environments (Production, Preview, Development) for each variable!

### 3. Example Mapping

From your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123xyz",           // → VITE_FIREBASE_API_KEY
  authDomain: "myapp.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "my-project-id",           // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "myapp.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",        // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123",      // → VITE_FIREBASE_APP_ID
  measurementId: "G-XXXXXXXXXX"         // → VITE_FIREBASE_MEASUREMENT_ID
};
```

### 4. Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete

### 5. Test Your App

Visit your app URL. You should now see:
- ✅ Login page loads
- ✅ No console errors
- ✅ Firebase initializes properly

## Troubleshooting

### Still seeing blank page?

1. **Open DevTools** (F12) in your browser
2. Go to **Console** tab
3. Look for error messages
4. Share those error messages

### Common Errors:

**"Missing required Firebase environment variables"**
→ You haven't added all env vars to Vercel yet

**"Firebase: Error (auth/unauthorized-domain)"**
→ Need to add your Vercel domain to Firebase Auth authorized domains

**"Network error"**
→ Check if you have any ad blockers or firewall issues

## Need Help?

If you're still having issues:
1. Take a screenshot of the browser console
2. Share the Vercel deployment logs
3. Let me know which step you're stuck on



