/**
 * Setup Environment Variables
 * This script creates the .env file for your frontend
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContent = `# Firebase Web App Configuration for ProSys
# Project: fam-rent-sys

VITE_FIREBASE_API_KEY=AIzaSyDhK8qV3TqYQz9ZxX8gH_vJ5R9YpXqNpMk
VITE_FIREBASE_AUTH_DOMAIN=fam-rent-sys.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fam-rent-sys
VITE_FIREBASE_STORAGE_BUCKET=fam-rent-sys.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=486847309168
VITE_FIREBASE_APP_ID=1:486847309168:web:8a2b5c3d4e5f6g7h8i9j
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
`;

const envPath = join(__dirname, '.env');

try {
  if (existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Backing up...');
    const backupPath = join(__dirname, '.env.backup');
    const existingContent = readFileSync(envPath, 'utf8');
    writeFileSync(backupPath, existingContent);
    console.log('✅ Backup saved to .env.backup');
  }
  
  writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('🔥 Firebase configuration is ready!');
  console.log('');
  console.log('⚠️  IMPORTANT: You need to get your actual Firebase Web App credentials');
  console.log('');
  console.log('📝 Steps to get your Firebase credentials:');
  console.log('1. Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general');
  console.log('2. Scroll to "Your apps" section');
  console.log('3. If no web app exists, click "Add app" and select Web (</>) icon');
  console.log('4. Register the app with a nickname (e.g., "ProSys Web")');
  console.log('5. Copy the firebaseConfig values');
  console.log('6. Replace the values in .env file');
  console.log('');
  console.log('✅ After updating .env:');
  console.log('   Stop your dev server (Ctrl+C)');
  console.log('   Run: npm run dev');
  console.log('');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('');
  console.log('📝 Please create .env file manually in the root directory with:');
  console.log('');
  console.log(envContent);
  console.log('');
}

