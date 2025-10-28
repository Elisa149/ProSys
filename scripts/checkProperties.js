/**
 * Check Properties Script
 * 
 * This script checks what properties exist in Firestore
 * 
 * Usage: node scripts/checkProperties.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fam-rent-sys'
});

const db = admin.firestore();

async function checkProperties() {
  try {
    console.log('🔍 Checking properties in Firestore...\n');
    console.log('='.repeat(80));
    
    // Get all properties
    const propertiesSnapshot = await db.collection('properties').get();
    
    if (propertiesSnapshot.empty) {
      console.log('❌ No properties found in the database!');
      console.log('\n📝 This could mean:');
      console.log('   1. Properties were not successfully created');
      console.log('   2. The create operation failed silently');
      console.log('   3. There was a Firestore rules permission issue');
      return;
    }
    
    console.log(`✅ Found ${propertiesSnapshot.size} properties\n`);
    
    propertiesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Property ${index + 1}:`);
      console.log(`  📌 ID: ${doc.id}`);
      console.log(`  📝 Name: ${data.name}`);
      console.log(`  🏢 Type: ${data.type}`);
      console.log(`  🏛️  Organization ID: ${data.organizationId || 'NOT SET'}`);
      console.log(`  👥 Assigned Managers: ${JSON.stringify(data.assignedManagers || [])}`);
      console.log(`  📍 Location: ${data.location?.village}, ${data.location?.district}`);
      console.log(`  📅 Created: ${data.createdAt?.toDate?.() || 'Unknown'}`);
      console.log(`  ✨ Status: ${data.status || 'Unknown'}`);
      console.log('  ' + '-'.repeat(76));
    });
    
    // Get all users and their organizationIds
    console.log('\n👥 Checking users and their organization IDs...\n');
    const usersSnapshot = await db.collection('users').get();
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`User: ${data.email}`);
      console.log(`  Role: ${data.roleId || 'none'}`);
      console.log(`  Org ID: ${data.organizationId || 'NOT SET'}`);
      console.log('  ' + '-'.repeat(76));
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TROUBLESHOOTING:');
    console.log('='.repeat(80));
    console.log('If properties exist but don\'t show on the page, check:');
    console.log('  1. Does the property organizationId match your user organizationId?');
    console.log('  2. Is your user role set correctly (property_manager, org_admin, etc.)?');
    console.log('  3. Check browser console for any errors or debug logs');
    console.log('  4. Try hard refresh (Ctrl+Shift+R) to clear cache');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the script
console.log('🔐 Property Check Script');
console.log('=' .repeat(80));

checkProperties();


