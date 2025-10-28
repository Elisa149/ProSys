# Fix Vercel Firebase Environment Variables Error

## The Problem

When deploying to Vercel, you're seeing these errors:
```
❌ Missing required Firebase environment variables: Array(4)
Firebase: Error (auth/invalid-api-key)
```

This happens because **environment variables are NOT automatically transferred from your local `.env` file to Vercel**. You need to manually add them in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Firebase Configuration

You need to get your Firebase Web App credentials. Choose one of these methods:

#### Option A: Use Firebase Console (Recommended)

1. Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general
2. Scroll down to **"Your apps"** section
3. If you see a web app (</> icon), click on it
4. If no web app exists:
   - Click the web icon: **</>**
   - Register the app with a nickname: "ProSys Web App"
   - Click **Register app**
5. Copy the `firebaseConfig` values shown

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fam-rent-sys.firebaseapp.com",
  projectId: "fam-rent-sys",
  storageBucket: "fam-rent-sys.appspot.com",
  messagingSenderId: "486847309168",
  appId: "1:486847309168:web:8a2b5c3d4e5f6g7h8i9j",
  measurementId: "G-XXXXXXXXXX"
};
```

#### Option B: Check Your Local Files

If you have a local `.env` file, check your project root for these files:
- `.env`
- `.env.local`
- `.env.production`

Look for variables starting with `VITE_FIREBASE_`

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (ProSys or fam-rent-sys)
3. Click on **Settings** (gear icon)
4. Click on **Environment Variables** in the left sidebar
5. Add each variable one by one:

   **Required Variables:**
   
   | Name | Value | Example |
   |------|-------|---------|
   | `VITE_FIREBASE_API_KEY` | Your API key | `AIzaSy...` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Your auth domain | `fam-rent-sys.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | Your project ID | `fam-rent-sys` |
   | `VITE_FIREBASE_APP_ID` | Your app ID | `1:486847309168:web:...` |

   **Optional (but recommended):**
   
   | Name | Value | Example |
   |------|-------|---------|
   | `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `fam-rent-sys.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `486847309168` |
   | `VITE_FIREBASE_MEASUREMENT_ID` | Analytics ID | `G-XXXXXXXXXX` |

6. For each variable:
   - Click **Add New**
   - Enter the **Variable Name** (e.g., `VITE_FIREBASE_API_KEY`)
   - Enter the **Value** (e.g., `AIzaSy...`)
   - Select **ALL** environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

### Step 3: Redeploy Your App

After adding all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **three dots (⋯)** on your latest deployment
3. Click **Redeploy**
4. Wait for the deployment to complete
5. Your app should now work correctly!

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Found or created web app configuration
- [ ] Copied all `firebaseConfig` values
- [ ] Opened Vercel Dashboard
- [ ] Went to Settings → Environment Variables
- [ ] Added all required variables:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET` (optional)
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` (optional)
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID` (optional)
- [ ] Selected ALL environments for each variable
- [ ] Redeployed the application
- [ ] Tested the app - no more Firebase errors!

## Common Issues

### "Still seeing errors after adding variables?"

1. **Wait a few minutes** - Vercel caches environment variables
2. **Verify all variables are correct** - Check for typos
3. **Make sure you selected ALL environments** - Don't just select Production
4. **Redeploy** - Changes require a new deployment

### "Where are my Firebase credentials?"

Check your local files:
```bash
# Windows PowerShell
Get-Content .env

# Check if files exist
ls .env*
```

If you don't have a `.env` file, create one using `setup-env.js`:
```bash
node setup-env.js
```

### "How do I know which credentials are correct?"

1. Go to Firebase Console
2. Project Settings → Your apps
3. Use the exact values shown in the Firebase config
4. Make sure you're using the WEB app config, not the Admin SDK config

## Testing

After deployment, check your browser console (F12):
- ✅ Should show: "🔥 Firebase Config:" with your values
- ✅ Should NOT show: "Missing required Firebase environment variables"
- ✅ Should NOT show: "auth/invalid-api-key"

## Security Note

⚠️ **Never commit your `.env` file to Git!**

Your `.gitignore` should already include `.env` files. The environment variables in Vercel are encrypted and secure.

## Need Help?

If you're still having issues:

1. Check Vercel deployment logs for errors
2. Check browser console for specific errors
3. Verify Firebase project ID matches
4. Ensure you're using the correct Firebase project

## Next Steps

Once Firebase is working:
1. Test user authentication
2. Check Firestore data access
3. Verify role-based access control
4. Test all app features


