/**
 * Check Database Data Script
 * This script checks what data exists in your Firestore database
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Firebase config from .env
const envPath = join(__dirname, '..', '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read .env file');
  process.exit(1);
}

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1] : null;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  CHECKING DATABASE DATA');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('🔥 Firebase Config:');
console.log('  Project:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('');

// Initialize Firebase
let app;
let db;
let auth;

try {
  // Use existing app if available, otherwise initialize
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log('');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

// Check collections
async function checkCollection(name, description) {
  try {
    console.log(`📋 Checking ${name}...`);
    const collectionRef = collection(db, name);
    const querySnapshot = await getDocs(query(collectionRef, limit(5)));
    
    console.log(`   ✅ Found ${querySnapshot.size} ${name} (showing first 5)`);
    
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📄 ID: ${doc.id}`);
        console.log(`      Data:`, JSON.stringify(data, null, 2));
        console.log('');
      });
    } else {
      console.log(`   ⚠️  No ${name} found in database`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error checking ${name}:`, error.message);
    console.log('');
  }
}

// Main function
async function main() {
  console.log('🔍 Checking Firestore collections...');
  console.log('');
  
  // Check each collection
  await checkCollection('properties', 'Properties');
  await checkCollection('payments', 'Payments');
  await checkCollection('rent', 'Rent records');
  await checkCollection('users', 'Users');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CHECK COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('💡 If you see no data in any collection, you need to add data first.');
  console.log('💡 You can add data through the app interface or Firebase Console.');
  console.log('');
}

main().catch(console.error);


