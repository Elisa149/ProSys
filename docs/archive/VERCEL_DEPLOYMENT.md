# Vercel Deployment Guide

This guide will help you deploy your Property Management System to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your Firebase project configuration
3. GitHub repository containing your code

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure all your code is pushed to your GitHub repository.

### 2. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite as the framework

### 3. Configure Environment Variables

**⚠️ CRITICAL:** You MUST configure these environment variables in Vercel for your app to work:

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add the following variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Where to find these values:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app (or create one if it doesn't exist)
6. Copy the `firebaseConfig` values

**Example:**
```javascript
// From Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy...",           // → VITE_FIREBASE_API_KEY
  authDomain: "example.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",          // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "your-project.appspot.com", // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",        // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123",      // → VITE_FIREBASE_APP_ID
  measurementId: "G-XXXXXXXXXX"         // → VITE_FIREBASE_MEASUREMENT_ID
};
```

3. Select **ALL** environments (Production, Preview, Development)
4. Click **Save**

### 4. Build Settings

Vercel should auto-detect these settings from `vercel.json`, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 5. Deploy

1. Click **Deploy** button
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Troubleshooting

### Blank Page Issue

If you see a blank page:

1. **Check Environment Variables**: Most common cause is missing Firebase env vars
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure all `VITE_FIREBASE_*` variables are set
   - Redeploy after adding variables

2. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Common errors:
     - "Missing required Firebase environment variables"
     - Network errors (CORS issues)
     - Firebase initialization errors

3. **Rebuild and Redeploy**:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment

### Build Fails

If the build fails:

1. Check build logs in Vercel Dashboard
2. Common issues:
   - Missing dependencies (run `npm install` locally and push)
   - Linter errors (check `package.json` scripts)
   - TypeScript errors (if applicable)

### Environment Variables Not Working

1. **Clear cache**: Vercel caches some data, try redeploying
2. **Verify format**: Ensure no extra spaces or quotes
3. **Redeploy after changes**: Changes to env vars require a new deployment

## Post-Deployment

### 1. Verify Firestore Rules

Ensure your Firestore security rules are deployed:

1. Go to Firebase Console → Firestore Database → Rules
2. Verify your rules are set according to `firestore-complete.rules`
3. Test your deployed app with different user roles

### 2. Configure Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### 3. Monitor Performance

- Use Vercel Analytics (optional)
- Monitor Firebase usage in Firebase Console
- Check Vercel build logs for warnings

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] No sensitive keys are committed to Git
- [ ] Firestore security rules are configured
- [ ] Firebase Authentication is properly configured
- [ ] CORS settings in Firebase are correct
- [ ] API keys are restricted in Firebase Console

## Support

If issues persist:

1. Check Vercel Documentation: https://vercel.com/docs
2. Check Vite Documentation: https://vitejs.dev
3. Review Firebase logs in Console
4. Check browser DevTools for runtime errors

## Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com)
- [Project Repository](your-github-repo-url)

