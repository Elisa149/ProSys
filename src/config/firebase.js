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

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingEnvVars);
  console.error('Please ensure all Firebase environment variables are set in your Vercel project settings.');
}

// Debug: Log Firebase config in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', firebaseConfig);
  console.log('🔥 Environment Variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
  });
}

// Initialize Firebase
let app;
let auth;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  // Initialize Firebase Analytics (optional, only in browser)
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  throw error;
}

export { auth, db, analytics };
export default app;
