/**
 * Show Vercel Environment Variables Script
 * This script displays what environment variables need to be set in Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to read local .env file
const envPaths = [
  join(__dirname, '..', '.env'),
  join(__dirname, '..', '.env.local'),
  join(__dirname, '..', '.env.production')
];

let envFile = null;
let envContent = '';

for (const path of envPaths) {
  if (existsSync(path)) {
    envFile = path;
    envContent = readFileSync(path, 'utf8');
    break;
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  VERCEL ENVIRONMENT VARIABLES SETUP');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (envFile) {
  console.log('✅ Found environment file:', envFile);
  console.log('');
  
  // Extract VITE_FIREBASE variables
  const firebaseVars = {
    'VITE_FIREBASE_API_KEY': /VITE_FIREBASE_API_KEY=(.+)/i,
    'VITE_FIREBASE_AUTH_DOMAIN': /VITE_FIREBASE_AUTH_DOMAIN=(.+)/i,
    'VITE_FIREBASE_PROJECT_ID': /VITE_FIREBASE_PROJECT_ID=(.+)/i,
    'VITE_FIREBASE_STORAGE_BUCKET': /VITE_FIREBASE_STORAGE_BUCKET=(.+)/i,
    'VITE_FIREBASE_MESSAGING_SENDER_ID': /VITE_FIREBASE_MESSAGING_SENDER_ID=(.+)/i,
    'VITE_FIREBASE_APP_ID': /VITE_FIREBASE_APP_ID=(.+)/i,
    'VITE_FIREBASE_MEASUREMENT_ID': /VITE_FIREBASE_MEASUREMENT_ID=(.+)/i
  };
  
  const extractedVars = {};
  
  for (const [varName, regex] of Object.entries(firebaseVars)) {
    const match = envContent.match(regex);
    if (match && match[1]) {
      extractedVars[varName] = match[1].trim();
    }
  }
  
  if (Object.keys(extractedVars).length > 0) {
    console.log('📋 Your Firebase Environment Variables:');
    console.log('');
    console.log('Copy and paste these into Vercel Environment Variables:');
    console.log('');
    
    for (const [varName, value] of Object.entries(extractedVars)) {
      // Mask sensitive values
      const maskedValue = varName.includes('API_KEY') && value.length > 20
        ? value.substring(0, 20) + '...' : value;
      
      console.log(`${varName}=${maskedValue}`);
    }
  } else {
    console.log('⚠️  No VITE_FIREBASE variables found in .env file');
    console.log('');
    console.log('📝 You need to add these variables manually:');
  }
} else {
  console.log('⚠️  No .env file found in project root');
  console.log('');
  console.log('📝 You need to add these variables manually to Vercel:');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  HOW TO ADD TO VERCEL');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Click on your project');
console.log('3. Go to: Settings → Environment Variables');
console.log('4. Click "Add New" for each variable');
console.log('5. Select ALL environments: ✅ Production ✅ Preview ✅ Development');
console.log('6. Click Save');
console.log('7. Go to Deployments → Redeploy');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  REQUIRED VARIABLES');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('These 4 variables are REQUIRED:');
console.log('');
console.log('  VITE_FIREBASE_API_KEY - Your Firebase API key');
console.log('  VITE_FIREBASE_AUTH_DOMAIN - fam-rent-sys.firebaseapp.com');
console.log('  VITE_FIREBASE_PROJECT_ID - fam-rent-sys');
console.log('  VITE_FIREBASE_APP_ID - Your Firebase app ID');
console.log('');
console.log('Optional but recommended:');
console.log('');
console.log('  VITE_FIREBASE_STORAGE_BUCKET - fam-rent-sys.appspot.com');
console.log('  VITE_FIREBASE_MESSAGING_SENDER_ID - Your sender ID');
console.log('  VITE_FIREBASE_MEASUREMENT_ID - Your Analytics ID');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  WHERE TO GET VALUES');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('Go to: https://console.firebase.google.com/project/fam-rent-sys/settings/general');
console.log('');
console.log('1. Scroll to "Your apps" section');
console.log('2. Click on the web app (</> icon)');
console.log('3. If no web app exists, click "Add app" → Select Web icon');
console.log('4. Copy the firebaseConfig values');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');

