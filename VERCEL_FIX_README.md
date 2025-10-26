# 🔥 Quick Fix for Vercel Firebase Error

## The Problem

Your Vercel deployment is showing:
```
❌ Missing required Firebase environment variables
Firebase: Error (auth/invalid-api-key)
```

## Why This Happens

Environment variables from your local `.env` file are **NOT automatically available** in Vercel. You must add them manually in the Vercel Dashboard.

## ✅ Quick Fix (5 minutes)

### Option 1: Use the Helper Script

Run this command in your terminal:
```bash
yarn show-vercel-env
```
or
```bash
npm run show-vercel-env
```

This will show you exactly what variables you need to add.

### Option 2: Manual Steps

1. **Get Your Firebase Credentials**
   - Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general
   - Scroll to "Your apps" section
   - Click on your web app (if none exists, create one)
   - Copy the `firebaseConfig` values

2. **Add to Vercel**
   - Go to: https://vercel.com/dashboard
   - Click your project
   - Go to: **Settings** → **Environment Variables**
   - Add these 4 **REQUIRED** variables:
     
     ```
     VITE_FIREBASE_API_KEY=your_api_key_here
     VITE_FIREBASE_AUTH_DOMAIN=fam-rent-sys.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=fam-rent-sys
     VITE_FIREBASE_APP_ID=your_app_id_here
     ```
   
   - For each variable:
     - Click "Add New"
     - Enter the name and value
     - **IMPORTANT:** Select ALL environments: ✅ Production ✅ Preview ✅ Development
     - Click Save

3. **Redeploy**
   - Go to **Deployments** tab
   - Click ⋯ on latest deployment
   - Click "Redeploy"
   - Wait for completion

## ✅ Done!

Your app should now work without Firebase errors.

## 📚 More Details

For detailed instructions, see:
- `docs/VERCEL_ENV_FIX.md` - Full guide with troubleshooting
- `docs/VERCEL_ENV_QUICK_FIX.txt` - Quick reference

## Common Issues

**Q: Where do I get these values?**
A: From Firebase Console → Project Settings → Your apps → Web app

**Q: Do I need all the variables?**
A: The 4 marked as REQUIRED are minimum. The rest are optional but recommended.

**Q: Still not working?**
A: Wait 2-3 minutes, then redeploy. Vercel caches environment variables.

## Next Steps

Once fixed, test:
- ✅ User login
- ✅ Data loading
- ✅ All app features

