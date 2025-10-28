/**
 * Get Firebase Web App Configuration
 * 
 * This script retrieves your Firebase web app configuration
 * and creates a .env file for your frontend
 * 
 * Usage: node scripts/getFirebaseConfig.js
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json'), 'utf8')
);

console.log('🔥 Firebase Project Configuration');
console.log('='.repeat(80));
console.log('');
console.log('📋 Project ID:', serviceAccount.project_id);
console.log('');
console.log('⚠️  To get your Web App credentials, follow these steps:');
console.log('');
console.log('1. Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general');
console.log('2. Scroll down to "Your apps" section');
console.log('3. If you don\'t have a web app, click "Add app" → Web');
console.log('4. Copy the firebaseConfig object values');
console.log('');
console.log('='.repeat(80));
console.log('');
console.log('📝 Create a .env file in the root directory with this content:');
console.log('');
console.log('# Copy the values from Firebase Console');
console.log('VITE_FIREBASE_API_KEY=AIza... (get from Firebase Console)');
console.log('VITE_FIREBASE_AUTH_DOMAIN=fam-rent-sys.firebaseapp.com');
console.log('VITE_FIREBASE_PROJECT_ID=fam-rent-sys');
console.log('VITE_FIREBASE_STORAGE_BUCKET=fam-rent-sys.appspot.com');
console.log('VITE_FIREBASE_MESSAGING_SENDER_ID=... (get from Firebase Console)');
console.log('VITE_FIREBASE_APP_ID=1:...:web:... (get from Firebase Console)');
console.log('VITE_FIREBASE_MEASUREMENT_ID=G-... (optional, get from Firebase Console)');
console.log('');
console.log('='.repeat(80));
console.log('');
console.log('✅ After creating .env, restart your dev server: npm run dev');
console.log('');

// Create a template .env file
const envTemplate = `# Firebase Configuration
# Get these values from: https://console.firebase.google.com/project/fam-rent-sys/settings/general
# Look for the firebaseConfig object in "Your apps" section

VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=fam-rent-sys.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fam-rent-sys
VITE_FIREBASE_STORAGE_BUCKET=fam-rent-sys.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id-here
`;

const envPath = join(__dirname, '../.env.template');
writeFileSync(envPath, envTemplate);

console.log('📄 Created .env.template file in root directory');
console.log('   Copy it to .env and fill in your Firebase credentials');
console.log('');

process.exit(0);



