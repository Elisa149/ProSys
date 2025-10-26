import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Using environment variables for security and flexibility
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

// Check if we're in production (Vercel) and have missing variables
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;

if (missingEnvVars.length > 0) {
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('❌ MISSING FIREBASE ENVIRONMENT VARIABLES');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  console.error('Missing variables:', missingEnvVars);
  console.error('');
  console.error('This usually happens when deploying to Vercel without setting');
  console.error('environment variables in the Vercel Dashboard.');
  console.error('');
  console.error('📝 QUICK FIX:');
  console.error('1. Go to: https://vercel.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to: Settings → Environment Variables');
  console.error('4. Add these variables:', missingEnvVars.join(', '));
  console.error('5. For detailed instructions, run: yarn show-vercel-env');
  console.error('6. Redeploy your app');
  console.error('');
  console.error('📚 For more help, see: VERCEL_FIX_README.md');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
}

// Debug: Log Firebase config in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', firebaseConfig);
  console.log('🔥 Environment Variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
  });
}

// Don't initialize Firebase if required variables are missing in production
let app = null;
let auth = null;
let db = null;
let analytics = null;

if (missingEnvVars.length === 0 || !isProduction) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    
    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    
    // Initialize Firebase Analytics (optional, only in browser)
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('❌ ERROR INITIALIZING FIREBASE');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    if (error.code === 'auth/invalid-api-key') {
      console.error('This error usually means:');
      console.error('1. Wrong API key in environment variables');
      console.error('2. API key restrictions in Firebase Console');
      console.error('3. Domain not authorized in Firebase Console');
      console.error('');
      console.error('📝 Check your Firebase Console:');
      console.error('https://console.firebase.google.com/project/fam-rent-sys/settings/general');
      console.error('');
    }
    console.error('For detailed help, see: docs/VERCEL_ENV_FIX.md');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    
    // In production, don't crash the app
    if (isProduction) {
      console.error('⚠️  Firebase not initialized. Please add environment variables and redeploy.');
    } else {
      throw error;
    }
  }
} else if (isProduction) {
  console.error('⚠️  Skipping Firebase initialization due to missing environment variables.');
  console.error('⚠️  Your app may not function correctly until variables are added.');
}

export { auth, db, analytics };
export default app;
